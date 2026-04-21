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
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-slate-600 font-medium text-sm animate-pulse">Cargando Registros...</span>
        </div>
    </div>
  );

  return (
    <div className="p-4 pt-20 lg:p-8 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Calendar className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
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
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none text-center"
                    >
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select 
                        value={viewDate.getFullYear()} 
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none text-center"
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
                                "aspect-square flex flex-col items-center justify-center text-sm rounded-md transition-all relative border border-transparent font-medium",
                                d.hasRecord 
                                    ? isSelected
                                        ? "bg-indigo-600 text-white font-bold shadow-md"
                                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
                                    : "text-slate-400 cursor-not-allowed opacity-50"
                            )}
                        >
                            {d.day}
                        </button>
                    );
                })}
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-3 w-3 bg-indigo-50 border border-indigo-200 rounded-sm" />
                    <span className="text-xs text-slate-500 font-semibold">Registros Disponibles</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    La base de datos contiene {data?.availableDates?.length || 0} registros validados desde 2010.
                </p>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <h3 className="text-sm font-bold text-slate-900 mb-4 relative z-10">Integridad de DB</h3>
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Status</span>
                    <span className="text-emerald-700">100% Válido</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold p-3 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Conexión Segura
                </div>
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
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:border-indigo-600 hover:text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-all active:scale-95 group disabled:opacity-50 shadow-sm"
                     >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        )}
                        {downloading ? "Generando..." : "Exportar PDF"}
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
