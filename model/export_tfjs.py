import os
import sys
import json
import argparse
import tensorflow as tf

def export_to_tfjs(model_path="results/best_leafscan_model.keras", output_dir="../app/public/model", quantize_float16=True):
    """
    Exports a trained Keras/SavedModel model to TensorFlow.js web format.
    Targeting < 5 MB bundle size.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
        
    print(f"[+] Loading trained model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    # Optional conversion using tensorflowjs converter CLI or Python API
    try:
        import tensorflowjs as tfjs
        print(f"[+] Exporting to TensorFlow.js format at {output_dir}...")
        
        # tfjs export
        tfjs.converters.save_keras_model(
            model,
            output_dir,
            quantization_dtype_map={"float16": "*"} if quantize_float16 else None
        )
        print(f"[+] Successfully exported model to {output_dir}")
        
        # Calculate exported size
        total_size = sum(os.path.getsize(os.path.join(output_dir, f)) for f in os.listdir(output_dir) if os.path.isfile(os.path.join(output_dir, f)))
        print(f"[+] Total TF.js model size: {total_size / (1024 * 1024):.2f} MB (Target: < 5 MB)")
        
    except ImportError:
        print("[!] tensorflowjs Python package not installed.")
        print("    Running CLI fallback command: `tensorflowjs_converter --input_format=keras ...`")
        cmd = f"tensorflowjs_converter --input_format=keras --quantize_float16 {model_path} {output_dir}"
        os.system(cmd)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export LeafScan model to TensorFlow.js format")
    parser.add_argument("--model_path", type=str, default="results/best_leafscan_model.keras", help="Path to input .keras model")
    parser.add_argument("--output_dir", type=str, default="../app/public/model", help="Target output folder for web assets")
    parser.add_argument("--no_quantize", action="store_true", help="Disable float16 quantization")
    
    args = parser.parse_args()
    export_to_tfjs(model_path=args.model_path, output_dir=args.output_dir, quantize_float16=not args.no_quantize)
