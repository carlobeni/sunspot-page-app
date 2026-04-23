import * as ort from "onnxruntime-web";

export interface ClassificationMetadata {
  classes: {
    Z: string[];
    P: string[];
    C: string[];
  };
  normalization: {
    mean: number[];
    std: number[];
    resize: number[];
  };
}

let classificationSession: ort.InferenceSession | null = null;
let metadata: ClassificationMetadata | null = null;
let validMask: Uint8Array | null = null;

export async function initClassificationModel() {
  if (classificationSession && metadata && validMask) {
    return { session: classificationSession, metadata, validMask };
  }

  try {
    ort.env.wasm.wasmPaths = "/";
    
    // Load Session
    classificationSession = await ort.InferenceSession.create(
      "/models/clasification_model_convnextv2tinny/sunscc_3head.onnx",
      { executionProviders: ["wasm"], graphOptimizationLevel: "all" }
    );

    // Load Metadata
    const metaRes = await fetch("/models/clasification_model_convnextv2tinny/sunscc_3head_metadata.json");
    metadata = await metaRes.json();

    // Load Valid Mask (npy)
    // The .npy file has a header. For uint8 [7, 6, 4], the data is the last 168 bytes.
    const maskRes = await fetch("/models/clasification_model_convnextv2tinny/valid_mask.npy");
    const maskBuffer = await maskRes.arrayBuffer();
    // NPY header is usually variable length but for small files it's often 128 bytes.
    // Let's find the start of the data. Uint8Array(maskBuffer)
    const fullArray = new Uint8Array(maskBuffer);
    // Simple heuristic for .npy: the data usually follows the header which ends with \n
    // Or we just take the last 168 bytes if we know the shape is [7, 6, 4]
    const dataSize = 7 * 6 * 4;
    validMask = fullArray.slice(fullArray.length - dataSize);

    console.log("Classification Model and Metadata loaded");
    return { session: classificationSession, metadata, validMask };
  } catch (error) {
    console.error("Error loading classification model:", error);
    throw error;
  }
}

function softmax(logits: Float32Array): number[] {
  const maxLogit = Math.max(...logits);
  const scores = Array.from(logits).map(l => Math.exp(l - maxLogit));
  const sumScores = scores.reduce((a, b) => a + b, 0);
  return scores.map(s => s / sumScores);
}

export async function runClassificationInference(canvas: HTMLCanvasElement) {
  const { session, metadata, validMask } = await initClassificationModel();
  if (!metadata) throw new Error("Metadata not loaded");

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context 2D not available");

  const { mean, std } = metadata.normalization;
  const imgData = ctx.getImageData(0, 0, 224, 224);
  const data = imgData.data;

  const floatData = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    // NCHW format
    floatData[i] = (data[i * 4 + 0] / 255.0 - mean[0]) / std[0]; // R
    floatData[i + 224 * 224] = (data[i * 4 + 1] / 255.0 - mean[1]) / std[1]; // G
    floatData[i + 2 * 224 * 224] = (data[i * 4 + 2] / 255.0 - mean[2]) / std[2]; // B
  }

  const tensor = new ort.Tensor("float32", floatData, [1, 3, 224, 224]);
  const results = await session.run({ input: tensor });

  // Outputs: logits_z (7), logits_p (6), logits_c (4)
  const logitsZ = results.logits_z.data as Float32Array;
  const logitsP = results.logits_p.data as Float32Array;
  const logitsC = results.logits_c.data as Float32Array;

  // Hierarchical Probabilities Logic
  // 1. Z Probabilities
  const pZ = softmax(logitsZ);

  // 2. P Probabilities (will be conditioned later in UI)
  const pP = softmax(logitsP);

  // 3. C Probabilities (will be conditioned later in UI)
  const pC = softmax(logitsC);

  return {
    pZ,
    pP,
    pC,
    classes: metadata.classes,
    validMask
  };
}

/**
 * Calculates conditioned probabilities based on current selection
 */
export function getConditionedProbs(
  pZ: number[],
  pP: number[],
  pC: number[],
  validMask: Uint8Array,
  selectedZ: number | null,
  selectedP: number | null
) {
  // validMask is [7, 6, 4] flattened: zi * 6 * 4 + pi * 4 + ci
  
  // Level 1: Z is already global (pZ)
  
  // Level 2: P conditioned on Z
  let condP: number[] = new Array(6).fill(0);
  if (selectedZ !== null) {
    let sum = 0;
    for (let pi = 0; pi < 6; pi++) {
      let isValidForZ = false;
      for (let ci = 0; ci < 4; ci++) {
        if (validMask[selectedZ * 24 + pi * 4 + ci] === 1) {
          isValidForZ = true;
          break;
        }
      }
      if (isValidForZ) {
        condP[pi] = pP[pi];
        sum += condP[pi];
      } else {
        condP[pi] = 0;
      }
    }
    if (sum > 0) condP = condP.map(v => v / sum);
  }

  // Level 3: C conditioned on Z and P
  let condC: number[] = new Array(4).fill(0);
  if (selectedZ !== null && selectedP !== null) {
    let sum = 0;
    for (let ci = 0; ci < 4; ci++) {
      if (validMask[selectedZ * 24 + selectedP * 4 + ci] === 1) {
        condC[ci] = pC[ci];
        sum += condC[ci];
      } else {
        condC[ci] = 0;
      }
    }
    if (sum > 0) condC = condC.map(v => v / sum);
  }

  return { condP, condC };
}
