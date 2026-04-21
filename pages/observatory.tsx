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
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-[#020617] text-slate-200">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-white tracking-widest uppercase flex items-center gap-6">
            <Telescope className="h-12 w-12 text-slate-500" />
            Observatorio
          </h1>
          <p className="text-slate-500 mt-4 text-xl font-light italic border-l-2 border-slate-800 pl-6">
            Captura y análisis de registros solares en tiempo real.
          </p>
        </div>
        {image && (
            <div className="flex gap-4">
                <button 
                  onClick={simulateDetection}
                  className="px-8 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Activity className="h-4 w-4"/>}
                    RE-EJECUTAR MODELO
                </button>
            </div>
        )}
      </div>

      {/* Tabs Navigation - Noir Style */}
      <div className="flex items-center bg-slate-900 border border-slate-800 p-1 mb-10 self-start rounded-2xl">
        {[
          { id: "imagen", label: "Imagen", icon: ImageIcon },
          { id: "etiquetado", label: "Etiquetado", icon: Tags },
          { id: "informe", label: "Informe", icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-3 px-10 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-slate-800 text-white shadow-inner" 
                : "text-slate-500 hover:text-white hover:bg-slate-800/40"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 bg-black rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
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
    <div className="p-10 lg:p-16 flex flex-col h-full bg-[#050505]">
      <div className="flex flex-col lg:flex-row gap-16 h-full">
        {/* Left Side: Controls */}
        <div className="lg:w-1/3 space-y-12">
          <section>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <span className="w-8 h-8 rounded-xl border border-white/20 text-white flex items-center justify-center">01</span>
              Origen
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setMode("upload")}
                className={cn(
                  "flex items-center gap-4 p-6 rounded-xl border transition-all text-left group",
                  mode === "upload" ? "border-white bg-slate-900" : "border-slate-800 hover:border-slate-600 bg-black/40"
                )}
              >
                <div className={cn("p-4 rounded-xl border", mode === "upload" ? "bg-white text-black border-white" : "bg-slate-900 text-slate-500 border-slate-800 group-hover:border-slate-500")}>
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-black text-white text-xs uppercase tracking-widest mb-1">Cargar Archivo</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">HMI / White-Light</span>
                </div>
              </button>
              
              <button 
                onClick={() => setMode("capture")}
                className={cn(
                  "flex items-center gap-4 p-6 rounded-xl border transition-all text-left group",
                  mode === "capture" ? "border-white bg-slate-900" : "border-slate-800 hover:border-slate-600 bg-black/40"
                )}
              >
                <div className={cn("p-4 rounded-xl border", mode === "capture" ? "bg-white text-black border-white" : "bg-slate-900 text-slate-500 border-slate-800 group-hover:border-slate-500")}>
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-black text-white text-xs uppercase tracking-widest mb-1">Captura ZWO</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Live Pi5-A1</span>
                </div>
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
               <span className="w-8 h-8 rounded-xl border border-slate-800 text-slate-500 flex items-center justify-center">02</span>
               Metadatos
            </h3>
            <div className="space-y-6 bg-slate-900/40 p-8 rounded-xl border border-slate-800">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Observador</label>
                 <div className="flex items-center gap-3 bg-black border border-slate-800 rounded-xl px-4 py-3">
                   <User className="h-4 w-4 text-slate-600" />
                   <input 
                    type="text" 
                    value={metadata.professional} 
                    onChange={(e) => setMetadata({...metadata, professional: e.target.value})}
                    className="flex-1 text-xs bg-transparent focus:outline-none text-slate-300 font-medium" 
                  />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Rango</label>
                 <div className="flex items-center gap-3 bg-black border border-slate-800 rounded-xl px-4 py-3">
                   <Briefcase className="h-4 w-4 text-slate-600" />
                   <input 
                    type="text" 
                    value={metadata.position} 
                    onChange={(e) => setMetadata({...metadata, position: e.target.value})}
                    className="flex-1 text-xs bg-transparent focus:outline-none text-slate-300 font-medium" 
                  />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                   <div className="bg-black border border-slate-800 rounded-xl px-4 py-3">
                     <input type="date" value={metadata.date} readOnly className="w-full text-[10px] bg-transparent focus:outline-none text-slate-500 font-mono" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Time</label>
                   <div className="bg-black border border-slate-800 rounded-xl px-4 py-3">
                     <input type="text" value={metadata.time} readOnly className="w-full text-[10px] bg-transparent focus:outline-none text-slate-500 font-mono" />
                   </div>
                 </div>
               </div>
            </div>
          </section>
        </div>

        {/* Right Side: Viewport Noir */}
        <div className="flex-1 bg-black rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[600px] shadow-inner">
          {image ? (
            <div className="relative w-full h-full p-12 flex items-center justify-center">
                 <div className="relative w-full max-w-[550px] aspect-square rounded-full overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.03)] bg-slate-900/20 p-2">
                    <img src={image} alt="Preview" className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
                    <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none" />
                 </div>
                 <button 
                  onClick={() => setImage(null)}
                  className="absolute top-10 right-10 p-4 bg-white text-black rounded-xl shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
                 >
                    <X className="h-6 w-6" />
                 </button>
            </div>
          ) : mode === null ? (
            <div className="text-center space-y-6 opacity-30">
              <Telescope className="h-20 w-20 text-white mx-auto stroke-[1]" />
              <p className="text-white text-[10px] font-black uppercase tracking-[0.5em]">Esperando Señal...</p>
            </div>
          ) : mode === "upload" ? (
            <div className="flex flex-col items-center gap-10">
               <label className="w-40 h-40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center hover:border-white transition-all cursor-pointer group bg-slate-900/20">
                  <Upload className="h-10 w-10 text-slate-600 group-hover:text-white transition-colors" />
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        setImage(url);
                    }
                  }} />
               </label>
               <div className="text-center space-y-4">
                  <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Cargar registro histórico</p>
                  <div className="flex gap-4 justify-center">
                    <span className="px-3 py-1 border border-slate-800 text-[9px] text-slate-600 font-mono uppercase tracking-tighter">MAX: 4K</span>
                    <span className="px-3 py-1 border border-slate-800 text-[9px] text-slate-600 font-mono uppercase tracking-tighter">Format: RAW/JPG</span>
                  </div>
               </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
               <div className="flex-1 border-b border-slate-800 flex items-center justify-center relative bg-black">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <div className="w-[70%] h-[70%] border border-white rounded-xl border-dashed" />
                      <div className="absolute w-[90%] h-[90%] border border-white rounded-full border-dashed" />
                  </div>
                  <Loader2 className="h-12 w-12 text-white animate-spin opacity-40" />
                  
                  {/* Camera Controls Overlay Noir */}
                  <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl p-8 rounded-xl border border-white/5">
                     <div className="flex gap-10">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Gain</label>
                          <input type="range" className="w-32 accent-white bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exp (ms)</label>
                          <input type="number" defaultValue={20} className="w-20 bg-black border border-slate-800 rounded-xl text-xs text-white p-2 focus:border-white outline-none" />
                        </div>
                     </div>
                     <button 
                        onClick={simulateDetection}
                        className="bg-white hover:bg-slate-200 text-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-2xl"
                     >
                        <Camera className="h-4 w-4 inline-block mr-3" />
                        Capture
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
    <div className="p-10 lg:p-16 h-full flex flex-col bg-black">
       <div className="flex flex-col lg:flex-row gap-12 flex-1">
          {/* Main Canvas Area Mono */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center cursor-crosshair group"
               ref={containerRef}
               onDoubleClick={handleAddBox}
          >
             {!image ? (
                <div className="text-center space-y-6 opacity-20">
                    <AlertCircle className="h-16 w-16 text-white mx-auto stroke-[1]" />
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Sin Datos de Imagen</p>
                </div>
             ) : (
                <div className="relative w-full h-full max-w-[600px] aspect-square rounded-full overflow-hidden border border-slate-800 bg-[#0a0a0a]">
                    <img src={image} alt="Solar Disk" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-110" />
                    <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="absolute inset-0 w-full h-full">
                        {detections.map((d: any) => (
                            <g key={d.id} 
                               onClick={(e) => { e.stopPropagation(); setSelectedDetection(d.id); }}
                               className="cursor-pointer group"
                            >
                                <rect 
                                    x={d.x - d.w/2} y={d.y - d.h/2} width={d.w} height={d.h} 
                                    fill="transparent" 
                                    stroke={selectedDetection === d.id ? "#fff" : "#475569"}
                                    strokeWidth="4"
                                    className="transition-all"
                                />
                                <text x={d.x + d.w/2 + 10} y={d.y + 10} fill="#fff" fontSize="30" fontWeight="900" style={{ textShadow: '2px 2px 0px black' }}>
                                    {d.mcintosh}
                                </text>
                            </g>
                        ))}
                    </svg>
                    <div className="absolute inset-0 pointer-events-none border-[30px] border-black/60" />
                </div>
             )}

             <div className="absolute top-8 left-8 right-8 flex justify-between pointer-events-none">
                <span className="px-5 py-2 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em]">
                   Mode: Manual Analysis
                </span>
                <span className="px-5 py-2 bg-slate-900 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border border-slate-800">
                   Double-Click to Mark
                </span>
             </div>
          </div>

          {/* Classification Panel Noir */}
          <div className="w-full lg:w-[450px] space-y-10">
             <div className="bg-slate-900 p-10 rounded-xl border border-slate-800 shadow-2xl flex flex-col h-full">
                <h3 className="text-[10px] font-black text-white border-b border-slate-800 pb-8 uppercase tracking-[0.6em] mb-10">
                   Data Mapping
                </h3>
                
                {selectedData ? (
                   <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="aspect-square w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                         <img src={image} alt="Crop" 
                            className="absolute scale-[4] grayscale contrast-150"
                            style={{ 
                                left: `${50 - (selectedData.x / viewBox.w) * 100}%`,
                                top: `${50 - (selectedData.y / viewBox.h) * 100}%`,
                                transform: `translate(-50%, -50%) scale(12)`
                            }} 
                         />
                         <div className="absolute inset-0 border-[2px] border-white/20 pointer-events-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800">
                         <div className="bg-black p-5">
                            <span className="text-[8px] font-black text-slate-600 block uppercase tracking-widest mb-1">Stonyhurst Lat</span>
                            <span className="text-sm font-mono font-black text-white">{selectedData.lat.toFixed(2)}°</span>
                         </div>
                         <div className="bg-black p-5">
                            <span className="text-[8px] font-black text-slate-600 block uppercase tracking-widest mb-1">Stonyhurst Lon</span>
                            <span className="text-sm font-mono font-black text-white">{selectedData.lon.toFixed(2)}°</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">McIntosh Class</label>
                         <select 
                            value={selectedData.mcintosh}
                            onChange={(e) => setDetections(detections.map((d: any) => d.id === selectedDetection ? {...d, mcintosh: e.target.value} : d))}
                            className="w-full bg-black border border-slate-800 rounded-xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none focus:border-white transition-all"
                         >
                            <option value="Axx">Type Axx (Single)</option>
                            <option value="Dkc">Type Dkc (Complex)</option>
                            <option value="Bxo">Type Bxo (Binary)</option>
                         </select>
                         <div className="flex flex-wrap gap-2 py-2">
                             {["Dkc (92%)", "Dko (7%)", "Cki (1%)"].map((rec, i) => (
                                 <span key={rec} className={cn("px-4 py-2 border text-[8px] font-black uppercase tracking-tighter transition-all", i === 0 ? "bg-white text-black border-white" : "text-slate-500 border-slate-800")}>
                                     {rec}
                                 </span>
                             ))}
                         </div>
                      </div>

                      <button 
                        onClick={() => deleteBox(selectedDetection!)}
                        className="w-full py-4 text-[9px] text-slate-600 font-black uppercase tracking-[0.5em] hover:text-white transition-all border-b border-transparent hover:border-slate-800"
                      >
                         Discard Observation
                      </button>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-xl bg-black/40 opacity-20">
                      <LayoutGrid className="h-12 w-12 text-white mb-6 stroke-[1]" />
                      <p className="text-[10px] text-white font-black uppercase tracking-[0.4em] leading-relaxed">
                         Select Coordinate <br/> or Double-Click Disk
                      </p>
                   </div>
                )}

                <div className="mt-auto pt-10">
                    <button className={cn(
                        "w-full py-6 rounded-xl text-[10px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-4 transition-all shadow-2xl",
                        detections.length > 0 ? "bg-white text-black hover:bg-slate-200" : "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                    )}>
                    <Save className="h-5 w-5" />
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
    <div className="p-16 flex flex-col items-center h-full bg-[#0a0a0a] overflow-y-auto">
       <div className="max-w-4xl w-full bg-white shadow-none rounded-xl border border-slate-200 p-20 flex flex-col mb-16 text-black">
          {/* High Fidelity Report Header */}
          <div className="flex justify-between border-b-8 border-black pb-10 mb-16">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-black flex items-center justify-center text-white font-serif font-black text-2xl">SOL</div>
                <div>
                    <h2 className="text-3xl font-serif font-black uppercase tracking-tighter leading-none">Record Log</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-[0.3em]">Heliographic Research Center // FIUNA</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Record Reference</p>
                <p className="text-xl font-mono font-black">REF-{metadata.date.replace(/-/g, '')}-S3</p>
             </div>
          </div>

          {/* Context Section */}
          <div className="grid grid-cols-2 gap-20 mb-20">
             <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase border-b border-slate-200 pb-3 tracking-widest">Observer Credentials</h4>
                <div className="space-y-2">
                    <p className="text-lg font-black text-black uppercase tracking-tight">{metadata.professional}</p>
                    <p className="text-[11px] text-slate-500 italic font-serif">{metadata.position}</p>
                </div>
             </div>
             <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase border-b border-slate-200 pb-3 tracking-widest">Spatiotemporal Context</h4>
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Stamping Date</p>
                        <p className="text-sm font-mono font-black">{metadata.date}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Signal Time</p>
                        <p className="text-sm font-mono font-black">{metadata.time}</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Table Data */}
          <div className="space-y-10">
             <h4 className="text-[11px] font-black uppercase border-b-2 border-black pb-3 flex justify-between tracking-[0.2em]">
                Analyzed Sub-Regions
                <span>{detections.length} Total Counts</span>
             </h4>
             
             {detections.length === 0 ? (
                <div className="py-24 border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-20 bg-slate-50">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Observation Data Found</p>
                </div>
             ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase border-b-2 border-slate-100">
                            <th className="py-5 tracking-widest">UUID</th>
                            <th className="py-5 text-center tracking-widest">Lat (°)</th>
                            <th className="py-5 text-center tracking-widest">Lon (°)</th>
                            <th className="py-5 tracking-widest">Type Class</th>
                            <th className="py-5 text-right tracking-widest">Magnetic</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {detections.map((d: any, i: number) => (
                            <tr key={d.id} className="text-xs font-medium">
                                <td className="py-6 font-mono text-slate-400">0x{d.id.toString(16).slice(-4)}</td>
                                <td className="py-6 text-center font-black">{d.lat.toFixed(2)}</td>
                                <td className="py-6 text-center font-black">{d.lon.toFixed(2)}</td>
                                <td className="py-6"><span className="bg-black text-white px-4 py-1 font-black text-[9px] uppercase tracking-widest">{d.mcintosh}</span></td>
                                <td className="py-6 text-right font-bold text-slate-500 uppercase">{d.mag}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             )}
          </div>

          {/* Authentication Footer */}
          <div className="mt-auto pt-24 border-t border-slate-100 flex justify-between items-end">
             <div className="space-y-3">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Secured Report Hash</p>
                <div className="h-px w-40 bg-slate-200" />
                <p className="text-[10px] font-serif italic text-slate-300">Generated via Sunspot Intelligence Kernel v4.6</p>
             </div>
             <button className="px-12 py-5 bg-black text-white font-black text-[10px] uppercase tracking-[0.5em] shadow-2xl hover:bg-slate-900 transition-all">
                 Download Physical Copy
             </button>
          </div>
       </div>
    </div>
  );
}
