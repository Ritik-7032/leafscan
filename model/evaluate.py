import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def evaluate_test_set(model, test_dataset, class_names, veg_names, results_dir="results", model_filepath=None):
    """
    Evaluates the two-head model on the test dataset.
    Generates classification report, confusion matrix, and model size.
    """
    os.makedirs(results_dir, exist_ok=True)
    
    y_true_veg = []
    y_true_disease = []
    y_pred_veg = []
    y_pred_disease = []
    y_pred_disease_probs = []
    
    print("\n--- Running Evaluation on Test Set ---")
    for images, targets in test_dataset:
        preds = model.predict(images, verbose=0)
        
        # Unpack targets & predictions for two heads
        if isinstance(targets, dict):
            veg_t = targets["vegetable_output"].numpy()
            dis_t = targets["disease_output"].numpy()
        else:
            veg_t, dis_t = targets[0].numpy(), targets[1].numpy()
            
        if isinstance(preds, dict):
            veg_p = preds["vegetable_output"]
            dis_p = preds["disease_output"]
        else:
            veg_p, dis_p = preds[0], preds[1]
            
        y_true_veg.extend(np.argmax(veg_t, axis=1) if veg_t.ndim > 1 else veg_t)
        y_true_disease.extend(np.argmax(dis_t, axis=1) if dis_t.ndim > 1 else dis_t)
        
        y_pred_veg.extend(np.argmax(veg_p, axis=1))
        y_pred_disease.extend(np.argmax(dis_p, axis=1))
        y_pred_disease_probs.extend(np.max(dis_p, axis=1))
        
    y_true_veg = np.array(y_true_veg)
    y_true_disease = np.array(y_true_disease)
    y_pred_veg = np.array(y_pred_veg)
    y_pred_disease = np.array(y_pred_disease)
    y_pred_disease_probs = np.array(y_pred_disease_probs)
    
    # Calculate Metrics
    acc_veg = accuracy_score(y_true_veg, y_pred_veg)
    acc_dis = accuracy_score(y_true_disease, y_pred_disease)
    
    # Low confidence predictions check (< 0.60 threshold)
    low_conf_mask = y_pred_disease_probs < 0.60
    low_conf_count = int(np.sum(low_conf_mask))
    low_conf_ratio = float(low_conf_count / len(y_pred_disease_probs)) if len(y_pred_disease_probs) > 0 else 0.0
    
    # Classification Reports
    report_dis_dict = classification_report(
        y_true_disease, y_pred_disease, 
        target_names=class_names, 
        output_dict=True, 
        zero_division=0
    )
    report_dis_text = classification_report(
        y_true_disease, y_pred_disease, 
        target_names=class_names, 
        zero_division=0
    )
    
    report_veg_dict = classification_report(
        y_true_veg, y_pred_veg, 
        target_names=veg_names, 
        output_dict=True, 
        zero_division=0
    )
    report_veg_text = classification_report(
        y_true_veg, y_pred_veg, 
        target_names=veg_names, 
        zero_division=0
    )

    # Model size in MB
    model_size_mb = 0.0
    if model_filepath and os.path.exists(model_filepath):
        model_size_mb = round(os.path.getsize(model_filepath) / (1024 * 1024), 2)
    
    # Save text report
    report_path = os.path.join(results_dir, "test_report.txt")
    with open(report_path, "w") as f:
        f.write("=====================================================\n")
        f.write("             LEAFSCAN MODEL TEST EVALUATION          \n")
        f.write("=====================================================\n\n")
        f.write(f"Model File: {model_filepath or 'In-memory'}\n")
        f.write(f"Model Size: {model_size_mb} MB\n")
        f.write(f"Total Test Samples: {len(y_true_disease)}\n")
        f.write(f"Vegetable Head Accuracy: {acc_veg * 100:.2f}%\n")
        f.write(f"Disease Head Accuracy: {acc_dis * 100:.2f}%\n")
        f.write(f"Low Confidence (< 60%) Flagged: {low_conf_count} / {len(y_pred_disease_probs)} ({low_conf_ratio*100:.2f}%)\n\n")
        f.write("--- DISEASE CLASSIFICATION REPORT (17 CLASSES) ---\n")
        f.write(report_dis_text)
        f.write("\n\n--- VEGETABLE CLASSIFICATION REPORT (4 CLASSES) ---\n")
        f.write(report_veg_text)
        
    print(f"\n[+] Saved test report to {report_path}")
    print(f"    - Disease Accuracy: {acc_dis * 100:.2f}%")
    print(f"    - Vegetable Accuracy: {acc_veg * 100:.2f}%")
    print(f"    - Model Size: {model_size_mb} MB")

    # Save JSON metrics
    metrics = {
        "model_size_mb": model_size_mb,
        "disease_accuracy": float(acc_dis),
        "vegetable_accuracy": float(acc_veg),
        "low_confidence_count": low_conf_count,
        "low_confidence_ratio": low_conf_ratio,
        "disease_classification_report": report_dis_dict,
        "vegetable_classification_report": report_veg_dict
    }
    metrics_path = os.path.join(results_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[+] Saved metrics JSON to {metrics_path}")

    # Plot Disease Confusion Matrix
    cm_dis = confusion_matrix(y_true_disease, y_pred_disease)
    plt.figure(figsize=(14, 12))
    sns.heatmap(
        cm_dis, 
        annot=True, 
        fmt="d", 
        cmap="Blues", 
        xticklabels=class_names, 
        yticklabels=class_names
    )
    plt.title("Disease Classification Confusion Matrix (Test Set)", fontsize=14, fontweight="bold")
    plt.xlabel("Predicted Disease", fontsize=12)
    plt.ylabel("Actual Disease", fontsize=12)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    cm_dis_path = os.path.join(results_dir, "confusion_matrix_disease.png")
    plt.savefig(cm_dis_path, dpi=300)
    plt.close()
    print(f"[+] Saved disease confusion matrix plot to {cm_dis_path}")

    # Plot Vegetable Confusion Matrix
    cm_veg = confusion_matrix(y_true_veg, y_pred_veg)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm_veg, 
        annot=True, 
        fmt="d", 
        cmap="Greens", 
        xticklabels=veg_names, 
        yticklabels=veg_names
    )
    plt.title("Vegetable Classification Confusion Matrix (Test Set)", fontsize=14, fontweight="bold")
    plt.xlabel("Predicted Vegetable", fontsize=12)
    plt.ylabel("Actual Vegetable", fontsize=12)
    plt.tight_layout()
    cm_veg_path = os.path.join(results_dir, "confusion_matrix_vegetable.png")
    plt.savefig(cm_veg_path, dpi=300)
    plt.close()
    print(f"[+] Saved vegetable confusion matrix plot to {cm_veg_path}")

    return metrics
