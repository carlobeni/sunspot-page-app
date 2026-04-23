import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
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
  Focus,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { runYoloInference } from "../lib/yolo-inference";
import { runClassificationInference, getConditionedProbs } from "../lib/classification-inference";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = "imagen" | "agrupamiento" | "clasificacion" | "informe";

// Defines which tabs are unlocked based on pipeline state
function getUnlockedTabs(image: string | null, detections: any[], confirmed: boolean): Tab[] {
  const unlocked: Tab[] = ["imagen"];
  if (image) unlocked.push("agrupamiento");
  if (image && detections.length > 0) unlocked.push("clasificacion");
  if (image && detections.length > 0 && confirmed) unlocked.push("informe");
  return unlocked;
}

export default function ObservatoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("imagen");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<number | null>(null);
  const [viewBox] = useState({ w: 1024, h: 1024 });
  const [confirmed, setConfirmed] = useState(false);

  const [metadata, setMetadata] = useState({
    professional: "Carlos Benítez",
    position: "Investigador Principal",
    source: 'Observatorio Astrónomico "Prof. Alexis Troche Boggino"',
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: "Asunción, Paraguay",
  });

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const unlockedTabs = getUnlockedTabs(image, detections, confirmed);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (image && !confirmed) {
        e.preventDefault();
        e.returnValue = "Estás realizando un registro, si sales perderás toda la información. ¿Deseas salir?";
        return e.returnValue;
      }
    };

    const handleRouteChange = (url: string) => {
      // Si hay imagen y no ha confirmado el reporte final, mostrar modal
      if (image && !confirmed && !showExitModal) {
        setPendingUrl(url);
        setShowExitModal(true);
        router.events.emit('routeChangeError');
        throw "Route change aborted by user.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [image, confirmed, router]);

  const handleImageSet = (img: string | null) => {
    setImage(img);
    if (img) setActiveTab("agrupamiento");
    else {
      setDetections([]);
      setActiveTab("imagen");
    }
  };

  const handleInference = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const img = new window.Image();
      img.src = image;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const boxes = await runYoloInference(img, viewBox.w, viewBox.h);
      
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

      const newDetections = boxes.map((box, i) => {
        const cx = (box.x1 + box.x2) / 2;
        const cy = (box.y1 + box.y2) / 2;
        const w = box.x2 - box.x1;
        const h = box.y2 - box.y1;
        const { lat, lon } = calculateHeliographic(cx, cy);
        return {
          id: Date.now() + i,
          x: cx,
          y: cy,
          w: w,
          h: h,
          lat,
          lon,
          mcintosh: "Axx",
          mag_class: "None"
        };
      });

      setDetections(newDetections);
      setConfirmed(false);
      
    } catch (err) {
      console.error(err);
      alert("Error ejecutando modelo ONNX.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS: { id: Tab; label: string; icon: any; desc: string }[] = [
    { id: "imagen", label: "Imagen", icon: ImageIcon, desc: "Cargar imagen solar" },
    { id: "agrupamiento", label: "Agrupamiento", icon: Focus, desc: "Detección YOLO" },
    { id: "clasificacion", label: "Clasificación", icon: Tags, desc: "Análisis ConvNextV2" },
    { id: "informe", label: "Informe", icon: FileText, desc: "Generar reporte" },
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
          />
        )}
        {activeTab === "agrupamiento" && (
          <GroupingTab
            image={image}
            detections={detections}
            setDetections={setDetections}
            selectedDetection={selectedDetection}
            setSelectedDetection={setSelectedDetection}
            viewBox={viewBox}
            onRunInference={handleInference}
            loading={loading}
            onNext={() => setActiveTab("clasificacion")}
          />
        )}
        {activeTab === "clasificacion" && (
          <ClassificationTab
            image={image}
            detections={detections}
            setDetections={setDetections}
            selectedDetection={selectedDetection}
            setSelectedDetection={setSelectedDetection}
            viewBox={viewBox}
            onCommit={() => {
              setConfirmed(true);
              setActiveTab("informe");
            }}
          />
        )}
          {activeTab === "informe" && <ReportTab metadata={metadata} detections={detections} image={image} viewBox={viewBox} />}
        </div>

        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center mb-2">Registro en Progreso</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">
                Estás realizando un registro activo. Si sales de esta sección ahora, se perderá toda la información y las detecciones realizadas.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                >
                  Continuar Registro
                </button>
                <button 
                  onClick={() => {
                    const url = pendingUrl;
                    setImage(null); // Limpiar para permitir navegación
                    setShowExitModal(false);
                    if (url) router.push(url);
                  }}
                  className="w-full py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 border border-red-100 transition-all"
                >
                  Salir y Perder Datos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

/* ─────────────────────────────────────────────── */
/* ─────────────────────────────────────────────── */
/*  IMAGE TAB                                      */
/* ─────────────────────────────────────────────── */
function ImageTab({ metadata, setMetadata, image, setImage }: any) {
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
                      onClick={() => {}}
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
                      onClick={() => {}}
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
/* ─────────────────────────────────────────────── */
/*  GROUPING TAB (STAGE 1)                         */
/* ─────────────────────────────────────────────── */
function GroupingTab({ image, detections, setDetections, selectedDetection, setSelectedDetection, viewBox, onRunInference, loading, onNext }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [action, setAction] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0 });

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
    const newBox = { id: Date.now(), x, y, w: 50, h: 50, lat, lon, mcintosh: "Axx", mag_class: "None" };
    setDetections([...detections, newBox]);
    setSelectedDetection(newBox.id);
  };

  const handleActionStart = (e: React.MouseEvent, type: string, box: any) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
    setAction(type);
    setDragStart({ x, y, w: box.w, h: box.h, cx: box.x, cy: box.y });
    setSelectedDetection(box.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!action || selectedDetection === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    let newW = dragStart.w;
    let newH = dragStart.h;
    let newCx = dragStart.cx;
    let newCy = dragStart.cy;

    if (action === 'move') {
      newCx += dx;
      newCy += dy;
    } else {
      if (action.includes('e')) { newW += dx; newCx += dx / 2; }
      if (action.includes('w')) { newW -= dx; newCx += dx / 2; }
      if (action.includes('s')) { newH += dy; newCy += dy / 2; }
      if (action.includes('n')) { newH -= dy; newCy += dy / 2; }
    }

    newW = Math.max(10, newW);
    newH = Math.max(10, newH);

    const { lat, lon } = calculateHeliographic(newCx, newCy);

    setDetections(detections.map((d: any) => 
      d.id === selectedDetection ? { ...d, w: newW, h: newH, x: newCx, y: newCy, lat, lon } : d
    ));
  };

  const handleMouseUp = () => {
    setAction(null);
  };

  const deleteBox = (id: number) => {
    setDetections(detections.filter((d: any) => d.id !== id));
    if (selectedDetection === id) setSelectedDetection(null);
  };

  const selectedData = detections.find((d: any) => d.id === selectedDetection);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* ── Canvas Area ── */}
        <div
          className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden flex items-center justify-center cursor-crosshair min-h-[280px] sm:min-h-[380px]"
          ref={containerRef}
          onDoubleClick={handleAddBox}
          onMouseMove={handleMouseMove}
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
                <g opacity="0.4" pointerEvents="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="6 4">
                    {[-60, -30, 0, 30, 60].map(phi => {
                        const R = viewBox.w / 2;
                        const x0 = R;
                        const y0 = R;
                        const r_p = R * Math.cos(phi * Math.PI / 180);
                        const y_p = y0 - R * Math.sin(phi * Math.PI / 180);
                        return (
                            <g key={`lat-${phi}`}>
                                <ellipse cx={x0} cy={y_p} rx={r_p} ry={r_p * 0.15} fill="none" />
                                <text x={x0 + r_p + 15} y={y_p + 5} fill="white" fontSize="24" fontWeight="bold" stroke="none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{phi}°</text>
                            </g>
                        );
                    })}
                    {[-60, -30, 0, 30, 60].map(lam => {
                        const R = viewBox.w / 2;
                        const x0 = R;
                        const y0 = R;
                        const rx = R * Math.sin(lam * Math.PI / 180);
                        return (
                            <g key={`lon-${lam}`}>
                                <ellipse cx={x0} cy={y0} rx={rx} ry={R} fill="none" />
                                <text x={x0 + rx} y={y0 + R + 40} fill="white" fontSize="24" fontWeight="bold" textAnchor="middle" stroke="none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{lam}°</text>
                            </g>
                        );
                    })}
                </g>
                {detections.map((d: any) => (
                  <g key={d.id} onMouseDown={(e) => handleActionStart(e, 'move', d)} className={selectedDetection === d.id ? "cursor-move" : "cursor-pointer"}>
                    <rect
                      x={d.x - d.w / 2} y={d.y - d.h / 2} width={d.w} height={d.h}
                      fill={selectedDetection === d.id ? "rgba(34,197,94,0.1)" : "transparent"}
                      stroke={selectedDetection === d.id ? "#22c55e" : "#16a34a"}
                      strokeWidth="4"
                      className="transition-all"
                    />
                    {selectedDetection === d.id && (
                      <>
                        <circle cx={d.x - d.w / 2} cy={d.y - d.h / 2} r="10" fill="#22c55e" stroke="white" strokeWidth="2" className="cursor-nwse-resize hover:fill-emerald-600 transition-colors" onMouseDown={(e) => handleActionStart(e, 'nw', d)} />
                        <circle cx={d.x + d.w / 2} cy={d.y - d.h / 2} r="10" fill="#22c55e" stroke="white" strokeWidth="2" className="cursor-nesw-resize hover:fill-emerald-600 transition-colors" onMouseDown={(e) => handleActionStart(e, 'ne', d)} />
                        <circle cx={d.x - d.w / 2} cy={d.y + d.h / 2} r="10" fill="#22c55e" stroke="white" strokeWidth="2" className="cursor-nesw-resize hover:fill-emerald-600 transition-colors" onMouseDown={(e) => handleActionStart(e, 'sw', d)} />
                        <circle cx={d.x + d.w / 2} cy={d.y + d.h / 2} r="10" fill="#22c55e" stroke="white" strokeWidth="2" className="cursor-nwse-resize hover:fill-emerald-600 transition-colors" onMouseDown={(e) => handleActionStart(e, 'se', d)} />
                      </>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* ── Control Panel ── */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0" onMouseMove={(e) => e.stopPropagation()}>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full gap-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">
              Etapa 1: Agrupamiento
            </h3>

            <div className="space-y-4">
              <button
                onClick={onRunInference}
                disabled={loading || !image}
                className="w-full py-3 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                Ejecutar Modelo YOLO
              </button>
              <p className="text-xs text-slate-500 text-center">
                El modelo ONNX identificará automáticamente las manchas solares. Puedes editar las cajas desde sus esquinas.
              </p>
            </div>

            {selectedData && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editar Bounding Box</h4>
                <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Ancho (px)</span>
                    <input type="number" value={Math.round(selectedData.w)} onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedData.id ? {...d, w: Number(e.target.value)} : d))} className="w-full text-center text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Alto (px)</span>
                    <input type="number" value={Math.round(selectedData.h)} onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedData.id ? {...d, h: Number(e.target.value)} : d))} className="w-full text-center text-sm font-bold text-slate-900 outline-none" />
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Latitud</span>
                    <span className="w-full text-center text-sm font-bold text-slate-900 block">{selectedData.lat.toFixed(2)}°</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Longitud</span>
                    <span className="w-full text-center text-sm font-bold text-slate-900 block">{selectedData.lon.toFixed(2)}°</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteBox(selectedDetection!)}
                  className="w-full py-2 text-sm font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                >
                  Eliminar Caja
                </button>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                {detections.length} mancha{detections.length !== 1 ? "s" : ""} agrupada{detections.length !== 1 ? "s" : ""}
              </p>
              <button
                disabled={detections.length === 0}
                onClick={onNext}
                className={cn(
                  "w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  detections.length > 0
                    ? "bg-slate-800 text-white hover:bg-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                )}
              >
                Siguiente (Clasificación)
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CropImage({ imageSrc, detection, viewBox }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      // Create 224x224 black background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 224, 224);

      const scaleX = img.width / viewBox.w;
      const scaleY = img.height / viewBox.h;

      const srcX = (detection.x - detection.w / 2) * scaleX;
      const srcY = (detection.y - detection.h / 2) * scaleY;
      const srcW = detection.w * scaleX;
      const srcH = detection.h * scaleY;

      // Fit into 224x224 maintaining aspect ratio
      const scale = Math.min(1, 224 / srcW, 224 / srcH);
      const dstW = srcW * scale;
      const dstH = srcH * scale;
      const dstX = (224 - dstW) / 2;
      const dstY = (224 - dstH) / 2;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
    };
  }, [imageSrc, detection, viewBox]);

  return <canvas ref={canvasRef} width={224} height={224} className="w-full h-full object-contain bg-black" />;
}

const MCINTOSH_CLASSES = [
  'Axx', 'Bxo', 'Bxi', 'Hrx', 'Cro', 'Cri', 'Hax', 'Cao', 'Cai', 'Hsx', 'Cso', 
  'Csi', 'Dro', 'Ero', 'Fro', 'Dri', 'Eri', 'Fri', 'Dao', 'Eao', 'Fao', 'Dai', 
  'Eai', 'Fai', 'Dso', 'Eso', 'Fso', 'Dsi', 'Esi', 'Fsi', 'Dac', 'Eac', 'Fac', 
  'Dsc', 'Esc', 'Fsc', 'Hkx', 'Cko', 'Cki', 'Hhx', 'Cho', 'Chi', 'Dko', 'Eko', 
  'Fko', 'Dki', 'Eki', 'Fki', 'Dho', 'Eho', 'Fho', 'Dhi', 'Ehi', 'Fhi', 'Dkc', 
  'Ekc', 'Fkc', 'Dhc', 'Ehc', 'Fhc'
];

const MAGNETIC_CLASSES = [
  'None', 'Alpha', 'Beta', 'Gamma', 'Beta-Gamma', 'Beta-Delta', 'Beta-Gamma-Delta', 'Gamma-Delta'
];

/* ─────────────────────────────────────────────── */
/*  CLASSIFICATION TAB (STAGE 2)                   */
/* ─────────────────────────────────────────────── */
function ClassificationTab({ image, detections, setDetections, selectedDetection, setSelectedDetection, viewBox, onCommit }: any) {
  const selectedData = detections.find((d: any) => d.id === selectedDetection);
  
  useEffect(() => {
    if (!selectedData && detections.length > 0) {
      setSelectedDetection(detections[0].id);
    }
  }, [selectedData, detections, setSelectedDetection]);

  const [inferenceResults, setInferenceResults] = useState<Record<number, any>>({});
  const [loadingInference, setLoadingInference] = useState(false);

  // Run inference when a detection is selected if not already done
  useEffect(() => {
    if (!selectedDetection || !selectedData || inferenceResults[selectedDetection]) return;

    const runInference = async () => {
      setLoadingInference(true);
      try {
        // Create a temporary canvas to get the crop
        const canvas = document.createElement("canvas");
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = image;
        await new Promise((resolve) => { img.onload = resolve; });

        const scaleX = img.width / viewBox.w;
        const scaleY = img.height / viewBox.h;

        const srcX = (selectedData.x - selectedData.w / 2) * scaleX;
        const srcY = (selectedData.y - selectedData.h / 2) * scaleY;
        const srcW = selectedData.w * scaleX;
        const srcH = selectedData.h * scaleY;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 224, 224);

        const scale = Math.min(1, 224 / srcW, 224 / srcH);
        const dstW = srcW * scale;
        const dstH = srcH * scale;
        const dstX = (224 - dstW) / 2;
        const dstY = (224 - dstH) / 2;

        ctx.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);

        const result = await runClassificationInference(canvas);
        setInferenceResults(prev => ({ ...prev, [selectedDetection]: result }));
        
        // Auto-select best recommendation if mcintosh is default Axx
        if (selectedData.mcintosh === "Axx") {
          const { pZ, pP, pC, validMask, classes } = result;
          // Find best Z
          const zi = pZ.indexOf(Math.max(...pZ));
          // Get conditioned P
          const { condP } = getConditionedProbs(pZ, pP, pC, validMask, zi, null);
          const pi = condP.indexOf(Math.max(...condP));
          // Get conditioned C
          const { condC } = getConditionedProbs(pZ, pP, pC, validMask, zi, pi);
          const ci = condC.indexOf(Math.max(...condC));

          const mcintosh = `${classes.Z[zi]}${classes.P[pi]}${classes.C[ci]}`;
          setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh } : d));
        }

      } catch (err) {
        console.error("Classification inference error:", err);
      } finally {
        setLoadingInference(false);
      }
    };

    runInference();
  }, [selectedDetection, selectedData, image, viewBox, inferenceResults, setDetections, detections]);

  const currentResult = selectedDetection ? inferenceResults[selectedDetection] : null;

  // Split McIntosh string into Z, P, C
  const mcZ = selectedData?.mcintosh?.[0] || "";
  const mcP = selectedData?.mcintosh?.[1] || "";
  const mcC = selectedData?.mcintosh?.[2] || "";

  const zi = currentResult?.classes.Z.indexOf(mcZ) ?? -1;
  const pi = currentResult?.classes.P.indexOf(mcP) ?? -1;
  const ci = currentResult?.classes.C.indexOf(mcC) ?? -1;

  const { condP, condC } = currentResult 
    ? getConditionedProbs(currentResult.pZ, currentResult.pP, currentResult.pC, currentResult.validMask, zi !== -1 ? zi : null, pi !== -1 ? pi : null)
    : { condP: [], condC: [] };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col bg-slate-50">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
        {/* ── Crops Grid ── */}
        <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-5 overflow-y-auto min-h-[280px]">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
            Recortes Detectados ({detections.length})
            <span className="bg-slate-100 px-2 py-1 rounded text-[10px]">224x224 px norm.</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {detections.map((d: any) => (
              <div 
                key={d.id} 
                onClick={() => setSelectedDetection(d.id)}
                className={cn(
                  "aspect-square bg-black rounded-lg overflow-hidden border-2 cursor-pointer transition-all relative group flex items-center justify-center",
                  selectedDetection === d.id 
                    ? "border-emerald-500 ring-4 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 scale-[1.02]" 
                    : "border-slate-200 hover:border-slate-400"
                )}
              >
                <CropImage imageSrc={image} detection={d} viewBox={viewBox} />
                
                {/* Loading Overlay */}
                {loadingInference && selectedDetection === d.id && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Analizando</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-white block">UUID: {d.id.toString(16).slice(-4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Classification Panel ── */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full gap-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-4">
              Etapa 2: Clasificación Manual
            </h3>

            {selectedData ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400 flex-1">
                <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Lat. Heliográfica</span>
                    <span className="text-sm font-bold text-slate-900">{selectedData.lat.toFixed(2)}°</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Lon. Heliográfica</span>
                    <span className="text-sm font-bold text-slate-900">{selectedData.lon.toFixed(2)}°</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="h-3 w-3" /> Recomendaciones ConvNextV2 (Conf. Global)
                    </p>
                    {loadingInference ? (
                      <div className="flex items-center gap-2 py-1">
                        <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">Analizando...</span>
                      </div>
                    ) : currentResult ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(() => {
                          const { pZ, pP, pC, validMask, classes } = currentResult;
                          const recommendations = [];
                          
                          // Top 3 combinations
                          const combos: { mc: string, prob: number }[] = [];
                          for (let zi = 0; zi < 7; zi++) {
                            for (let pi = 0; pi < 6; pi++) {
                              for (let ci = 0; ci < 4; ci++) {
                                if (validMask[zi * 24 + pi * 4 + ci] === 1) {
                                  // Simplified joint prob as product
                                  const prob = pZ[zi] * pP[pi] * pC[ci];
                                  combos.push({ mc: `${classes.Z[zi]}${classes.P[pi]}${classes.C[ci]}`, prob });
                                }
                              }
                            }
                          }
                          combos.sort((a, b) => b.prob - a.prob);
                          
                          return combos.slice(0, 3).map((c, i) => (
                            <button
                              key={c.mc}
                              onClick={() => setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh: c.mc } : d))}
                              className={cn(
                                "px-2.5 py-1 rounded text-[11px] font-bold transition-all shadow-sm", 
                                selectedData.mcintosh === c.mc 
                                  ? "bg-emerald-600 text-white shadow-emerald-200" 
                                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                              )}
                            >
                              {c.mc} ({(c.prob * 100).toFixed(0)}%)
                            </button>
                          ));
                        })()}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No hay datos de inferencia</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Character Z */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                        Carácter Z (Tipo de Grupo)
                        {currentResult && <span className="text-emerald-600">{(currentResult.pZ[zi] * 100 || 0).toFixed(1)}% conf. Z</span>}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {currentResult?.classes.Z.map((char: string, idx: number) => (
                          <button
                            key={char}
                            onClick={() => {
                              const newMc = char + "xx"; // Reset others on Z change
                              setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh: newMc } : d));
                            }}
                            className={cn(
                              "h-9 w-9 flex items-center justify-center rounded-md text-xs font-black transition-all border shadow-sm",
                              mcZ === char 
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-110 z-10" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                            )}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Character P */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                        Carácter P (Penumbras)
                        {currentResult && zi !== -1 && <span className="text-emerald-600">{(condP[pi] * 100 || 0).toFixed(1)}% conf. P</span>}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {currentResult?.classes.P.map((char: string, idx: number) => {
                          const isValid = currentResult.validMask.slice(zi * 24 + idx * 4, zi * 24 + idx * 4 + 4).some((v: number) => v === 1);
                          return (
                            <button
                              key={char}
                              disabled={!isValid || zi === -1}
                              onClick={() => {
                                const newMc = mcZ + char + "x";
                                setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh: newMc } : d));
                              }}
                              className={cn(
                                "h-9 w-9 flex items-center justify-center rounded-md text-xs font-black transition-all border shadow-sm",
                                mcP === char 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-110 z-10" 
                                  : !isValid || zi === -1
                                  ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed opacity-50"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                              )}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Character C */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                        Carácter C (Distribución)
                        {currentResult && zi !== -1 && pi !== -1 && <span className="text-emerald-600">{(condC[ci] * 100 || 0).toFixed(1)}% conf. C</span>}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {currentResult?.classes.C.map((char: string, idx: number) => {
                          const isValid = currentResult.validMask[zi * 24 + pi * 4 + idx] === 1;
                          return (
                            <button
                              key={char}
                              disabled={!isValid || pi === -1}
                              onClick={() => {
                                const newMc = mcZ + mcP + char;
                                setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mcintosh: newMc } : d));
                              }}
                              className={cn(
                                "h-9 w-9 flex items-center justify-center rounded-md text-xs font-black transition-all border shadow-sm",
                                mcC === char 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-110 z-10" 
                                  : !isValid || pi === -1
                                  ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed opacity-50"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                              )}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clasificación Magnética (Opcional)</label>
                      <select
                        value={selectedData.mag_class || "None"}
                        onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedDetection ? { ...d, mag_class: e.target.value } : d))}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-slate-700 transition-all shadow-sm"
                      >
                        {MAGNETIC_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    {/* Technical Note */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                      <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-slate-400" /> Nota de Configuración
                      </h5>
                      <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                        Los niveles de confianza para cada carácter (Z, P, C) se calculan mediante una máscara de validación jerárquica desfragmentada de las 60 clases McIntosh originales. 
                        El modelo <strong>ConvNextV2</strong> permite generar tanto una recomendación global como asistencia específica para cada paso del etiquetado, bloqueando automáticamente combinaciones inexistentes para asegurar la integridad científica del registro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <LayoutGrid className="h-9 w-9 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Selecciona un recorte<br />para clasificar
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
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
                Confirmar y Generar Informe
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
/* ─────────────────────────────────────────────── */
/*  REPORT TAB                                     */
/* ─────────────────────────────────────────────── */
function ReportTab({ metadata, detections, image, viewBox }: any) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    console.log("Iniciando generación de PDF...");
    try {
      const summaryElement = document.getElementById("report-summary");
      const tableElement = document.getElementById("report-table");
      
      console.log("Elementos encontrados:", { summary: !!summaryElement, table: !!tableElement });
      
      if (!summaryElement || !tableElement) {
        alert("No se encontraron los elementos del informe en el DOM.");
        setDownloading(false);
        return;
      }
      
      const captureOptions = {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true, // Enable html2canvas internal logging
      };

      console.log("Capturando resumen...");
      const canvasSummary = await html2canvas(summaryElement, captureOptions);
      console.log("Resumen capturado.");
      
      console.log("Capturando tabla...");
      const canvasTable = await html2canvas(tableElement, captureOptions);
      console.log("Tabla capturada.");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // PAGE 1: Summary
      const imgWidth1 = pdfWidth;
      const imgHeight1 = (canvasSummary.height * pdfWidth) / canvasSummary.width;
      pdf.addImage(canvasSummary.toDataURL("image/png"), "PNG", 0, 0, imgWidth1, imgHeight1);
      
      // PAGE 2+: Table
      console.log("Procesando páginas de la tabla...");
      pdf.addPage();
      const imgWidth2 = pdfWidth;
      const imgHeight2 = (canvasTable.height * pdfWidth) / canvasTable.width;
      
      if (imgHeight2 <= pdfHeight) {
        pdf.addImage(canvasTable.toDataURL("image/png"), "PNG", 0, 0, imgWidth2, imgHeight2);
      } else {
        let sourceY = 0;
        let isFirstTablePage = true;
        const pxPageHeight = Math.floor((pdfHeight * canvasTable.width) / pdfWidth);
        
        if (pxPageHeight <= 0) {
          pdf.addImage(canvasTable.toDataURL("image/png"), "PNG", 0, 0, imgWidth2, imgHeight2);
        } else {
          while (sourceY < canvasTable.height) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvasTable.width;
            const currentSliceHeight = Math.min(pxPageHeight, canvasTable.height - sourceY);
            pageCanvas.height = currentSliceHeight;
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvasTable, 0, sourceY, canvasTable.width, currentSliceHeight, 0, 0, canvasTable.width, currentSliceHeight);
              if (!isFirstTablePage) pdf.addPage();
              const finalSliceHeight = (currentSliceHeight * pdfWidth) / canvasTable.width;
              pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, finalSliceHeight);
              isFirstTablePage = false;
            }
            sourceY += pxPageHeight;
            if (sourceY <= 0) break;
          }
        }
      }

      console.log("Guardando PDF...");
      pdf.save(`Informe_Solar_${metadata.date.replace(/-/g, "")}.pdf`);
      console.log("PDF Guardado.");
    } catch (err: any) {
      console.error("Error detallado al generar PDF:", err);
      alert(`Error al generar el PDF: ${err.message || "Error desconocido"}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center h-full bg-[#f8fafc] overflow-y-auto w-full">
      <div 
        ref={reportRef}
        className="max-w-4xl w-full flex flex-col mb-10 gap-10"
      >
        <div id="report-summary" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-sm p-6 sm:p-10 flex flex-col text-[#0f172a]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-[#e2e8f0] pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#0f172a] border border-[#1e293b] rounded-md flex items-center justify-center text-white font-black text-sm shadow-sm">SOL</div>
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Informe de Observación Heliográfica</h2>
              <p className="text-[11px] font-semibold text-[#94a3b8] mt-0.5 uppercase tracking-widest">Heliographic Research Center — FIUNA</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Referencia</p>
            <p className="text-base font-mono font-bold text-[#0f172a]">REF-{metadata.date.replace(/-/g, "")}-S3</p>
          </div>
        </div>

        {/* Visual Summary */}
        <div className="mb-10 space-y-4">
          <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Resumen Visual del Disco</h4>
          <div className="aspect-square max-w-sm mx-auto bg-black rounded-full overflow-hidden border-4 border-[#f1f5f9] shadow-xl relative">
            <img src={image} alt="Full Disk" className="w-full h-full object-cover" />
            <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="absolute inset-0 w-full h-full opacity-40">
               {detections.map((d: any) => (
                 <rect key={d.id} x={d.x - d.w/2} y={d.y-d.h/2} width={d.w} height={d.h} fill="none" stroke="#22c55e" strokeWidth="4" />
               ))}
            </svg>
          </div>
        </div>

        {/* Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Credenciales del Observador</h4>
            <p className="text-base font-bold text-[#0f172a]">{metadata.professional}</p>
            <p className="text-sm font-medium text-[#64748b]">{metadata.position}</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Contexto Espaciotemporal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Fecha</p>
                <p className="text-sm font-mono font-medium text-[#0f172a]">{metadata.date}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Hora</p>
                <p className="text-sm font-mono font-medium text-[#0f172a]">{metadata.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mb-10 p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9] space-y-2">
          <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-3 w-3" /> Observaciones del Sistema
          </h4>
          <p className="text-xs text-[#475569] leading-relaxed">
            Este registro ha sido generado mediante un proceso de análisis híbrido. El agrupamiento inicial de manchas solares fue realizado por el modelo de visión artificial <strong>YOLO26n</strong>. La clasificación morfológica sugerida y el procesamiento de recortes normalizados de 224x224 fueron gestionados por la arquitectura <strong>ConvNextV2</strong>, con validación final por parte del observador.
          </p>
        </div>
        </div>

        {/* Table Section (Page 2+) */}
        <div id="report-table" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-sm p-6 sm:p-10 flex flex-col text-[#0f172a]">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 flex justify-between items-center text-[#64748b] uppercase tracking-widest">
            Detalle de Manchas Detectadas
            <span className="text-[#475569] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#e2e8f0] text-[10px] font-black">
              {detections.length} registros
            </span>
          </h4>

          {detections.length === 0 ? (
            <div className="py-12 border border-dashed border-[#e2e8f0] flex flex-col items-center justify-center bg-[#f8fafc] rounded-lg">
              <AlertCircle className="h-8 w-8 mb-3 text-[#cbd5e1]" />
              <p className="text-sm font-bold text-[#94a3b8]">Sin datos de observación</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-[10px] font-black text-[#94a3b8] border-b border-[#e2e8f0] bg-[#f8fafc] uppercase tracking-widest">
                    <th className="p-4">Crop (224px)</th>
                    <th className="p-4">Lat/Lon (°)</th>
                    <th className="p-4">McIntosh</th>
                    <th className="p-4 text-right">Magnético</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] text-sm bg-white">
                  {detections.map((d: any) => (
                    <tr key={d.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="p-4">
                         <div className="w-16 h-16 bg-black rounded border border-[#e2e8f0] overflow-hidden">
                           <CropImage imageSrc={image} detection={d} viewBox={viewBox} />
                         </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0f172a]">{d.lat.toFixed(2)}° N/S</span>
                          <span className="font-medium text-[#94a3b8] text-xs">{d.lon.toFixed(2)}° E/W</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#0f172a] text-white px-2.5 py-1 rounded-md text-xs font-black shadow-sm">{d.mcintosh}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-bold text-[#334155]">{d.mag_class || "None"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Internal Footer (for PDF) */}
        <div className="mt-12 pt-6 border-t border-[#f1f5f9] flex justify-between items-end gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Secured Report Hash</p>
            <div className="h-px w-28 bg-[#e2e8f0]" />
            <p className="text-[10px] font-semibold text-[#94a3b8]">Generated via Sunspot Intelligence Kernel v4.6</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Firma Autorizada</p>
             <div className="h-px w-32 bg-[#0f172a] ml-auto" />
          </div>
        </div>
      </div>

      {/* External Action Button (Not visible in Ref/Canvas capture if handled carefully, or just at the bottom) */}
      <button 
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="max-w-4xl w-full px-5 py-4 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-20"
      >
        {downloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Descargar Copia Física (PDF A4)
          </>
        )}
      </button>
      </div>
    </div>
  );
}
