import numpy as np
import tensorflow as tf
import matplotlib.cm as cm
from PIL import Image

def find_last_conv_layer(model):
    """
    Find the last 4D convolutional/activation layer in the model or backbone.
    Works for nested functional models or flat architectures.
    """
    # If MobileNetV3 is a sublayer (e.g. model.get_layer('mobilenetv3small'))
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.Model):
            for sub_layer in reversed(layer.layers):
                if len(sub_layer.output.shape) == 4 and ('conv' in sub_layer.name.lower() or 'expand' in sub_layer.name.lower() or 'project' in sub_layer.name.lower() or 'out' in sub_layer.name.lower()):
                    return sub_layer.name, layer.name
        elif len(layer.output.shape) == 4 and ('conv' in layer.name.lower() or 'expand' in layer.name.lower() or 'project' in layer.name.lower() or 'out' in layer.name.lower()):
            return layer.name, None
    
    # Fallback to layer names typical in MobileNetV3Small
    return "Conv_1", None


def compute_gradcam(model, img_array, pred_index=None, last_conv_layer_name=None):
    """
    Compute Grad-CAM heatmap for a 224x224 image tensor.
    
    Args:
        model: tf.keras.Model with two heads (vegetable, disease) or single head
        img_array: preprocessed numpy array of shape (1, 224, 224, 3)
        pred_index: class index to compute gradients for (defaults to argmax of disease head)
        last_conv_layer_name: name of the convolutional layer
    
    Returns:
        heatmap: 2D numpy array (224, 224) with values in [0, 1]
    """
    # Identify conv layer if not provided
    if last_conv_layer_name is None:
        last_conv_layer_name, submodel_name = find_last_conv_layer(model)
    else:
        submodel_name = None

    # Construct gradient submodel
    if submodel_name:
        submodel = model.get_layer(submodel_name)
        conv_output = submodel.get_layer(last_conv_layer_name).output
        # Reconstruct pathway
        grad_model = tf.keras.models.Model(
            inputs=[model.inputs],
            outputs=[conv_output, model.get_layer("disease_output").output if "disease_output" in [l.name for l in model.layers] else model.outputs[1] if isinstance(model.outputs, list) else model.output]
        )
    else:
        try:
            conv_layer = model.get_layer(last_conv_layer_name)
            disease_out = model.get_layer("disease_output").output if "disease_output" in [l.name for l in model.layers] else (model.outputs[1] if isinstance(model.outputs, list) else model.output)
            grad_model = tf.keras.models.Model(
                inputs=[model.inputs],
                outputs=[conv_layer.output, disease_out]
            )
        except Exception:
            # Fallback: search layer in nested graph
            for layer in model.layers:
                if hasattr(layer, 'layers'):
                    for sub in layer.layers:
                        if sub.name == last_conv_layer_name:
                            grad_model = tf.keras.models.Model(
                                inputs=[model.inputs],
                                outputs=[sub.output, model.get_layer("disease_output").output]
                            )
                            break

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    # Gradient of the top predicted class with respect to the output feature map
    grads = tape.gradient(class_channel, conv_outputs)

    # Vector of mean intensity of the gradient over a specific feature map channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight convolution feature map by gradient importance
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Apply ReLU to keep only features that have a positive influence on the class
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
    heatmap = heatmap.numpy()

    # Resize heatmap to 224x224
    heatmap = np.uint8(255 * heatmap)
    heatmap_img = Image.fromarray(heatmap).resize((224, 224), resample=Image.BICUBIC)
    heatmap_resized = np.array(heatmap_img) / 255.0
    return heatmap_resized


def overlay_gradcam(original_img, heatmap, alpha=0.45, colormap="jet"):
    """
    Superimpose Grad-CAM heatmap over original RGB image.
    
    Args:
        original_img: PIL Image or numpy array (H, W, 3) in range [0, 255]
        heatmap: (H, W) float array in range [0, 1]
        alpha: transparency ratio for overlay
        colormap: matplotlib colormap name
        
    Returns:
        superimposed_img: PIL Image of blended visualization
    """
    if isinstance(original_img, np.ndarray):
        if original_img.max() <= 1.0:
            original_img = np.uint8(original_img * 255)
        img = Image.fromarray(original_img).convert("RGB").resize((224, 224))
    else:
        img = original_img.convert("RGB").resize((224, 224))

    # Rescale heatmap to [0, 255]
    heatmap_uint8 = np.uint8(255 * heatmap)

    # Use colormap to generate RGB heatmap
    color_map = cm.get_cmap(colormap)
    color_heatmap = color_map(heatmap_uint8 / 255.0)[:, :, :3]
    color_heatmap = np.uint8(255 * color_heatmap)

    # Blend original image and color heatmap
    original_np = np.array(img)
    superimposed = np.uint8(original_np * (1 - alpha) + color_heatmap * alpha)
    return Image.fromarray(superimposed)
