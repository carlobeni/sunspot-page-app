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
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col w-full h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-800" />
            Visor Heliográfico Histórico
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium hidden md:block">
            {date ? `Registro: ${date}` : "Cargando observación..."}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {solarData && (
        <div className="flex flex-col gap-8">
          <div 
            className="flex justify-center items-center bg-slate-50 rounded-xl overflow-hidden p-4 relative min-h-[400px] lg:h-[600px] border border-slate-200 shadow-inner"
            onMouseMove={handleMouseMove}
          >
              {(!imgLoaded || loading) && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                 <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-xl shadow-sm animate-spin mb-4" />
                 <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
                    <p className="text-xs text-slate-800 font-bold animate-pulse uppercase tracking-widest">
                      {loading ? "Sincronizando..." : "Renderizando..."}
                    </p>
                 </div>
               </div>
             )}
            <div className="relative w-full max-w-[min(100%,500px)] aspect-square rounded-full border border-slate-300 overflow-hidden bg-black shadow-lg" 
                 style={{ aspectRatio: '1/1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={solarData.fullDiskUrl}
                alt="Solar Full Disk"
                className="absolute inset-0 w-full h-full object-contain"
                crossOrigin="anonymous"
                onLoad={() => setImgLoaded(true)}
              />

              {imgLoaded && (
                <svg
                    viewBox={`0 0 ${solarData.fullDiskMetadata.width || 1024} ${solarData.fullDiskMetadata.height || 1024}`}
                    className="absolute inset-0 w-full h-full pointer-events-auto"
                    style={{ zIndex: 5 }}
                >
                    <g opacity="0.4" pointerEvents="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="6 4">
                        {[-60, -30, 0, 30, 60].map(phi => {
                            const R = (solarData.fullDiskMetadata.width || 1024) / 2;
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
                            const R = (solarData.fullDiskMetadata.width || 1024) / 2;
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
                            stroke={isHovered ? "#fff" : "#cbd5e1"} 
                            fill={isHovered ? "rgba(255, 255, 255, 0.2)" : "transparent"}
                            strokeWidth={isHovered ? 6 : 4}
                            className="transition-all duration-300"
                        />
                        <circle r="6" fill="#fff" className={isHovered ? "animate-pulse" : ""} />
                        <text
                            x={w / 2 + 10}
                            y={10}
                            fill="#fff"
                            fontSize="24"
                            fontWeight="800"
                            className={`transition-opacity ${isHovered ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100"}`}
                            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}
                        >
                            {crop.mcintosh_full || "Spot"}
                        </text>
                        </g>
                    );
                    })}
                </svg>
              )}
            </div>
            
             {hoveredCrop && hoveredCrop.cropUrl && (
                <div 
                  className="fixed pointer-events-none z-50 bg-white border border-slate-200 rounded-lg p-3 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150"
                  style={{ top: hoverPos.y + 20, left: hoverPos.x + 20, width: 220 }}
                >
                  <div className="relative aspect-square w-full rounded-md overflow-hidden bg-black border border-slate-100 shadow-sm">
                    <img src={hoveredCrop.cropUrl} alt="Crop" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-900 block mb-1" style={{ fontSize: '10px' }}>LAT: {hoveredCrop.lat.toFixed(1)}°</span>
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">{hoveredCrop.mcintosh_full || "Spot"}</span>
                  </div>
                </div>
            )}
          </div>

          {/* Bottom Styled Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-slate-50 p-4 sm:p-6 flex justify-between items-center border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Detalle Cartográfico Espacial</h3>
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md">{solarData.crops.length} Registros Activos</span>
             </div>
             {solarData.crops.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider">
                       <th className="p-4 border-b border-slate-100 pl-6">Ref ID</th>
                       <th className="p-4 border-b border-slate-100">Latitud</th>
                       <th className="p-4 border-b border-slate-100">Longitud</th>
                       <th className="p-4 border-b border-slate-100">MacIntosh</th>
                       <th className="p-4 border-b border-slate-100">Mag. Class</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm text-slate-600">
                     {solarData.crops.map((c, i) => (
                        <tr 
                          key={c.id} 
                          className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                          onMouseEnter={() => setHoveredCrop(c)} 
                          onMouseLeave={() => setHoveredCrop(null)}
                          onMouseMove={handleMouseMove}
                        >
                           <td className="p-4 pl-6 font-mono text-slate-400 font-medium">#{String(i + 1).padStart(2,'0')}</td>
                           <td className="p-4 font-medium text-slate-900">{c.lat.toFixed(2)}°</td>
                           <td className="p-4 font-medium text-slate-900">{c.lon.toFixed(2)}°</td>
                           <td className="p-4 text-slate-600 font-semibold">{c.mcintosh_full || "-"}</td>
                           <td className="p-4 text-slate-600 font-semibold">{c.mag_class || "-"}</td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
                <div className="p-8 text-center text-sm font-medium text-slate-400">
                   No existen manchas detectadas en este registro espacial.
                </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
}
