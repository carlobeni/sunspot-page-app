"use client";

import { useState, useRef } from "react";
import {
  Telescope,
  Image as ImageIcon,
  Tags,
  FileText,
  Upload,
  Camera,
  Activity,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  User,
  Briefcase,
  X,
  LayoutGrid,
  Lock,
  ChevronRight,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = "imagen" | "etiquetado" | "informe";

// Defines which tabs are unlocked based on pipeline state
function getUnlockedTabs(image: string | null, detections: any[]): Tab[] {
  const unlocked: Tab[] = ["imagen"];
  if (image) unlocked.push("etiquetado");
  if (image && detections.length > 0) unlocked.push("informe");
  return unlocked;
}

export default function ObservatoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("imagen");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<number | null>(null);
  const [viewBox] = useState({ w: 1024, h: 1024 });

  const [metadata, setMetadata] = useState({
    professional: "Carlos Benítez",
    position: "Investigador Principal",
    source: 'Observatorio Astrónomico "Prof. Alexis Troche Boggino"',
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: "Asunción, Paraguay",
  });

  const unlockedTabs = getUnlockedTabs(image, detections);

  const handleImageSet = (img: string | null) => {
    setImage(img);
    if (img) setActiveTab("etiquetado");
    else {
      setDetections([]);
      setActiveTab("imagen");
    }
  };

  const simulateDetection = () => {
    setLoading(true);
    setTimeout(() => {
      setDetections([
        { id: 1, x: 520, y: 480, w: 60, h: 60, lat: 10.5, lon: -15.2, mcintosh: "Dkc", mag: "Beta" },
        { id: 2, x: 450, y: 550, w: 40, h: 40, lat: -12.1, lon: 5.4, mcintosh: "Axx", mag: "Alpha" },
      ]);
      setLoading(false);
      setActiveTab("etiquetado");
    }, 1500);
  };

  const STEPS: { id: Tab; label: string; icon: any; desc: string }[] = [
    { id: "imagen", label: "Imagen", icon: ImageIcon, desc: "Cargar o capturar imagen solar" },
    { id: "etiquetado", label: "Etiquetado", icon: Tags, desc: "Marcar y clasificar manchas" },
    { id: "informe", label: "Informe", icon: FileText, desc: "Generar reporte de observación" },
  ];

  const stepIndex = STEPS.findIndex((s) => s.id === activeTab);

  return (
    <div className="p-4 pt-20 lg:p-8 lg:pt-24 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Telescope className="h-7 w-7 text-slate-700 shrink-0" />
            Observatorio
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm font-medium hidden sm:block">
            Captura y análisis de registros solares en tiempo real.
          </p>
        </div>
        {image && (
          <button
            onClick={simulateDetection}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all justify-center shadow-sm shrink-0"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Re-ejecutar modelo
          </button>
        )}
      </div>

      {/* ── Progressive Timeline Navigator ── */}
      <div className="mb-6 w-full">
        {/* Desktop: horizontal stepper */}
        <div className="hidden sm:flex items-stretch w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {STEPS.map((step, i) => {
            const unlocked = unlockedTabs.includes(step.id);
            const isActive = activeTab === step.id;
            const isDone = unlockedTabs.includes(step.id) && stepIndex > i;
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-stretch flex-1 min-w-0">
                <button
                  disabled={!unlocked}
                  onClick={() => unlocked && setActiveTab(step.id)}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-5 py-4 transition-all text-left group relative",
                    isActive
                      ? "bg-slate-900 text-white"
                      : unlocked
                      ? "bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                      : "bg-white text-slate-300 cursor-not-allowed"
                  )}
                >
                  {/* Step badge */}
                  <div
                    className={cn(
                      "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-white/20 text-white"
                        : isDone
                        ? "bg-emerald-100 text-emerald-600"
                        : unlocked
                        ? "bg-slate-100 text-slate-600"
                        : "bg-slate-100 text-slate-300"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : !unlocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4.5 w-4.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-bold leading-tight truncate", isActive ? "text-white" : "")}>
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs truncate mt-0.5",
                        isActive ? "text-slate-300" : unlocked ? "text-slate-400" : "text-slate-200"
                      )}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Step number */}
                  <span
                    className={cn(
                      "absolute top-2 right-3 text-[10px] font-black tabular-nums",
                      isActive ? "text-white/30" : "text-slate-200"
                    )}
                  >
                    0{i + 1}
                  </span>
                </button>

                {/* Divider arrow */}
                {!isLast && (
                  <div className="flex items-center shrink-0">
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 transition-colors",
                        unlockedTabs.includes(STEPS[i + 1].id)
                          ? "text-slate-300"
                          : "text-slate-200"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: compact progress row */}
        <div className="sm:hidden flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {STEPS.map((step, i) => {
            const unlocked = unlockedTabs.includes(step.id);
            const isActive = activeTab === step.id;
            const isDone = unlockedTabs.includes(step.id) && stepIndex > i;
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  disabled={!unlocked}
                  onClick={() => unlocked && setActiveTab(step.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 px-2 transition-all",
                    isActive
                      ? "bg-slate-900 text-white"
                      : unlocked
                      ? "text-slate-600 hover:bg-slate-50"
                      : "text-slate-300 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-white/20"
                        : isDone
                        ? "bg-emerald-100 text-emerald-600"
                        : unlocked
                        ? "bg-slate-100"
                        : "bg-slate-50"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : !unlocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <step.icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold leading-none text-center">{step.label}</span>
                </button>
                {!isLast && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0",
                      unlockedTabs.includes(STEPS[i + 1].id) ? "text-slate-300" : "text-slate-100"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-800 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${((unlockedTabs.length - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === "imagen" && (
          <ImageTab
            metadata={metadata}
            setMetadata={setMetadata}
            image={image}
            setImage={handleImageSet}
            simulateDetection={simulateDetection}
          />
        )}
        {activeTab === "etiquetado" && (
          <LabelingTab
            image={image}
            detections={detections}
            setDetections={setDetections}
            selectedDetection={selectedDetection}
            setSelectedDetection={setSelectedDetection}
            viewBox={viewBox}
            onCommit={() => setActiveTab("informe")}
          />
        )}
        {activeTab === "informe" && <ReportTab metadata={metadata} detections={detections} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  IMAGE TAB                                      */
/* ─────────────────────────────────────────────── */
function ImageTab({ metadata, setMetadata, image, setImage, simulateDetection }: any) {
  const [mode, setMode] = useState<"upload" | "capture" | null>(null);
  const [gain, setGain] = useState(50);
  const [exposure, setExposure] = useState(20);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full bg-slate-50">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* ── Left: Controls ── */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Source */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-black">1</span>
              Origen de Imagen
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <button
                onClick={() => setMode("upload")}
                className={cn(
                  "flex flex-col sm:flex-row lg:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-lg border transition-all text-left group",
                  mode === "upload" ? "border-slate-800 bg-slate-50 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn("p-2 rounded-md border shrink-0", mode === "upload" ? "bg-slate-100 text-slate-900 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-200 group-hover:text-slate-700")}>
                  <Upload className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <span className="block font-bold text-slate-900 text-xs sm:text-sm leading-tight">Cargar Archivo</span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400 leading-tight">HMI / White-Light</span>
                </div>
              </button>

              <button
                onClick={() => setMode("capture")}
                className={cn(
                  "flex flex-col sm:flex-row lg:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-lg border transition-all text-left group",
                  mode === "capture" ? "border-slate-800 bg-slate-50 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn("p-2 rounded-md border shrink-0", mode === "capture" ? "bg-slate-100 text-slate-900 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-200 group-hover:text-slate-700")}>
                  <Camera className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <span className="block font-bold text-slate-900 text-xs sm:text-sm leading-tight">Captura ZWO</span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400 leading-tight">Live Pi5-A1</span>
                </div>
              </button>
            </div>
          </section>

          {/* Metadata */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-black">2</span>
              Metadatos
            </h3>
            <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observador</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={metadata.professional}
                    onChange={(e) => setMetadata({ ...metadata, professional: e.target.value })}
                    className="flex-1 text-sm bg-transparent font-medium focus:outline-none text-slate-900 min-w-0"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rango</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={metadata.position}
                    onChange={(e) => setMetadata({ ...metadata, position: e.target.value })}
                    className="flex-1 text-sm bg-transparent font-medium focus:outline-none text-slate-900 min-w-0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                    <input type="date" value={metadata.date} readOnly className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-700" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hora</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                    <input type="text" value={metadata.time} readOnly className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right: Viewport ── */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-0">
          {image ? (
            <div className="relative w-full h-full p-4 sm:p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[360px] sm:max-w-[480px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-black shadow-md">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setImage(null)}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 rounded-md backdrop-blur-sm shadow-sm transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : mode === null ? (
            <div className="text-center space-y-3 p-8">
              <Telescope className="h-12 w-12 text-slate-200 mx-auto" />
              <p className="text-slate-400 text-sm font-semibold">Selecciona un origen para comenzar</p>
            </div>
          ) : mode === "upload" ? (
            <div className="flex flex-col items-center gap-5 p-6 text-center w-full max-w-sm">
              <label className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-slate-700 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group shadow-sm">
                <Upload className="h-7 w-7 text-slate-300 group-hover:text-slate-700 transition-colors mb-2" />
                <span className="text-xs text-slate-400 font-bold group-hover:text-slate-700 transition-colors">Examinar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImage(URL.createObjectURL(file));
                  }}
                />
              </label>
              <div className="space-y-2">
                <p className="text-slate-700 text-sm font-bold">Cargar registro histórico</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-500 border border-slate-200">MAX: 4K</span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-500 border border-slate-200">RAW / JPG</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── Fullscreen overlay ── */}
              {fullscreen && (
                <div
                  className="fixed inset-0 z-50 bg-black flex flex-col"
                  onKeyDown={(e) => e.key === "Escape" && setFullscreen(false)}
                  tabIndex={-1}
                >
                  {/* Fullscreen top bar */}
                  <div className="flex items-center justify-between px-5 py-3 bg-black/80 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Live Signal: PI5-SYNC</span>
                    </div>
                    <button
                      onClick={() => setFullscreen(false)}
                      className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Fullscreen live area */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <div className="w-[60%] h-[60%] border-2 border-white rounded-lg border-dashed" />
                      <div className="absolute w-[80%] h-[80%] border-2 border-white rounded-full border-dashed" />
                    </div>
                    <div className="h-12 w-12 border-4 border-slate-600 border-t-slate-200 rounded-xl animate-spin" />
                  </div>

                  {/* Fullscreen controls bar */}
                  <div className="px-6 py-5 bg-black/80 border-t border-white/10 flex flex-col sm:flex-row gap-5 sm:items-end">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Master Gain</label>
                          <span className="text-[10px] font-black text-white/70 tabular-nums">{gain}</span>
                        </div>
                        <input
                          type="range" min={0} max={100} value={gain}
                          onChange={(e) => setGain(Number(e.target.value))}
                          className="w-full h-1.5 appearance-none rounded-full accent-slate-300 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Exposición (ms)</label>
                          <span className="text-[10px] font-black text-white/70 tabular-nums">{exposure}</span>
                        </div>
                        <input
                          type="range" min={1} max={500} value={exposure}
                          onChange={(e) => setExposure(Number(e.target.value))}
                          className="w-full h-1.5 appearance-none rounded-full accent-slate-300 cursor-pointer"
                        />
                      </div>
                    </div>
                    <button
                      onClick={simulateDetection}
                      className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-2.5 rounded-md text-sm font-black transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      <Camera className="h-4 w-4" />
                      Capturar
                    </button>
                  </div>
                </div>
              )}

              {/* ── Inline capture view ── */}
              <div className="w-full h-full flex flex-col min-h-[300px]">
                <div className="flex-1 flex items-center justify-center relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-[70%] h-[70%] border-2 border-white rounded-lg border-dashed" />
                    <div className="absolute w-[90%] h-[90%] border-2 border-white rounded-full border-dashed" />
                  </div>
                  <div className="h-9 w-9 border-4 border-slate-700 border-t-slate-300 rounded-xl animate-spin" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    Live Signal: PI5-SYNC
                  </div>

                  {/* Fullscreen button */}
                  <button
                    onClick={() => setFullscreen(true)}
                    title="Pantalla completa"
                    className="absolute top-4 right-4 p-2 rounded-md bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                  </button>
                </div>

                {/* Controls bar */}
                <div className="bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    {/* Sliders */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Gain</label>
                          <span className="text-[10px] font-black text-slate-700 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">{gain}</span>
                        </div>
                        <input
                          type="range" min={0} max={100} value={gain}
                          onChange={(e) => setGain(Number(e.target.value))}
                          className="w-full h-1.5 appearance-none rounded-full accent-slate-800 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exposición (ms)</label>
                          <span className="text-[10px] font-black text-slate-700 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">{exposure}</span>
                        </div>
                        <input
                          type="range" min={1} max={500} value={exposure}
                          onChange={(e) => setExposure(Number(e.target.value))}
                          className="w-full h-1.5 appearance-none rounded-full accent-slate-800 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Capture button */}
                    <button
                      onClick={simulateDetection}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2 shrink-0"
                    >
                      <Camera className="h-4 w-4" />
                      Capturar
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  LABELING TAB                                   */
/* ─────────────────────────────────────────────── */
function LabelingTab({ image, detections, setDetections, selectedDetection, setSelectedDetection, viewBox, onCommit }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateHeliographic = (px: number, py: number) => {
    const rx = viewBox.w / 2;
    const ry = viewBox.h / 2;
    const R = Math.min(rx, ry);
    const dx = px - rx;
    const dy = ry - py;
    const lat = Math.asin(Math.min(1, Math.abs(dy) / R) * Math.sign(dy)) * (180 / Math.PI);
    const cosLat = Math.cos(lat * Math.PI / 180);
    const lon = cosLat === 0 ? 0 : Math.asin(Math.min(1, Math.abs(dx) / (R * cosLat)) * Math.sign(dx)) * (180 / Math.PI);
    return { lat, lon };
  };

  const handleAddBox = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
    const { lat, lon } = calculateHeliographic(x, y);
    const newBox = { id: Date.now(), x, y, w: 50, h: 50, lat, lon, mcintosh: "Axx", mag: "Alpha" };
    setDetections([...detections, newBox]);
    setSelectedDetection(newBox.id);
  };

  const deleteBox = (id: number) => {
    setDetections(detections.filter((d: any) => d.id !== id));
    if (selectedDetection === id) setSelectedDetection(null);
  };

  const selectedData = detections.find((d: any) => d.id === selectedDetection);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* ── Canvas Area ── */}
        <div
          className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden flex items-center justify-center cursor-crosshair min-h-[280px] sm:min-h-[380px]"
          ref={containerRef}
          onDoubleClick={handleAddBox}
        >
          {!image ? (
            <div className="text-center space-y-3 p-8">
              <AlertCircle className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="text-sm font-bold text-slate-400">Sin Datos de Imagen</p>
            </div>
          ) : (
            <div className="relative w-full max-w-[560px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-black shadow-sm" style={{ aspectRatio: "1/1" }}>
              <img src={image} alt="Solar Disk" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="absolute inset-0 w-full h-full">
                {detections.map((d: any) => (
                  <g key={d.id} onClick={(e) => { e.stopPropagation(); setSelectedDetection(d.id); }} className="cursor-pointer">
                    <rect
                      x={d.x - d.w / 2} y={d.y - d.h / 2} width={d.w} height={d.h}
                      fill="transparent"
                      stroke={selectedDetection === d.id ? "#fff" : "#94a3b8"}
                      strokeWidth="4"
                      className="transition-all"
                    />
                    <text x={d.x + d.w / 2 + 8} y={d.y + 10} fill="#fff" fontSize="20" fontWeight="700">
                      {d.mcintosh}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          <div className="absolute top-3 left-3 right-3 flex flex-wrap justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded text-slate-700 text-[10px] font-black uppercase tracking-widest">
              Mode: Manual Analysis
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded text-slate-400 text-[10px] font-bold">
              Double-Click to Mark
            </span>
          </div>
        </div>

        {/* ── Classification Panel ── */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full gap-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">
              Data Mapping
            </h3>

            {selectedData ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400 flex-1">
                <div className="aspect-square w-full max-w-[180px] mx-auto bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
                  <img
                    src={image}
                    alt="Crop"
                    className="absolute"
                    style={{
                      left: `${50 - (selectedData.x / viewBox.w) * 100}%`,
                      top: `${50 - (selectedData.y / viewBox.h) * 100}%`,
                      transform: `translate(-50%, -50%) scale(8)`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Lat.</span>
                    <span className="text-sm font-bold text-slate-900">{selectedData.lat.toFixed(2)}°</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Lon.</span>
                    <span className="text-sm font-bold text-slate-900">{selectedData.lon.toFixed(2)}°</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">McIntosh Class</label>
                  <select
                    value={selectedData.mcintosh}
                    onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh: e.target.value } : d))}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-slate-700 transition-all"
                  >
                    <option value="Axx">Type Axx (Single)</option>
                    <option value="Dkc">Type Dkc (Complex)</option>
                    <option value="Bxo">Type Bxo (Binary)</option>
                  </select>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Dkc (92%)", "Dko (7%)", "Cki (1%)"].map((rec, i) => (
                      <span key={rec} className={cn("px-2.5 py-1 rounded text-xs font-bold", i === 0 ? "bg-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-500")}>
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteBox(selectedDetection!)}
                  className="w-full py-2.5 text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                >
                  Descartar Observación
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <LayoutGrid className="h-9 w-9 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Selecciona una coordenada<br />o haz doble-click en el disco
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                {detections.length} mancha{detections.length !== 1 ? "s" : ""} registrada{detections.length !== 1 ? "s" : ""}
              </p>
              <button
                disabled={detections.length === 0}
                onClick={onCommit}
                className={cn(
                  "w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  detections.length > 0
                    ? "bg-slate-800 text-white hover:bg-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                )}
              >
                <Save className="h-4 w-4" />
                Commit y generar Informe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  REPORT TAB                                     */
/* ─────────────────────────────────────────────── */
function ReportTab({ metadata, detections }: any) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center h-full bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 flex flex-col mb-10 text-slate-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center text-white font-black text-sm shadow-sm">SOL</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Record Log</h2>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-widest">Heliographic Research Center — FIUNA</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Referencia</p>
            <p className="text-base font-mono font-bold text-slate-900">REF-{metadata.date.replace(/-/g, "")}-S3</p>
          </div>
        </div>

        {/* Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black border-b border-slate-100 pb-2 text-slate-500 uppercase tracking-widest">Credenciales del Observador</h4>
            <p className="text-base font-bold text-slate-900">{metadata.professional}</p>
            <p className="text-sm font-medium text-slate-500">{metadata.position}</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black border-b border-slate-100 pb-2 text-slate-500 uppercase tracking-widest">Contexto Espaciotemporal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Fecha</p>
                <p className="text-sm font-mono font-medium text-slate-900">{metadata.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Hora</p>
                <p className="text-sm font-mono font-medium text-slate-900">{metadata.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black border-b border-slate-100 pb-2 flex justify-between items-center text-slate-500 uppercase tracking-widest">
            Sub-regiones Analizadas
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-black">
              {detections.length} conteos
            </span>
          </h4>

          {detections.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
              <AlertCircle className="h-8 w-8 mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-400">Sin datos de observación</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 border-b border-slate-200 bg-slate-50 uppercase tracking-widest">
                    <th className="p-4">UUID</th>
                    <th className="p-4 text-center">Lat (°)</th>
                    <th className="p-4 text-center">Lon (°)</th>
                    <th className="p-4">Clase</th>
                    <th className="p-4 text-right">Magnético</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {detections.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">0x{d.id.toString(16).slice(-4)}</td>
                      <td className="p-4 text-center font-bold text-slate-900">{d.lat.toFixed(2)}</td>
                      <td className="p-4 text-center font-bold text-slate-900">{d.lon.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-bold text-slate-700">{d.mcintosh}</span>
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-slate-600">{d.mag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secured Report Hash</p>
            <div className="h-px w-28 bg-slate-200" />
            <p className="text-[10px] font-semibold text-slate-400">Generated via Sunspot Intelligence Kernel v4.6</p>
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 shadow-sm transition-all">
            Descargar Copia Física
          </button>
        </div>
      </div>
    </div>
  );
}
