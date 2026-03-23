"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { DownloadCloud, Loader2, Database } from "lucide-react";

// Mock data: Sunspot occurrences over the year
const histogramData = [
  { month: 'Ene', count: 45 }, { month: 'Feb', count: 52 },
  { month: 'Mar', count: 38 }, { month: 'Abr', count: 65 },
  { month: 'May', count: 80 }, { month: 'Jun', count: 72 },
  { month: 'Jul', count: 95 }, { month: 'Ago', count: 110 },
  { month: 'Sep', count: 85 }, { month: 'Oct', count: 60 },
  { month: 'Nov', count: 48 }, { month: 'Dic', count: 35 },
];

// Mock data: Butterfly diagram (Year/Lat distribution)
const butterflyData = Array.from({ length: 50 }, (_, i) => ({
  year: 2010 + Math.random() * 14,
  lat: (Math.random() - 0.5) * 80, // -40 to 40 degrees
  area: Math.random() * 500 + 50,
}));

export default function DatasetPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2500);
  };

  return (
    <div className="p-5 pt-24 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Dataset Registrado</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-light italic">
            Registros clasificados y diagrama de mariposa histórico.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:text-red-600 transition-colors shadow-sm w-full md:w-auto"
        >
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <DownloadCloud className="h-4 w-4" />}
          {isSyncing ? "Sincronizando Drive..." : "Sincronizar"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Histogram */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-serif font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" />
            Clasificaciones Anuales (2024)
          </h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Volumen de manchas solares detectadas mensualmente</p>
          <div className="h-[350px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontFamily: 'inherit'
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar 
                  dataKey="count" 
                  name="Manchas" 
                  fill="#dc2626" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Butterfly Diagram */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-serif font-bold text-slate-900 mb-2 flex items-center gap-2">
            Diagrama de Mariposa
          </h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Distribución latitudinal por tiempo (Ciclo Solar)</p>
          <div className="h-[350px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="year" 
                  name="Año" 
                  domain={[2010, 2024]}
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => Math.round(val).toString()}
                />
                <YAxis 
                  type="number" 
                  dataKey="lat" 
                  name="Latitud (°)" 
                  domain={[-50, 50]}
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickLine={false}
                />
                <ZAxis type="number" dataKey="area" range={[20, 200]} name="Área" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Scatter 
                  name="Mancha Solar" 
                  data={butterflyData} 
                  fill="#7f1d1d" 
                  opacity={0.6}
                  animationDuration={1500}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
