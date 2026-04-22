"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Telescope, 
  Image as ImageIcon, 
  Tags, 
  FileText, 
  Upload, 
  Camera, 
  Settings, 
  Play, 
  Save, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  User,
  Briefcase,
  Activity,
  X,
  LayoutGrid
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = "imagen" | "etiquetado" | "informe";

export default function ObservatoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("etiquetado"); 
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [selectedDetection, setSelectedDetection] = useState<number | null>(null);
  const [viewBox, setViewBox] = useState({ w: 1024, h: 1024 });

  // Metadata State
  const [metadata, setMetadata] = useState({
    professional: "Carlos Benítez",
    position: "Investigador Principal",
    source: "Observatorio Astrónomico \"Prof. Alexis Troche Boggino\"",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: "Asunción, Paraguay"
  });

  const simulateDetection = () => {
    setLoading(true);
    setTimeout(() => {
        setDetections([
            { id: 1, x: 520, y: 480, w: 60, h: 60, lat: 10.5, lon: -15.2, mcintosh: "Dkc", mag: "Beta" },
            { id: 2, x: 450, y: 550, w: 40, h: 40, lat: -12.1, lon: 5.4, mcintosh: "Axx", mag: "Alpha" }
        ]);
        setLoading(false);
        setActiveTab("etiquetado");
    }, 1500);
  };

  return (
    <div className="p-4 pt-20 lg:p-8 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Telescope className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
            Observatorio
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base font-medium max-w-xl hidden md:block">
            Captura y análisis de registros solares en tiempo real.
          </p>
        </div>
        {image && (
            <div className="flex gap-4">
                <button 
                  onClick={simulateDetection}
                  className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all w-full md:w-auto justify-center shadow-sm"
                >
                    {loading ? <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin"/> : <Activity className="h-4 w-4"/>}
                    Re-ejecutar modelo
                </button>
            </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center bg-white border border-slate-200 p-1 mb-8 self-start rounded-lg gap-1 shadow-sm">
        {[
          { id: "imagen", label: "Imagen", icon: ImageIcon },
          { id: "etiquetado", label: "Etiquetado", icon: Tags },
          { id: "informe", label: "Informe", icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-indigo-50 text-indigo-700 font-semibold" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === "imagen" && <ImageTab metadata={metadata} setMetadata={setMetadata} image={image} setImage={setImage} simulateDetection={simulateDetection} />}
        {activeTab === "etiquetado" && <LabelingTab image={image} detections={detections} setDetections={setDetections} selectedDetection={selectedDetection} setSelectedDetection={setSelectedDetection} viewBox={viewBox} />}
        {activeTab === "informe" && <ReportTab metadata={metadata} detections={detections} />}
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS NOIR REDESIGN --- */

function ImageTab({ metadata, setMetadata, image, setImage, simulateDetection }: any) {
  const [mode, setMode] = useState<"upload" | "capture" | null>(null);

  return (
    <div className="p-4 lg:p-8 flex flex-col h-full bg-slate-50">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left Side: Controls */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shadow-sm">1</span>
              Origen
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setMode("upload")}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all text-left group shadow-sm",
                  mode === "upload" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 bg-white"
                )}
              >
                <div className={cn("p-2.5 rounded-md border", mode === "upload" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200 group-hover:text-indigo-600")}>
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 text-sm mb-0.5">Cargar Archivo</span>
                  <span className="text-xs font-semibold text-slate-500">HMI / White-Light</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMode("capture")}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all text-left group shadow-sm",
                  mode === "capture" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 bg-white"
                )}
              >
                <div className={cn("p-2.5 rounded-md border", mode === "capture" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200 group-hover:text-indigo-600")}>
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 text-sm mb-0.5">Captura ZWO</span>
                  <span className="text-xs font-semibold text-slate-500">Live Pi5-A1</span>
                </div>
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs shadow-sm">2</span>
               Metadatos
            </h3>
            <div className="space-y-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Observador</label>
                 <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 shadow-sm">
                   <User className="h-4 w-4 text-slate-400" />
                   <input 
                    type="text" 
                    value={metadata.professional} 
                    onChange={(e) => setMetadata({...metadata, professional: e.target.value})}
                    className="flex-1 text-sm bg-transparent font-medium focus:outline-none text-slate-900" 
                  />
                 </div>
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rango</label>
                 <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 shadow-sm">
                   <Briefcase className="h-4 w-4 text-slate-400" />
                   <input 
                    type="text" 
                    value={metadata.position} 
                    onChange={(e) => setMetadata({...metadata, position: e.target.value})}
                    className="flex-1 text-sm bg-transparent font-medium focus:outline-none text-slate-900" 
                  />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha</label>
                   <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 shadow-sm">
                     <input type="date" value={metadata.date} readOnly className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-700" />
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hora</label>
                   <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 shadow-sm">
                     <input type="text" value={metadata.time} readOnly className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-700" />
                   </div>
                 </div>
               </div>
            </div>
          </section>
        </div>

        {/* Right Side: Viewport */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
          {image ? (
            <div className="relative w-full h-full p-4 lg:p-12 flex items-center justify-center">
                 <div className="relative w-full max-w-[500px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-black p-1 shadow-sm">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                 </div>
                 <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 bg-white/80 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-md backdrop-blur-sm shadow-sm transition-all"
                 >
                    <X className="h-5 w-5" />
                 </button>
            </div>
          ) : mode === null ? (
            <div className="text-center space-y-4 opacity-50">
              <Telescope className="h-12 w-12 text-slate-400 mx-auto" />
              <p className="text-slate-500 text-sm font-bold">Esperando Señal...</p>
            </div>
          ) : mode === "upload" ? (
            <div className="flex flex-col items-center gap-6 p-6 text-center">
               <label className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50 transition-all cursor-pointer group shadow-sm">
                  <Upload className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                  <span className="text-xs text-slate-500 font-bold">Examinar</span>
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        setImage(url);
                    }
                  }} />
               </label>
               <div className="text-center space-y-2">
                  <p className="text-slate-700 text-sm font-bold">Cargar registro histórico</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600 border border-slate-200">MAX: 4K</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600 border border-slate-200">Format: RAW/JPG</span>
                  </div>
               </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
               <div className="flex-1 flex items-center justify-center relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <div className="w-[70%] h-[70%] border-2 border-white rounded-lg border-dashed" />
                      <div className="absolute w-[90%] h-[90%] border-2 border-white rounded-full border-dashed" />
                  </div>
                  <div className="h-10 w-10 border-4 border-slate-800 border-t-indigo-500 rounded-xl animate-spin" />
                  
                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur p-4 lg:p-6 rounded-lg border border-slate-200 shadow-md">
                     <div className="flex flex-wrap gap-6">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Master Gain</label>
                          <input type="range" className="w-24 sm:w-32 accent-indigo-600 bg-slate-200" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Exp (ms)</label>
                          <input type="number" defaultValue={20} className="w-20 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-900 p-1.5 focus:border-indigo-500 outline-none shadow-sm" />
                        </div>
                     </div>
                     <button 
                        onClick={simulateDetection}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md text-sm font-bold shadow-sm transition-all w-full sm:w-auto"
                     >
                        <Camera className="h-4 w-4 inline-block mr-2" />
                        Capturar
                     </button>
                  </div>


                  <div className="absolute top-10 left-10 px-4 py-2 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                     Live Signal: PI5-SYNC
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LabelingTab({ image, detections, setDetections, selectedDetection, setSelectedDetection, viewBox }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const calculateHeliographic = (px: number, py: number) => {
    const rx = viewBox.w / 2;
    const ry = viewBox.h / 2;
    const R = Math.min(rx, ry);
    const dx = px - rx;
    const dy = ry - py;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    if (d > R) return { lat: 0, lon: 0 };
    
    const lat = Math.asin(dy / R) * (180 / Math.PI);
    const lon = Math.asin(dx / (R * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI);
    
    return { lat, lon };
  };

  const handleAddBox = (e: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
    
    const { lat, lon } = calculateHeliographic(x, y);

    const newBox = {
        id: Date.now(),
        x, y, w: 50, h: 50, lat, lon,
        mcintosh: "Axx", mag: "Alpha"
    };
    setDetections([...detections, newBox]);
    setSelectedDetection(newBox.id);
  };

  const deleteBox = (id: number) => {
    setDetections(detections.filter((d: any) => d.id !== id));
    if (selectedDetection === id) setSelectedDetection(null);
  };

  const selectedData = detections.find((d: any) => d.id === selectedDetection);

  return (
    <div className="p-4 lg:p-8 h-full flex flex-col bg-slate-50">
       <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Main Canvas Area */}
          <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-lg relative overflow-hidden flex items-center justify-center cursor-crosshair group"
               ref={containerRef}
               onDoubleClick={handleAddBox}
          >
             {!image ? (
                <div className="text-center space-y-4 opacity-50">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-500">Sin Datos de Imagen</p>
                </div>
             ) : (
                <div className="relative w-full h-full max-w-[600px] aspect-square rounded-full overflow-hidden border border-slate-200 bg-black shadow-sm">
                    <img src={image} alt="Solar Disk" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="absolute inset-0 w-full h-full">
                        {detections.map((d: any) => (
                            <g key={d.id} 
                               onClick={(e) => { e.stopPropagation(); setSelectedDetection(d.id); }}
                               className="cursor-pointer group"
                            >
                                <rect 
                                    x={d.x - d.w/2} y={d.y - d.h/2} width={d.w} height={d.h} 
                                    fill="transparent" 
                                    stroke={selectedDetection === d.id ? "#fff" : "#818cf8"}
                                    strokeWidth="4"
                                    className="transition-all"
                                />
                                <text x={d.x + d.w/2 + 10} y={d.y + 10} fill="#fff" fontSize="20" fontWeight="600" style={{ textShadow: '1px 1px 4px black' }}>
                                    {d.mcintosh}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
             )}

             <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row justify-between gap-2 pointer-events-none">
                <span className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded text-indigo-700 text-xs font-bold">
                   Mode: Manual Analysis
                </span>
                <span className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded text-slate-500 text-xs font-bold">
                   Double-Click to Mark
                </span>
             </div>
          </div>

          {/* Classification Panel */}
          <div className="w-full lg:w-[400px] space-y-6">
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6 uppercase tracking-wide">
                   Data Mapping
                </h3>
                
                {selectedData ? (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="aspect-square w-full sm:w-[200px] mx-auto bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group">
                         <img src={image} alt="Crop" 
                            className="absolute scale-[4]"
                            style={{ 
                                left: `${50 - (selectedData.x / viewBox.w) * 100}%`,
                                top: `${50 - (selectedData.y / viewBox.h) * 100}%`,
                                transform: `translate(-50%, -50%) scale(8)`
                            }} 
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                         <div className="bg-slate-50 p-3 text-center">
                            <span className="text-xs font-bold text-slate-500 block mb-1 uppercase">Stonyhurst Lat</span>
                            <span className="text-sm font-bold text-slate-900">{selectedData.lat.toFixed(2)}°</span>
                         </div>
                         <div className="bg-slate-50 p-3 text-center">
                            <span className="text-xs font-bold text-slate-500 block mb-1 uppercase">Stonyhurst Lon</span>
                            <span className="text-sm font-bold text-slate-900">{selectedData.lon.toFixed(2)}°</span>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">McIntosh Class</label>
                         <select 
                            value={selectedData.mcintosh}
                            onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedDetection ? {...d, mcintosh: e.target.value} : d))}
                            className="w-full bg-white border border-slate-200 shadow-sm rounded-md px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all"
                         >
                            <option value="Axx">Type Axx (Single)</option>
                            <option value="Dkc">Type Dkc (Complex)</option>
                            <option value="Bxo">Type Bxo (Binary)</option>
                         </select>
                         <div className="flex flex-wrap gap-2 py-2">
                             {["Dkc (92%)", "Dko (7%)", "Cki (1%)"].map((rec, i) => (
                                 <span key={rec} className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm", i === 0 ? "bg-indigo-600 text-white border border-indigo-700" : "bg-white border border-slate-200 text-slate-500")}>
                                     {rec}
                                 </span>
                             ))}
                         </div>
                      </div>

                      <button 
                        onClick={() => deleteBox(selectedDetection!)}
                        className="w-full py-3 text-sm font-bold text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all mt-4"
                      >
                         Discard Observation
                      </button>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <LayoutGrid className="h-10 w-10 text-slate-400 mb-4" />
                      <p className="text-sm text-slate-500 font-bold">
                         Select Coordinate <br/> or Double-Click Disk
                      </p>
                   </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <button className={cn(
                        "w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
                        detections.length > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    )}>
                    <Save className="h-4 w-4" />
                    Commit to DB
                    </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function ReportTab({ metadata, detections }: any) {
  return (
    <div className="p-4 lg:p-8 flex flex-col items-center h-full bg-slate-50 overflow-y-auto">
       <div className="max-w-4xl w-full bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-10 flex flex-col mb-10 text-slate-900">
          {/* Simple Report Header */}
          <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-center text-indigo-700 font-black text-xl shadow-sm">SOL</div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Record Log</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Heliographic Research Center - FIUNA</p>
                </div>
             </div>
             <div className="sm:text-right">
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Record Reference</p>
                <p className="text-lg font-mono font-bold text-slate-900">REF-{metadata.date.replace(/-/g, '')}-S3</p>
             </div>
          </div>

          {/* Context Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
             <div className="space-y-4">
                <h4 className="text-sm font-bold border-b border-slate-200 pb-2 text-slate-900 uppercase tracking-wide">Observer Credentials</h4>
                <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">{metadata.professional}</p>
                    <p className="text-sm font-semibold text-slate-500">{metadata.position}</p>
                </div>
             </div>
             <div className="space-y-4">
                <h4 className="text-sm font-bold border-b border-slate-200 pb-2 text-slate-900 uppercase tracking-wide">Spatiotemporal Context</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Stamping Date</p>
                        <p className="text-sm font-mono font-medium text-slate-900">{metadata.date}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Signal Time</p>
                        <p className="text-sm font-mono font-medium text-slate-900">{metadata.time}</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Table Data */}
          <div className="space-y-6">
             <h4 className="text-sm font-bold border-b border-slate-200 pb-2 flex justify-between text-slate-900 uppercase tracking-wide">
                Analyzed Sub-Regions
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{detections.length} Total Counts</span>
             </h4>
             
             {detections.length === 0 ? (
                <div className="py-12 border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
                    <AlertCircle className="h-8 w-8 mb-3 text-slate-400" />
                    <p className="text-sm font-bold text-slate-500">No Observation Data Found</p>
                </div>
             ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 border-b border-slate-200 bg-slate-50 uppercase tracking-wide">
                                <th className="p-4">UUID</th>
                                <th className="p-4 text-center">Lat (°)</th>
                                <th className="p-4 text-center">Lon (°)</th>
                                <th className="p-4">Type Class</th>
                                <th className="p-4 text-right">Magnetic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm bg-white">
                            {detections.map((d: any, i: number) => (
                                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono font-medium text-slate-500">0x{d.id.toString(16).slice(-4)}</td>
                                    <td className="p-4 text-center font-bold text-slate-900">{d.lat.toFixed(2)}</td>
                                    <td className="p-4 text-center font-bold text-slate-900">{d.lon.toFixed(2)}</td>
                                    <td className="p-4"><span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-700">{d.mcintosh}</span></td>
                                    <td className="p-4 text-right font-medium text-slate-700">{d.mag}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
          </div>

          {/* Authentication Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
             <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Secured Report Hash</p>
                <div className="h-px w-32 bg-slate-200" />
                <p className="text-xs font-semibold text-slate-600">Generated via Sunspot Intelligence Kernel v4.6</p>
             </div>
             <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-md hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                 Download Physical Copy
             </button>
          </div>
       </div>
    </div>
  );
}
