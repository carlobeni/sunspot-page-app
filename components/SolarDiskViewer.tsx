"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Loader2 } from "lucide-react";
import Image from "next/image";

interface Crop {
  id: string;
  lat: number;
  lon: number;
  orig_w_px: number;
  orig_h_px: number;
  mcintosh_full: string;
  mag_class: string;
  cropUrl: string;
  x_center_px: number;
  y_center_px: number;
}

interface SolarData {
  date: string;
  fullDiskUrl: string;
  fullDiskMetadata: {
    width: number;
    height: number;
  };
  crops: Crop[];
}

export default function SolarDiskViewer({ 
  availableDates = [], 
  date: externalDate,
  onDateChange
}: { 
  availableDates?: string[], 
  date?: string,
  onDateChange?: (date: string) => void
}) {
  const [date, setDate] = useState(externalDate || availableDates[0] || "");
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // hover states
  const [hoveredCrop, setHoveredCrop] = useState<Crop | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setHoverPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (externalDate) {
      setDate(externalDate);
      setImgLoaded(false); 
      fetchSolarDisk(externalDate);
    }
  }, [externalDate]);

  const fetchSolarDisk = async (queryDate: string = "") => {
    setLoading(true);
    setError("");
    setHoveredCrop(null);
    try {
      const res = await fetch(`/api/solar-disk${queryDate ? `?date=${queryDate}` : ""}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch solar disk");
      }
      const data = await res.json();
      setSolarData(data);
      if (data.date && !externalDate) setDate(data.date);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!externalDate) {
      if (availableDates && availableDates.length > 0) {
        fetchSolarDisk(availableDates[0]);
      } else {
        fetchSolarDisk();
      }
    }
  }, [availableDates]);

  return (
    <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl flex flex-col w-full h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-serif font-black text-white uppercase tracking-widest leading-none">
            Visor Heliográfico Histórico
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase mt-3 tracking-widest">
            {date ? `Registro: ${date}` : "Cargando observación..."}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/40 text-red-400 px-6 py-4 rounded-xl mb-8 text-[10px] uppercase font-black tracking-widest">
          {error}
        </div>
      )}

      {solarData && (
        <div className="flex flex-col gap-16">
          <div 
            className="flex justify-center bg-black rounded-2xl overflow-hidden p-6 relative min-h-[600px] lg:h-[800px] border border-slate-800 shadow-inner"
            onMouseMove={handleMouseMove}
          >
             {(!imgLoaded || loading) && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95">
                 <Loader2 className="h-12 w-12 text-slate-700 animate-spin mb-4" />
                 <div className="bg-slate-900 px-4 py-2 border border-slate-800 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">
                      {loading ? "Sincronizando..." : "Renderizando..."}
                    </p>
                 </div>
               </div>
             )}
            <div className="relative w-full max-w-[550px] aspect-square rounded-2xl border border-slate-700 overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.02)]" 
                 style={{ aspectRatio: '1/1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={solarData.fullDiskUrl}
                alt="Solar Full Disk"
                className="absolute inset-0 w-full h-full object-contain grayscale brightness-110"
                crossOrigin="anonymous"
                onLoad={() => setImgLoaded(true)}
              />

              {imgLoaded && (
                <svg
                    viewBox={`0 0 ${solarData.fullDiskMetadata.width || 1024} ${solarData.fullDiskMetadata.height || 1024}`}
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    style={{ zIndex: 5 }}
                >
                    <g opacity="0.5" pointerEvents="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="5 5">
                        {[-60, -30, 0, 30, 60].map(phi => {
                            const R = (solarData.fullDiskMetadata.width || 1024) / 2;
                            const x0 = R;
                            const y0 = R;
                            const r_p = R * Math.cos(phi * Math.PI / 180);
                            const y_p = y0 - R * Math.sin(phi * Math.PI / 180);
                            return (
                                <g key={`lat-${phi}`}>
                                    <ellipse cx={x0} cy={y_p} rx={r_p} ry={r_p * 0.1} fill="none" />
                                    <text x={x0 + r_p + 10} y={y_p + 5} fill="white" fontSize="20" fontWeight="900" stroke="none">{phi}°</text>
                                </g>
                            );
                        })}
                        {[-60, -30, 0, 30, 60].map(lam => {
                            const R = (solarData.fullDiskMetadata.width || 1024) / 2;
                            const x0 = R;
                            const y0 = R;
                            const rx = R * Math.sin(lam * Math.PI / 180);
                            return (
                                <g key={`lon-${lam}`}>
                                    <ellipse cx={x0} cy={y0} rx={rx} ry={R} fill="none" />
                                    <text x={x0 + rx} y={y0 + R + 30} fill="white" fontSize="20" fontWeight="900" textAnchor="middle" stroke="none">{lam}°</text>
                                </g>
                            );
                        })}
                    </g>

                    {solarData.crops.map((crop) => {
                    const x = crop.x_center_px;
                    const y = crop.y_center_px;
                    const w = crop.orig_w_px || 50;
                    const h = crop.orig_h_px || 50;
                    const isHovered = hoveredCrop?.id === crop.id;

                    return (
                        <g
                        key={crop.id}
                        transform={`translate(${x}, ${y})`}
                        onMouseEnter={() => setHoveredCrop(crop)}
                        onMouseLeave={() => setHoveredCrop(null)}
                        className="cursor-crosshair group hover:z-50 relative"
                        style={{ pointerEvents: 'auto' }}
                        >
                        <rect
                            x={-w / 2}
                            y={-h / 2}
                            width={w}
                            height={h}
                            stroke={isHovered ? "#fff" : "#475569"} 
                            fill={isHovered ? "rgba(255, 255, 255, 0.1)" : "transparent"}
                            strokeWidth={isHovered ? 6 : 3}
                            className="transition-all duration-300"
                        />
                        <circle r="4" fill="white" />
                        <text
                            x={w / 2 + 15}
                            y={10}
                            fill="white"
                            fontSize="32"
                            fontWeight="900"
                            className={`transition-opacity ${isHovered ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"}`}
                            style={{ textShadow: '2px 2px 10px black' }}
                        >
                            {crop.mcintosh_full || "Spot"}
                        </text>
                        </g>
                    );
                    })}
                </svg>
              )}
            </div>
            
            {/* Tooltip Popup */}
            {hoveredCrop && hoveredCrop.cropUrl && (
                <div 
                  className="fixed pointer-events-none z-50 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-100"
                  style={{ top: hoverPos.y + 20, left: hoverPos.x + 20, width: 220 }}
                >
                  <img src={hoveredCrop.cropUrl} alt="Crop" className="w-full aspect-square object-cover grayscale contrast-150 rounded-xl border border-slate-800 bg-black" crossOrigin="anonymous"/>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-black text-white tracking-widest block mb-1">Sector Lat: {hoveredCrop.lat.toFixed(1)}°</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter block">{hoveredCrop.mcintosh_full || "Spot"}</span>
                  </div>
                </div>
            )}
          </div>

          {/* Bottom Styled Table */}
          <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
             <div className="bg-slate-900 border-b border-slate-800 p-8 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Detalle Cartográfico Espacial</h3>
                <span className="text-[9px] font-black text-white bg-slate-800 px-4 py-2 rounded-lg">{solarData.crops.length} Registros Activos</span>
             </div>
             {solarData.crops.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-900/50 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                       <th className="p-6 border-b border-slate-800 pl-8">Ref ID</th>
                       <th className="p-6 border-b border-slate-800">Latitud</th>
                       <th className="p-6 border-b border-slate-800">Longitud</th>
                       <th className="p-6 border-b border-slate-800">MacIntosh</th>
                       <th className="p-6 border-b border-slate-800">Mag. Class</th>
                     </tr>
                   </thead>
                   <tbody className="text-[10px] font-medium text-slate-300">
                     {solarData.crops.map((c, i) => (
                        <tr 
                          key={c.id} 
                          className="hover:bg-slate-800/40 transition-colors border-b border-slate-800/50 last:border-0 group cursor-crosshair"
                          onMouseEnter={() => setHoveredCrop(c)} 
                          onMouseLeave={() => setHoveredCrop(null)}
                          onMouseMove={handleMouseMove}
                        >
                           <td className="p-6 pl-8 font-mono font-black text-white group-hover:text-[#0ea5e9] transition-colors">#{String(i + 1).padStart(2,'0')}</td>
                           <td className="p-6">{c.lat.toFixed(2)}°</td>
                           <td className="p-6">{c.lon.toFixed(2)}°</td>
                           <td className="p-6 text-amber-400 font-bold">{c.mcintosh_full || "-"}</td>
                           <td className="p-6 text-sky-400 font-bold">{c.mag_class || "-"}</td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
                <div className="p-16 text-center text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                   No existen manchas detectadas en este registro espacial.
                </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
}
