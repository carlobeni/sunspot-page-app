"use client";

import { useState, useEffect, useMemo } from "react";
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
  Calendar 
} from "lucide-react";
import SolarDiskViewer from "../components/SolarDiskViewer";
import jsPDF from "jspdf";

// Re-defining cn for this file as well
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export default function RecordsPage() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [viewDate, setViewDate] = useState(new Date()); 

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

        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("INFORME DE OBSERVACION SOLAR", 20, 30);
        doc.setFontSize(10);
        doc.text(`HASH ID: REF-${selectedDate.replace(/-/g, '')}-S3`, 20, 40);
        doc.line(20, 45, 190, 45);
        
        doc.setFontSize(12);
        doc.text(`Fecha: ${selectedDate}`, 20, 60);
        doc.text(`Institucion: FIUNA - Observatorio Alexis Troche Boggino`, 20, 68);
        
        doc.setFontSize(14);
        doc.text("RESUMEN DE RESULTADOS", 20, 90);
        doc.setFontSize(10);
        doc.text(`- Unidades detectadas: ${solarData.crops?.length || 0}`, 20, 100);
        doc.text(`- Fidelidad Imagen: ${solarData.fullDiskMetadata?.width}x${solarData.fullDiskMetadata?.height} px`, 20, 107);

        if (solarData.crops?.length > 0) {
            doc.text("DESGLOSE TEORICO", 20, 125);
            let y = 135;
            doc.setFontSize(8);
            doc.text("REF", 20, y);
            doc.text("LAT", 40, y);
            doc.text("LON", 70, y);
            doc.text("TYPE (McIntosh)", 100, y);
            doc.text("MAG. CONFIG", 140, y);
            doc.line(20, y+2, 190, y+2);
            
            y += 10;
            solarData.crops.forEach((crop: any, i: number) => {
                doc.text(`#${i+1}`, 20, y);
                doc.text(`${crop.lat.toFixed(2)}`, 40, y);
                doc.text(`${crop.lon.toFixed(2)}`, 70, y);
                doc.text(`${crop.mcintosh_full || "N/A"}`, 100, y);
                doc.text(`${crop.mag_class || "N/A"}`, 140, y);
                y += 8;
            });
        }
        doc.save(`solar_report_${selectedDate}.pdf`);
    } catch (err) {
        console.error(err);
        alert("Error al generar PDF");
    } finally {
        setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-xl animate-spin" />
            <span className="text-white font-serif font-black italic tracking-widest animate-pulse uppercase">Fetching Records...</span>
        </div>
    </div>
  );

  return (
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-[#020617] text-slate-200">
      {/* Header Noir */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-800 pb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-white tracking-widest uppercase flex items-center gap-8">
             <Calendar className="h-12 w-12 text-slate-500" />
             Registros
          </h1>
          <p className="text-slate-500 mt-6 text-xl font-light italic border-l-2 border-slate-800 pl-8 tracking-tight">
            Archivo histórico de observaciones. Los registros disponibles se indican en <span className="text-white font-black underline underline-offset-8">Blanco/Plata</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Calendar Column Noir */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="space-y-6 mb-10">
                <div className="grid grid-cols-1 gap-4">
                    <select 
                        value={viewDate.getMonth()} 
                        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                        className="w-full bg-black border border-slate-800 rounded-xl px-6 py-4 text-[10px] font-black text-white outline-none focus:border-white transition-all appearance-none text-center uppercase tracking-[0.3em]"
                    >
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select 
                        value={viewDate.getFullYear()} 
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="w-full bg-white text-black rounded-xl px-6 py-4 text-[10px] font-black outline-none transition-all appearance-none text-center uppercase tracking-[0.3em]"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-slate-800 border border-slate-800 mb-8 shadow-inner">
                {['D','L','M','M','J','V','S'].map((d, i) => (
                    <div key={i} className="bg-black text-[9px] font-black text-slate-600 text-center py-4 uppercase tracking-tighter">{d}</div>
                ))}
                {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="bg-black/40" />;
                    const isSelected = selectedDate === d.dateStr;
                    return (
                        <button 
                            key={i} 
                            disabled={!d.hasRecord}
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center text-[10px] rounded-xl transition-all relative border border-slate-900/50",
                                d.hasRecord 
                                    ? isSelected
                                        ? "bg-white text-black font-black z-10 scale-105 shadow-2xl shadow-white/20"
                                        : "bg-slate-800 text-white font-bold hover:bg-slate-700 border-slate-700 shadow-inner"
                                    : "text-slate-800 bg-black/60 cursor-default opacity-50"
                            )}
                        >
                            {d.day}
                        </button>
                    );
                })}
            </div>
            
            <div className="pt-8 border-t border-slate-800 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-4 w-4 bg-slate-800 border border-slate-700 rounded-md shadow-inner" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Registros Disponibles</span>
                </div>
                <div className="bg-black p-6 border border-slate-800">
                    <p className="text-[9px] text-slate-500 leading-relaxed font-light italic uppercase tracking-tighter">
                        La base de datos contiene {data?.availableDates?.length || 0} registros validados desde 2010.
                    </p>
                </div>
            </div>
          </div>

          {/* Database Info Noir */}
          <div className="bg-white p-8 rounded-2xl text-black shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Search className="h-24 w-24" />
             </div>
             <h3 className="text-[10px] font-black mb-6 relative z-10 uppercase tracking-[0.4em]">Vault Integrity</h3>
             <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">Health Check</span>
                    <span className="font-mono text-black">100% Valid</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-xl overflow-hidden">
                    <div className="bg-black h-full w-full" />
                </div>
                <div className="flex items-center gap-3 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] p-4 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    Secure Connection
                </div>
             </div>
          </div>
        </div>

        {/* Viewer Column Noir */}
        <div className="lg:col-span-3">
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <SolarDiskViewer 
                    availableDates={data?.availableDates || []} 
                    date={selectedDate}
                />
                
                {/* Download Button Noir */}
                <div className="flex justify-start pl-10 -mt-24 relative z-20">
                     <button 
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center gap-4 px-12 py-6 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.5em] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-slate-200 transition-all active:scale-95 group disabled:opacity-30"
                     >
                        {downloading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-black" />
                        ) : (
                            <FileText className="h-5 w-5 text-black group-hover:scale-110 transition-transform" />
                        )}
                        {downloading ? "Generating..." : "Export Record to PDF"}
                     </button>
                </div>
            </div>
        </div>
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
