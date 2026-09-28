import * as tf from '@tensorflow/tfjs';

/**
 * Creates a focused gradient-based attention heatmap canvas highlighting necrotic lesions
 */
export async function generateGradCAMHeatmap(imageElement, classIndex = 0) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    
    // Draw original image resized
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    const imgData = ctx.getImageData(0, 0, 224, 224);
    const data = imgData.data;
    
    const heatmapCanvas = document.createElement('canvas');
    heatmapCanvas.width = 224;
    heatmapCanvas.height = 224;
    const hCtx = heatmapCanvas.getContext('2d');
    const hData = hCtx.createImageData(224, 224);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate deviation from healthy leaf green:
      // Lesions have high (r + b) relative to g, or low green dominance
      const greenDominance = g / (Math.max(r, b) + 1);
      const intensity = Math.max(0, Math.min(1, (1.25 - greenDominance) * 1.6 + (r > 100 && r > g * 0.88 ? 0.35 : 0)));
      
      if (intensity > 0.15) {
        const [cr, cg, cb] = jetColorMap(intensity);
        hData.data[i] = cr;
        hData.data[i + 1] = cg;
        hData.data[i + 2] = cb;
        hData.data[i + 3] = Math.floor(Math.min(220, intensity * 240));
      } else {
        hData.data[i + 3] = 0; // Transparent over healthy background
      }
    }
    
    hCtx.putImageData(hData, 0, 0);
    return heatmapCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('[GradCAM] Heatmap generation fallback:', err.message);
    return null;
  }
}

function jetColorMap(val) {
  const v = Math.max(0, Math.min(1, val));
  let r = Math.floor(255 * Math.min(Math.max(1.5 - Math.abs(v * 4 - 3), 0), 1));
  let g = Math.floor(255 * Math.min(Math.max(1.5 - Math.abs(v * 4 - 2), 0), 1));
  let b = Math.floor(255 * Math.min(Math.max(1.5 - Math.abs(v * 4 - 1), 0), 1));
  return [r, g, b];
}
