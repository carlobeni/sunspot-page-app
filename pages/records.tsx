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
  MapPin
} from "lucide-react";
import SolarDiskViewer from "../components/SolarDiskViewer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export default function RecordsPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedSolarData, setSelectedSolarData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewDate, setViewDate] = useState(new Date()); 
  const reportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch('/api/dataset-stats');
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const jsonData = await res.json();
        setData(jsonData);
        
        if (jsonData.availableDates?.length > 0) {
            const sorted = [...jsonData.availableDates].sort((a,b) => b.localeCompare(a));
            setSelectedDate(sorted[0]);
            setViewDate(new Date(sorted[0]));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, []);

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
            hasRecord: data?.availableDates?.includes(dateStr)
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
        
        // Update state so the hidden template renders with this data
        setSelectedSolarData(solarData);
        
        // Use a temporary container for the report
        const reportContainer = document.getElementById("hidden-report-container");
        if (!reportContainer) throw new Error("Report container not found");
        
        // Wait for images to load if any
        await new Promise(r => setTimeout(r, 1000));

        const summaryElement = document.getElementById("record-report-summary");
        const tableElement = document.getElementById("record-report-table");
        
        if (!summaryElement || !tableElement) throw new Error("Report parts not found");

        const captureOptions = {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
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
    <div className="p-4 pt-20 lg:p-8 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Calendar className="h-6 w-6 md:h-8 md:w-8 text-slate-800" />
             Archivos
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base font-medium max-w-xl hidden md:block">
            Archivo histórico de observaciones. Los registros disponibles se indican con marcas en el calendario.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                    <select 
                        value={viewDate.getMonth()} 
                        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-800 transition-all appearance-none text-center"
                    >
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select 
                        value={viewDate.getFullYear()} 
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-800 transition-all appearance-none text-center"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-6">
                {['D','L','M','M','J','V','S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-slate-400 text-center py-2">{d}</div>
                ))}
                {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
                    const isSelected = selectedDate === d.dateStr;
                    return (
                        <button 
                            key={i} 
                            disabled={!d.hasRecord}
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center text-sm transition-all relative font-bold h-9 w-9 mx-auto rounded-full",
                                d.hasRecord 
                                    ? isSelected
                                        ? "bg-slate-900 text-white shadow-lg scale-110"
                                        : "text-slate-700 hover:bg-slate-100"
                                    : "text-slate-300 pointer-events-none"
                            )}
                        >
                            <span className="relative z-10">{d.day}</span>
                            {d.hasRecord && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-slate-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
            

          </div>


        </div>

        {/* Viewer Column */}
        <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 animate-in fade-in flex flex-col relative h-full">
                <SolarDiskViewer 
                    availableDates={data?.availableDates || []} 
                    date={selectedDate}
                />
                
                {/* Download Button */}
                <div className="mt-6 flex justify-start sm:absolute sm:top-6 sm:right-6 sm:mt-0">
                     <button 
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-800 hover:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all active:scale-95 group disabled:opacity-50 shadow-sm"
                     >
                        {downloading ? (
                            <div className="h-4 w-4 border-2 border-slate-200 border-t-slate-800 rounded-sm animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                        )}
                        {downloading ? "Generando..." : "Exportar PDF"}
                     </button>
                </div>
            </div>
        </div>
      </div>

    <div id="hidden-report-container" className="fixed left-[-9999px] top-0 w-[1024px] pointer-events-none opacity-0">
        {selectedSolarData && selectedDate && (
            <div className="flex flex-col gap-10 bg-white p-10">
                <div id="record-report-summary" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-10 flex flex-col text-[#0f172a]">
                    <div className="flex justify-between border-b border-[#e2e8f0] pb-6 mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-[#0f172a] border border-[#1e293b] rounded-md flex items-center justify-center text-white font-black text-sm shadow-sm">SOL</div>
                            <div>
                                <h2 className="text-xl font-bold text-[#0f172a]">Informe de Registro Heliográfico</h2>
                                <p className="text-[11px] font-semibold text-[#94a3b8] mt-0.5 uppercase tracking-widest">Heliographic Research Center — FIUNA</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[#94a3b8] mb-1 uppercase tracking-widest">Referencia</p>
                            <p className="text-base font-mono font-bold text-[#0f172a]">REF-{selectedDate.replace(/-/g, "")}-ARCH</p>
                        </div>
                    </div>

                    <div className="mb-10 space-y-4">
                        <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 text-[#64748b] uppercase tracking-widest">Resumen Visual del Disco</h4>
                        <div className="aspect-square max-w-sm mx-auto bg-black rounded-full overflow-hidden border-4 border-[#f1f5f9] relative">
                            <img src={`https://vps-4530064-x.dattaweb.com/full_disk/${selectedDate}.jpg`} alt="Full Disk" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                            <svg viewBox="0 0 1024 1024" className="absolute inset-0 w-full h-full opacity-40">
                                {selectedSolarData.crops?.map((d: any, idx: number) => (
                                    <rect 
                                        key={idx} 
                                        x={d.x - d.w/2} 
                                        y={d.y - d.h/2} 
                                        width={d.w} 
                                        height={d.h} 
                                        fill="none" 
                                        stroke="#22c55e" 
                                        strokeWidth="4" 
                                    />
                                ))}
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

                    <div className="mb-10 p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9] space-y-2">
                        <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-3 w-3" /> Notas del Archivo
                        </h4>
                        <p className="text-xs text-[#475569] leading-relaxed italic">
                            {isTrainingData 
                                ? "Este registro corresponde a datos históricos de la NOAA y el SDO. Estos fueron empleados como base de entrenamiento para los modelos YOLO26n y ConvNextV2 utilizados en este sistema."
                                : "Este registro ha sido generado mediante el proceso de análisis estándar del observatorio, utilizando modelos de visión artificial validados."
                            }
                        </p>
                    </div>
                </div>

                <div id="record-report-table" className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-10 flex flex-col text-[#0f172a]">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black border-b border-[#f1f5f9] pb-2 flex justify-between items-center text-[#64748b] uppercase tracking-widest">
                            Detalle de Manchas Registradas
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-[10px] font-black text-[#94a3b8] border-b border-[#e2e8f0] bg-[#f8fafc] uppercase tracking-widest">
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
                    
                    <div className="mt-12 pt-6 border-t border-[#f1f5f9] flex justify-between items-end gap-6">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Archivo Histórico</p>
                            <div className="h-px w-28 bg-[#e2e8f0]" />
                            <p className="text-[10px] font-semibold text-[#94a3b8]">Base de Datos Heliográfica — FIUNA</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Sello de Archivo</p>
                             <div className="h-px w-32 bg-[#0f172a] ml-auto" />
                        </div>
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
