"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Download, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  Telescope, 
  Image as ImageIcon, 
  Tags, 
  Layers, 
  Zap, 
  Map as MapIcon, 
  Globe, 
  Menu, 
  X, 
  LogOut, 
  Info, 
  Calendar,
  AlertCircle,
  Save,
  User,
  Briefcase,
  MapPin,
  ClipboardList,
  Lock
} from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import SolarDiskViewer from "../components/SolarDiskViewer";
import { useAuth } from "../lib/AuthContext";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}


import Head from "next/head";

export default function RecordsPage() {
  const { isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedSolarData, setSelectedSolarData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewDate, setViewDate] = useState(new Date()); 
  const reportRef = useRef<HTMLDivElement>(null);

  const [fetchedYears, setFetchedYears] = useState<Record<number, string[]>>({});
  const [loadingDates, setLoadingDates] = useState(false);

  // Fetch initial data (stats)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dataset-stats');
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const jsonData = await res.json();
        setData(jsonData);
        
        // Initial dates from stats
        if (jsonData.availableDates?.length > 0) {
            const sorted = [...jsonData.availableDates].sort((a,b) => b.localeCompare(a));
            setSelectedDate(sorted[0]);
            setViewDate(new Date(sorted[0]));
            
            // Map the initial dates to their respective years
            const initialYears: Record<number, string[]> = {};
            jsonData.availableDates.forEach((d: string) => {
               const y = parseInt(d.split('-')[0]);
               if (!initialYears[y]) initialYears[y] = [];
               initialYears[y].push(d);
            });
            setFetchedYears(initialYears);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch dates when year changes
  useEffect(() => {
    const year = viewDate.getFullYear();
    if (fetchedYears[year] || loading) return;

    const fetchYearDates = async () => {
      setLoadingDates(true);
      try {
        const res = await fetch(`/api/available-dates?year=${year}`);
        if (!res.ok) throw new Error("Failed to fetch dates for year");
        const { availableDates } = await res.json();
        setFetchedYears(prev => ({ ...prev, [year]: availableDates }));
        
        // Auto-select the most recent date for this year and MOVE the view to that month
        if (availableDates.length > 0) {
            const mostRecent = availableDates[0]; // Already sorted desc
            setSelectedDate(mostRecent);
            setViewDate(new Date(mostRecent));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDates(false);
      }
    };
    fetchYearDates();
  }, [viewDate.getFullYear(), loading]);

  // Combine all available dates
  const allAvailableDates = useMemo(() => {
    return Array.from(new Set(Object.values(fetchedYears).flat())).sort((a, b) => b.localeCompare(a));
  }, [fetchedYears]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2010;
    const items = [];
    for (let y = currentYear; y >= startYear; y--) items.push(y);
    return items;
  }, []);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handleYearChange = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(month);
    setViewDate(newDate);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);

    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
            day: d,
            dateStr,
            hasRecord: allAvailableDates.includes(dateStr)
        });
    }
    return days;
  }, [viewDate, data]);

  const handleDownloadPDF = async () => {
    if (!selectedDate) return;
    setDownloading(true);
    try {
        const res = await fetch(`/api/solar-disk?date=${selectedDate}`);
        if (!res.ok) throw new Error("Could not fetch data for PDF");
        const solarData = await res.json();
        
        const imgUrl = `/api/proxy-image?url=${encodeURIComponent(solarData.fullDiskUrl)}`;
        const imgRes = await fetch(imgUrl);
        const imgBlob = await imgRes.blob();
        solarData.base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imgBlob);
        });

        if (solarData.crops && solarData.crops.length > 0) {
            await Promise.all(solarData.crops.map(async (crop: any) => {
                if (crop.cropUrl) {
                    const cUrl = `/api/proxy-image?url=${encodeURIComponent(crop.cropUrl)}`;
                    const cRes = await fetch(cUrl);
                    const cBlob = await cRes.blob();
                    crop.base64Image = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(cBlob);
                    });
                }
            }));
        }

        // Update state so the hidden template renders with this data
        setSelectedSolarData(solarData);
        
        // Use a temporary container for the report
        const reportContainer = document.getElementById("hidden-report-container");
        if (!reportContainer) throw new Error("Report container not found");
        
        // Wait for images to load if any
        await new Promise(r => setTimeout(r, 2500));

        const summaryElement = document.getElementById("record-report-summary");
        const tableElement = document.getElementById("record-report-table");
        
        if (!summaryElement || !tableElement) throw new Error("Report parts not found");

        const captureOptions = {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc: Document) => {
              const elements = clonedDoc.getElementsByTagName("*");
              for (let i = 0; i < elements.length; i++) {
                const el = elements[i] as HTMLElement;
                // Force plain colors to avoid oklch parsing errors in html2canvas
                if (el.classList.contains('bg-slate-900')) el.style.backgroundColor = '#0f172a';
                if (el.classList.contains('text-emerald-400')) el.style.color = '#10b981';
              }
            }
        };

        const canvasSummary = await html2canvas(summaryElement, captureOptions);
        const canvasTable = await html2canvas(tableElement, captureOptions);
        
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // PAGE 1: Summary
        const imgWidth1 = pdfWidth;
        const imgHeight1 = (canvasSummary.height * pdfWidth) / canvasSummary.width;
        pdf.addImage(canvasSummary.toDataURL("image/png"), "PNG", 0, 0, imgWidth1, imgHeight1);
        
        // PAGE 2+: Table
        pdf.addPage();
        const imgWidth2 = pdfWidth;
        const imgHeight2 = (canvasTable.height * pdfWidth) / canvasTable.width;
        
        if (imgHeight2 <= pdfHeight) {
            pdf.addImage(canvasTable.toDataURL("image/png"), "PNG", 0, 0, imgWidth2, imgHeight2);
        } else {
            let sourceY = 0;
            let isFirstTablePage = true;
            const pxPageHeight = Math.floor((pdfHeight * canvasTable.width) / pdfWidth);
            
            while (sourceY < canvasTable.height) {
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvasTable.width;
                const currentSliceHeight = Math.min(pxPageHeight, canvasTable.height - sourceY);
                pageCanvas.height = currentSliceHeight;
                const ctx = pageCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvasTable, 0, sourceY, canvasTable.width, currentSliceHeight, 0, 0, canvasTable.width, currentSliceHeight);
                    if (!isFirstTablePage) pdf.addPage();
                    pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, (currentSliceHeight * pdfWidth) / canvasTable.width);
                    isFirstTablePage = false;
                }
                sourceY += pxPageHeight;
                if (sourceY <= 0) break;
            }
        }

        pdf.save(`Informe_Solar_${selectedDate.replace(/-/g, "")}.pdf`);
    } catch (err: any) {
        console.error("Error generating PDF:", err);
        alert(`Error al generar el PDF: ${err.message}`);
    } finally {
        setDownloading(false);
    }
  };

  const isTrainingData = selectedDate ? parseInt(selectedDate.split("-")[0]) <= 2025 : false;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-xl shadow-sm animate-spin" />
        <span className="text-slate-500 font-bold tracking-widest animate-pulse uppercase">
          Cargando Registros…
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-20 lg:p-8 lg:pt-24 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Head>
        <title>Registros | Plataforma de Investigación Solar</title>
      </Head>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <ClipboardList className="h-7 w-7 text-slate-800 shrink-0" strokeWidth={1.5} />
            Registro de Fotósfera
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium hidden sm:block">
            Archivo centralizado de observaciones y <span className="text-slate-900 font-bold">auditoría de actividad solar</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-50">
               <div className="flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-slate-800" />
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selector Temporal</h3>
               </div>
               {loadingDates && (
                 <Loader2 className="h-3 w-3 text-emerald-500 animate-spin" />
               )}
            </div>
            
            <div className="space-y-3 mb-8">
                <select 
                    value={viewDate.getMonth()} 
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-800 transition-all appearance-none cursor-pointer"
                >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select 
                    value={viewDate.getFullYear()} 
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-800 transition-all appearance-none cursor-pointer"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-6">
                {['D','L','M','M','J','V','S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-black text-slate-300 text-center py-2 uppercase">{d}</div>
                ))}
                {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
                    const isSelected = selectedDate === d.dateStr;
                    const hasRecord = d.hasRecord;
                    return (
                        <button 
                            key={i} 
                            disabled={!hasRecord}
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center text-xs transition-all relative font-bold h-8 w-8 mx-auto rounded-lg",
                                hasRecord 
                                    ? isSelected
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105"
                                        : "text-slate-700 hover:bg-slate-100 border border-slate-100"
                                    : "text-slate-200 pointer-events-none"
                            )}
                        >
                            <span className="relative z-10">{d.day}</span>
                            {hasRecord && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
          </div>
        </div>

        {/* Viewer Column */}
        <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 flex flex-col relative h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <SolarDiskViewer 
                    availableDates={allAvailableDates} 
                    date={selectedDate}
                />
                
                {/* Download Button */}
                <div className="mt-6 flex justify-start sm:absolute sm:top-8 sm:right-8 sm:mt-0">
                     <button 
                        onClick={handleDownloadPDF}
                        disabled={downloading || isGuest}
                        className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                     >
                        {downloading ? (
                            <div className="h-4 w-4 border-2 border-slate-500 border-t-white rounded-sm animate-spin" />
                        ) : isGuest ? (
                            <Lock className="h-4 w-4" />
                        ) : (
                            <FileText className="h-4 w-4" />
                        )}
                        {downloading ? "Generando..." : isGuest ? "Exportar Bloqueado" : "Exportar Registro"}
                     </button>
                </div>
            </div>
        </div>
      </div>

    <div id="hidden-report-container" className="fixed left-[-9999px] top-0 w-[1024px] z-[-50] bg-white">
        {selectedSolarData && selectedDate && (
            <div className="flex flex-col gap-10 bg-white p-10">
                <div id="record-report-summary" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-10 flex flex-col text-[#0f172a] w-[800px] mx-auto shrink-0">
                    <div className="flex justify-between border-b-2 border-[#0f172a] pb-8 mb-10 gap-4 items-end">
                        <div className="flex items-center gap-4">
                            <BrandLogo size={60} className="shrink-0" />
                            <div className="pl-4" style={{ borderLeft: '2px solid #f1f5f9' }}>
                                <h2 className="text-2xl font-black text-[#0f172a] tracking-tighter uppercase">Informe de Registro</h2>
                                <p className="text-[10px] font-black text-[#94a3b8] mt-0.5 uppercase tracking-[0.3em]">Plataforma de Investigación Solar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Código de Archivo</p>
                            <p className="text-lg font-mono font-bold text-[#0f172a] tracking-tight">REF-{selectedDate.replace(/-/g, "")}-ARCH</p>
                        </div>
                    </div>

                    <div className="mb-10 space-y-4">
                        <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Resumen Visual del Disco</h4>
                        <div className="aspect-square max-w-sm mx-auto bg-black rounded-full overflow-hidden border-4 border-[#f1f5f9] relative">
                            <img src={selectedSolarData.base64Image} alt="Full Disk" className="w-full h-full object-cover" />
                            <svg viewBox="0 0 1024 1024" className="absolute inset-0 w-full h-full opacity-40">
                                {selectedSolarData.crops?.map((d: any, idx: number) => {
                                    const x = d.x_center_px || 0;
                                    const y = d.y_center_px || 0;
                                    const w = d.orig_w_px || 50;
                                    const h = d.orig_h_px || 50;
                                    return (
                                        <rect 
                                            key={idx} 
                                            x={x - w/2} 
                                            y={y - h/2} 
                                            width={w} 
                                            height={h} 
                                            fill="none" 
                                            stroke="#22c55e" 
                                            strokeWidth="4" 
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Procedencia del Registro</h4>
                            <p className="text-base font-bold text-[#0f172a]">{isTrainingData ? "Sistemas NOAA / SDO / NASA" : "Investigador Principal"}</p>
                            <p className="text-sm font-medium text-[#64748b]">{isTrainingData ? "Red Global de Observatorios" : "Investigador Verificado"}</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Contexto Temporal</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Fecha</p>
                                    <p className="text-sm font-mono font-medium text-[#0f172a]">{selectedDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Periodo</p>
                                    <p className="text-sm font-mono font-medium text-[#0f172a]">{isTrainingData ? "Entrenamiento" : "Validación"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="record-report-table" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-10 flex flex-col text-[#0f172a] w-[800px] mx-auto shrink-0">
                    {/* Technical Notes moved here */}
                    <div className="mb-8 p-6 bg-[#0f172a] text-white rounded-xl shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="h-16 w-16" />
                        </div>
                        <h4 className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] flex items-center gap-2 mb-3 relative z-10">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                            Nota de Arquitectura
                        </h4>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed font-medium relative z-10">
                            {isTrainingData 
                                ? "Este registro corresponde a datos históricos de la NOAA y el SDO. Estos fueron empleados como base de entrenamiento para los modelos YOLOv26 nano y ConvNextV2 atto jerárquico utilizados en este sistema."
                                : "Este registro ha sido generado mediante el proceso de análisis estándar del observatorio, utilizando la arquitectura YOLOv26n + ConvNextV2atto."
                            }
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 flex justify-between items-center text-[#64748b] uppercase tracking-widest">
                            Detalle de Manchas Registradas
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-[10px] font-black text-[#94a3b8] border-b border-[#e2e8f0] bg-[#f8fafc] uppercase tracking-widest">
                                        <th className="p-4">Crop (224px)</th>
                                        <th className="p-4">Ref ID</th>
                                        <th className="p-4">Latitud (°)</th>
                                        <th className="p-4">Longitud (°)</th>
                                        <th className="p-4">McIntosh</th>
                                        <th className="p-4 text-right">Magnético</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9] text-sm bg-white">
                                    {selectedSolarData.crops?.map((crop: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-4">
                                               <div className="w-16 h-16 bg-black rounded border border-[#e2e8f0] overflow-hidden">
                                                 {crop.base64Image ? (
                                                     <img src={crop.base64Image} className="w-full h-full object-contain" />
                                                 ) : (
                                                     <div className="w-full h-full flex items-center justify-center text-white text-[10px]">No image</div>
                                                 )}
                                               </div>
                                            </td>
                                            <td className="p-4 font-mono text-[10px]">SPT-{idx + 1}</td>
                                            <td className="p-4 font-bold">{crop.lat.toFixed(2)}</td>
                                            <td className="p-4 font-bold">{crop.lon.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className="bg-[#0f172a] text-white px-2.5 py-1 rounded-md text-xs font-black shadow-sm">{crop.mcintosh_full || "N/A"}</span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-[#334155]">{crop.mag_class || "None"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-12 pt-6 border-t border-[#f1f5f9] flex justify-center">
                        {/* Redundant institutional text removed */}
                    </div>
                </div>
            </div>
        )}
    </div>
    </div>
  );
}

// Search and other icons used in redesign
function Search(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
