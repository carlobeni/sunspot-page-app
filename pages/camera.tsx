"use client";

import { useState } from "react";
import { Camera, CheckCircle2, CircleDashed, Loader2, Play } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const steps = [
  { id: 1, title: "Separar video en frames", description: "Extrayendo imágenes individuales del feed de la cámara Pi5" },
  { id: 2, title: "Deconstruir Imagen", description: "Proceso inicial de normalización fotométrica" },
  { id: 3, title: "Red de segmentación y agrupamiento", description: "Modelo ONNX de clustering para área geométrica" },
  { id: 4, title: "Red de clasificación", description: "Clasificación ONNX de la topología de la mancha" },
];

export default function CameraPage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCurrentStep(1);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step > 4) {
        clearInterval(interval);
        setTimeout(() => {
          setIsCapturing(false);
          setCurrentStep(0);
        }, 2000);
      } else {
        setCurrentStep(step);
      }
    }, 2000);
  };

  return (
    <div className="p-5 pt-24 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Módulo de Captura
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-light italic">
            Monitorización remota y análisis en tiempo real mediante inferencia ONNX.
          </p>
        </div>
        <button
          onClick={startCapture}
          disabled={isCapturing}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm w-full md:w-auto border",
            isCapturing
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
              : "bg-red-600 text-white hover:bg-red-700 hover:shadow-md border-red-700"
          )}
        >
          {isCapturing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          {isCapturing ? "Procesando Pipeline..." : "Iniciar Muestreo"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Viewport */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <div className="relative flex-1 aspect-video lg:aspect-auto min-h-[400px] bg-slate-900 rounded-2xl border border-slate-200 overflow-hidden group shadow-sm flex items-center justify-center">
            {isCapturing ? (
              <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <div className="w-[60%] h-[60%] border border-slate-600 rounded-full border-dashed" />
            </div>
            <Camera className="h-16 w-16 text-slate-600 relative z-10" strokeWidth={1.5} />
            <div className="absolute top-5 left-5 right-5 flex justify-between gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/95 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Pi5 Activa
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300">
                AF-01 // 64MP
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Steps */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm h-full">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
              Estado de Ejecución
            </h2>
            <div className="space-y-8">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const isPending = currentStep !== 0 && currentStep < step.id;

                return (
                  <div key={step.id} className="relative flex gap-5">
                    {index !== steps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-[11px] top-8 bottom-[-32px] w-[2px]",
                          isCompleted ? "bg-red-500" : "bg-slate-100"
                        )}
                      />
                    )}
                    <div className="relative flex-shrink-0 mt-0.5 z-10">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-red-600 bg-white" strokeWidth={2.5} />
                      ) : isActive ? (
                        <div className="relative h-6 w-6">
                           <Loader2 className="absolute top-0 left-0 h-6 w-6 text-red-500 animate-spin bg-white" />
                        </div>
                      ) : (
                        <CircleDashed className={cn(
                          "h-6 w-6 bg-white",
                          isPending ? "text-slate-300" : "text-slate-200"
                        )} strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-sm font-bold tracking-tight",
                        isActive ? "text-red-700" : isCompleted ? "text-slate-900" : "text-slate-400"
                      )}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
