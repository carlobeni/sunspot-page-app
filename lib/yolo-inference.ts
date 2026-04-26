import * as ort from "onnxruntime-web";

export const INPUT_SIZE = 640;
export const CONF_THRES = 0.35;
export const NMS_THRES = 0.35;

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  class_id: number;
}

// Ensure the WASM paths are configured if needed
// ort.env.wasm.wasmPaths = "/";

import { getModelFromCache } from "./model-loader";

let session: ort.InferenceSession | null = null;

export async function initModel(modelPath: string = "/models/group_model_yolo26n.onnx") {
  if (session) return session;
  
  try {
    ort.env.wasm.wasmPaths = "/";
    
    const cachedModel = await getModelFromCache(modelPath);
    if (cachedModel) {
      session = await ort.InferenceSession.create(cachedModel, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all"
      });
    } else {
      session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all"
      });
    }
    
    console.log("ONNX Model loaded successfully");
    return session;
  } catch (error) {
    console.error("Error loading ONNX model:", error);
    throw error;
  }
}

function iouXYXY(box1: BoundingBox, box2: BoundingBox) {
  const x1 = Math.max(box1.x1, box2.x1);
  const y1 = Math.max(box1.y1, box2.y1);
  const x2 = Math.min(box1.x2, box2.x2);
  const y2 = Math.min(box1.y2, box2.y2);

  const interW = Math.max(0.0, x2 - x1);
  const interH = Math.max(0.0, y2 - y1);
  const inter = interW * interH;

  const area1 = Math.max(0.0, box1.x2 - box1.x1) * Math.max(0.0, box1.y2 - box1.y1);
  const area2 = Math.max(0.0, box2.x2 - box2.x1) * Math.max(0.0, box2.y2 - box2.y1);
  const union = area1 + area2 - inter;

  if (union <= 0) return 0.0;
  return inter / union;
}

function nmsXYXY(boxes: BoundingBox[], iouThres: number = 0.45): BoundingBox[] {
  if (boxes.length === 0) return [];

  // Sort by score descending
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const keep: BoundingBox[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    keep.push(current);

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (iouXYXY(current, sorted[i]) >= iouThres) {
        sorted.splice(i, 1);
      }
    }
  }

  return keep;
}

export async function runYoloInference(
  imageElement: HTMLImageElement,
  originalWidth: number,
  originalHeight: number
): Promise<BoundingBox[]> {
  const sess = await initModel();

  // 1. Preprocess: Resize and extract pixels
  const canvas = document.createElement("canvas");
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context 2D not available");

  // Draw image on canvas (resized)
  ctx.drawImage(imageElement, 0, 0, INPUT_SIZE, INPUT_SIZE);
  const imgData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const data = imgData.data; // RGBA array

  // Create Float32Array [1, 3, 640, 640]
  // As per python code: grayscale conversion, then stacked into 3 channels
  const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const r = data[i * 4 + 0];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    // Grayscale approx (or just average, OpenCV cvtColor to Gray does a weighted sum but simple avg or picking one is fine for solar if it's already grayscale)
    // Python code resizes grayscale to 640x640. We assume the input image is mostly grayscale or we convert it.
    const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0;

    // Channel 0 (R equivalent)
    floatData[i] = gray;
    // Channel 1 (G equivalent)
    floatData[i + INPUT_SIZE * INPUT_SIZE] = gray;
    // Channel 2 (B equivalent)
    floatData[i + 2 * INPUT_SIZE * INPUT_SIZE] = gray;
  }

  const tensor = new ort.Tensor("float32", floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]);

  // 2. Inference
  const feeds: Record<string, ort.Tensor> = {};
  feeds[sess.inputNames[0]] = tensor;
  
  const results = await sess.run(feeds);
  const outputTensor = results[sess.outputNames[0]]; // Shape [1, 300, 6]
  
  const outputData = outputTensor.data as Float32Array; // Flattened 1 * 300 * 6
  
  const numDetections = outputTensor.dims[1]; // 300
  const rowSize = outputTensor.dims[2]; // 6
  
  const boxes: BoundingBox[] = [];

  // 3. Decode
  for (let i = 0; i < numDetections; i++) {
    const offset = i * rowSize;
    const x1 = outputData[offset + 0];
    const y1 = outputData[offset + 1];
    const x2 = outputData[offset + 2];
    const y2 = outputData[offset + 3];
    const score = outputData[offset + 4];
    const clsId = outputData[offset + 5];

    if (score < CONF_THRES) continue;

    const clampedX1 = Math.max(0.0, Math.min(INPUT_SIZE - 1.0, x1));
    const clampedY1 = Math.max(0.0, Math.min(INPUT_SIZE - 1.0, y1));
    const clampedX2 = Math.max(0.0, Math.min(INPUT_SIZE - 1.0, x2));
    const clampedY2 = Math.max(0.0, Math.min(INPUT_SIZE - 1.0, y2));

    if (clampedX2 <= clampedX1 || clampedY2 <= clampedY1) continue;

    boxes.push({
      x1: clampedX1,
      y1: clampedY1,
      x2: clampedX2,
      y2: clampedY2,
      score,
      class_id: clsId
    });
  }

  // 4. Apply NMS
  const nmsBoxes = nmsXYXY(boxes, NMS_THRES);

  // 5. Scale back to original coordinates (or viewBox)
  const scaleX = originalWidth / INPUT_SIZE;
  const scaleY = originalHeight / INPUT_SIZE;

  return nmsBoxes.map(b => ({
    x1: b.x1 * scaleX,
    y1: b.y1 * scaleY,
    x2: b.x2 * scaleX,
    y2: b.y2 * scaleY,
    score: b.score,
    class_id: b.class_id
  }));
}
