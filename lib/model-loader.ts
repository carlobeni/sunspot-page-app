
export interface ModelLoadProgress {
  modelName: string;
  progress: number;
  total: number;
  loaded: number;
}

const MODELS_CACHE_NAME = "onnx-models-v1";

const MODELS_TO_CACHE = [
  {
    name: "Modelo de Detección (YOLO)",
    url: "/models/group_model_yolo26n.onnx",
  },
  {
    name: "Modelo de Clasificación (McIntosh)",
    url: "/models/clasification_model_convnextv2tinny/sunscc_3head.onnx",
  },
  {
    name: "Metadatos de Clasificación",
    url: "/models/clasification_model_convnextv2tinny/sunscc_3head_metadata.json",
  },
  {
    name: "Máscara de Validación",
    url: "/models/clasification_model_convnextv2tinny/valid_mask.npy",
  }
];

export async function checkModelsCached(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return true;
  
  const cache = await caches.open(MODELS_CACHE_NAME);
  for (const model of MODELS_TO_CACHE) {
    const response = await cache.match(model.url);
    if (!response) return false;
  }
  return true;
}

export async function downloadModelsWithProgress(
  onProgress: (progress: ModelLoadProgress) => void
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cache = await caches.open(MODELS_CACHE_NAME);

  for (const model of MODELS_TO_CACHE) {
    const response = await fetch(model.url);
    if (!response.ok) throw new Error(`Failed to download ${model.name}`);

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Could not get reader");

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      onProgress({
        modelName: model.name,
        progress: total ? (loaded / total) * 100 : 0,
        total,
        loaded
      });
    }

    const blob = new Blob(chunks);
    const cachedResponse = new Response(blob, {
      headers: response.headers
    });
    await cache.put(model.url, cachedResponse);
  }
}

export async function getModelFromCache(url: string): Promise<ArrayBuffer | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;

  const cache = await caches.open(MODELS_CACHE_NAME);
  const response = await cache.match(url);
  if (!response) return null;
  
  return await response.arrayBuffer();
}
