import os
import sys
import glob
import json
import argparse
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

from gradcam import compute_gradcam, overlay_gradcam
from evaluate import evaluate_test_set

# Fix random seeds for reproducibility
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

VEGETABLE_CLASSES = ["Broccoli", "Cabbage", "Cauliflower", "Turnip"]

def parse_vegetable_and_disease(folder_name):
    """
    Parses folder name like 'Broccoli Alternaria leaf spot' or 'Cauliflower Yellow virus'
    Returns (vegetable_name, disease_name)
    """
    cleaned = folder_name.strip()
    for veg in VEGETABLE_CLASSES:
        if cleaned.lower().startswith(veg.lower()):
            disease = cleaned[len(veg):].strip()
            if not disease:
                disease = "Healthy leaf"
            return veg, disease
    # Default fallback if vegetable name isn't at start
    parts = cleaned.split(" ", 1)
    return parts[0], parts[1] if len(parts) > 1 else "Unknown"


def load_dataset_metadata(data_dir):
    """
    Scans data_dir subfolders, validates images, parses vegetable and disease classes.
    """
    image_paths = []
    disease_labels = []
    vegetable_labels = []
    
    # List valid class folders
    subdirs = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
    
    if not subdirs:
        raise ValueError(f"No subdirectories found in dataset directory: {data_dir}")
        
    class_names = subdirs
    veg_names = sorted(list(set([parse_vegetable_and_disease(d)[0] for d in class_names])))
    
    class_to_idx = {name: i for i, name in enumerate(class_names)}
    veg_to_idx = {name: i for i, name in enumerate(veg_names)}
    
    valid_extensions = ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.JPEG", "*.PNG")
    
    for c_name in class_names:
        c_dir = os.path.join(data_dir, c_name)
        veg_name, _ = parse_vegetable_and_disease(c_name)
        
        files = []
        for ext in valid_extensions:
            files.extend(glob.glob(os.path.join(c_dir, ext)))
            
        for f in files:
            image_paths.append(f)
            disease_labels.append(class_to_idx[c_name])
            vegetable_labels.append(veg_to_idx[veg_name])
            
    print(f"[+] Found {len(image_paths)} images across {len(class_names)} disease classes and {len(veg_names)} vegetable categories.")
    return image_paths, disease_labels, vegetable_labels, class_names, veg_names


def build_tf_dataset(image_paths, disease_labels, vegetable_labels, num_classes, num_vegs, batch_size=32, is_training=False):
    """
    Builds an optimized tf.data.Dataset pipeline with multi-output one-hot targets and augmentations.
    """
    def load_and_preprocess_image(path, dis_lbl, veg_lbl):
        img_bytes = tf.io.read_file(path)
        img = tf.image.decode_jpeg(img_bytes, channels=3)
        img = tf.image.resize(img, [224, 224])
        # MobileNetV3 expects pixels in [0, 255] or handled by keras preprocessing
        # tf.keras.applications.mobilenet_v3.preprocess_input leaves values in [0, 255]
        dis_one_hot = tf.one_hot(dis_lbl, depth=num_classes)
        veg_one_hot = tf.one_hot(veg_lbl, depth=num_vegs)
        return img, {"vegetable_output": veg_one_hot, "disease_output": dis_one_hot}

    # Data augmentation pipeline for training
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.1),
        tf.keras.layers.RandomContrast(0.1),
        tf.keras.layers.RandomBrightness(0.1),
    ], name="data_augmentation")

    dataset = tf.data.Dataset.from_tensor_slices((image_paths, disease_labels, vegetable_labels))
    
    if is_training:
        dataset = dataset.shuffle(buffer_size=len(image_paths), seed=SEED)
        
    dataset = dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if is_training:
        dataset = dataset.map(lambda x, y: (data_augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
        
    dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset


def build_two_head_mobilenetv3(num_veg_classes=4, num_disease_classes=17):
    """
    Builds a shared MobileNetV3-Small backbone with two prediction heads:
    1. Vegetable Head (e.g., 4 classes)
    2. Disease Head (e.g., 17 classes)
    """
    inputs = tf.keras.layers.Input(shape=(224, 224, 3), name="input_layer")
    
    # MobileNetV3 Small Backbone pre-trained on ImageNet
    # Includes Rescaling / Preprocessing layer
    preprocessed = tf.keras.applications.mobilenet_v3.preprocess_input(inputs)
    backbone = tf.keras.applications.MobileNetV3Small(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
        include_preprocessing=False
    )
    
    features = backbone(preprocessed)
    features = tf.keras.layers.BatchNormalization(name="shared_bn")(features)
    features = tf.keras.layers.Dropout(0.3, name="shared_dropout")(features)
    
    # Head 1: Vegetable Category
    veg_dense = tf.keras.layers.Dense(64, activation="relu", name="veg_fc")(features)
    veg_dense = tf.keras.layers.Dropout(0.2, name="veg_dropout")(veg_dense)
    veg_out = tf.keras.layers.Dense(num_veg_classes, activation="softmax", name="vegetable_output")(veg_dense)
    
    # Head 2: Disease / Health Condition
    dis_dense = tf.keras.layers.Dense(128, activation="relu", name="disease_fc")(features)
    dis_dense = tf.keras.layers.Dropout(0.3, name="disease_dropout")(dis_dense)
    dis_out = tf.keras.layers.Dense(num_disease_classes, activation="softmax", name="disease_output")(dis_dense)
    
    model = tf.keras.Model(inputs=inputs, outputs={"vegetable_output": veg_out, "disease_output": dis_out}, name="LeafScan_MobileNetV3Small")
    return model, backbone


def train_leafscan(data_dir, output_dir="results", batch_size=32, stage1_epochs=15, stage2_epochs=20):
    """
    End-to-end training pipeline with 2-stage training, class weights, early stopping, and test evaluation.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load and parse dataset
    image_paths, disease_labels, vegetable_labels, class_names, veg_names = load_dataset_metadata(data_dir)
    num_disease_classes = len(class_names)
    num_veg_classes = len(veg_names)
    
    # Save label mappings for frontend and inference
    veg_to_disease_map = {}
    for c_name in class_names:
        v_name, d_name = parse_vegetable_and_disease(c_name)
        if v_name not in veg_to_disease_map:
            veg_to_disease_map[v_name] = []
        veg_to_disease_map[v_name].append(d_name)
        
    labels_info = {
        "disease_classes": class_names,
        "vegetable_classes": veg_names,
        "vegetable_to_diseases": veg_to_disease_map,
        "total_classes": num_disease_classes
    }
    with open(os.path.join(output_dir, "labels.json"), "w") as f:
        json.dump(labels_info, f, indent=2)
    print(f"[+] Saved class mapping to {os.path.join(output_dir, 'labels.json')}")

    # 2. Stratified Split 70% Train / 15% Val / 15% Test
    paths_train, paths_temp, y_dis_train, y_dis_temp, y_veg_train, y_veg_temp = train_test_split(
        image_paths, disease_labels, vegetable_labels,
        test_size=0.30,
        stratify=disease_labels,
        random_state=SEED
    )
    
    paths_val, paths_test, y_dis_val, y_dis_test, y_veg_val, y_veg_test = train_test_split(
        paths_temp, y_dis_temp, y_veg_temp,
        test_size=0.50,
        stratify=y_dis_temp,
        random_state=SEED
    )
    
    print(f"[+] Dataset Split: Train={len(paths_train)}, Val={len(paths_val)}, Test={len(paths_test)}")

    # 3. Compute Class Weights for Disease Head (handling class imbalance)
    class_weights_arr = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(y_dis_train),
        y=y_dis_train
    )
    disease_class_weights = {i: float(w) for i, w in enumerate(class_weights_arr)}
    print(f"[+] Computed balanced class weights for {num_disease_classes} disease categories.")

    # 4. Create tf.data Pipelines
    train_ds = build_tf_dataset(paths_train, y_dis_train, y_veg_train, num_disease_classes, num_veg_classes, batch_size=batch_size, is_training=True)
    val_ds = build_tf_dataset(paths_val, y_dis_val, y_veg_val, num_disease_classes, num_veg_classes, batch_size=batch_size, is_training=False)
    test_ds = build_tf_dataset(paths_test, y_dis_test, y_veg_test, num_disease_classes, num_veg_classes, batch_size=batch_size, is_training=False)

    # 5. Build Model
    model, backbone = build_two_head_mobilenetv3(num_veg_classes, num_disease_classes)
    model.summary()

    # =========================================================================
    # STAGE 1: Train Classification Heads with Backbone Frozen
    # =========================================================================
    print("\n" + "="*60)
    print("STAGE 1: Training Classification Heads (Backbone Frozen)")
    print("="*60)
    
    backbone.trainable = False
    
    losses = {
        "vegetable_output": "categorical_crossentropy",
        "disease_output": "categorical_crossentropy"
    }
    loss_weights = {
        "vegetable_output": 0.3,
        "disease_output": 1.0
    }
    metrics = {
        "vegetable_output": ["accuracy"],
        "disease_output": ["accuracy"]
    }
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=losses,
        loss_weights=loss_weights,
        metrics=metrics
    )

    checkpoint_path = os.path.join(output_dir, "best_leafscan_model.keras")
    callbacks_stage1 = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_disease_output_accuracy", 
            patience=5, 
            restore_best_weights=True,
            mode="max"
        )
    ]

    # Map disease weights into dictionary for Keras fit
    stage1_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage1_epochs,
        callbacks=callbacks_stage1,
        class_weight={"disease_output": disease_class_weights}
    )

    # =========================================================================
    # STAGE 2: Fine-Tuning Backbone with Low Learning Rate
    # =========================================================================
    print("\n" + "="*60)
    print("STAGE 2: Fine-Tuning MobileNetV3-Small Top Layers")
    print("="*60)
    
    # Unfreeze top layers of the backbone
    backbone.trainable = True
    fine_tune_at = int(len(backbone.layers) * 0.7)
    for layer in backbone.layers[:fine_tune_at]:
        layer.trainable = False
        
    print(f"[+] Unfrozen {len(backbone.layers) - fine_tune_at} / {len(backbone.layers)} backbone layers for fine-tuning.")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss=losses,
        loss_weights=loss_weights,
        metrics=metrics
    )

    callbacks_stage2 = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_disease_output_accuracy", 
            patience=6, 
            restore_best_weights=True,
            mode="max"
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor="val_disease_output_accuracy",
            save_best_only=True,
            mode="max"
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_disease_output_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6
        )
    ]

    stage2_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage2_epochs,
        callbacks=callbacks_stage2,
        class_weight={"disease_output": disease_class_weights}
    )

    # Ensure best model is saved
    model.save(checkpoint_path)
    print(f"\n[+] Saved best model checkpoint to {checkpoint_path}")

    # =========================================================================
    # TEST SET EVALUATION ONLY
    # =========================================================================
    print("\n" + "="*60)
    print("TEST EVALUATION ON UNSEEN TEST SPLIT (15%)")
    print("="*60)
    test_metrics = evaluate_test_set(
        model=model,
        test_dataset=test_ds,
        class_names=class_names,
        veg_names=veg_names,
        results_dir=output_dir,
        model_filepath=checkpoint_path
    )
    
    return model, test_metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train LeafScan MobileNetV3-Small Dual-Head Classifier")
    parser.add_argument("--data_dir", type=str, default="../dataset", help="Path to Mendeley dataset root folder")
    parser.add_argument("--output_dir", type=str, default="results", help="Directory to save model, plots, and metrics")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--stage1_epochs", type=int, default=15, help="Epochs for head training")
    parser.add_argument("--stage2_epochs", type=int, default=20, help="Epochs for fine-tuning")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.data_dir):
        print(f"[!] Warning: Data directory '{args.data_dir}' does not exist yet.")
        print("    Place your dataset in 'dataset/' or specify --data_dir <path>")
        sys.exit(1)
        
    train_leafscan(
        data_dir=args.data_dir,
        output_dir=args.output_dir,
        batch_size=args.batch_size,
        stage1_epochs=args.stage1_epochs,
        stage2_epochs=args.stage2_epochs
    )
