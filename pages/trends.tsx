"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Info } from "lucide-react";

// Mock data: Historical sunspot numbers and predictive curve
const data = [
  { year: 2014, actual: 110, predicted: 115 },
  { year: 2015, actual: 95, predicted: 90 },
  { year: 2016, actual: 70, predicted: 65 },
  { year: 2017, actual: 40, predicted: 45 },
  { year: 2018, actual: 20, predicted: 22 },
  { year: 2019, actual: 10, predicted: 12 },
  { year: 2020, actual: 15, predicted: 18 },
  { year: 2021, actual: 35, predicted: 40 },
  { year: 2022, actual: 70, predicted: 75 },
  { year: 2023, actual: 120, predicted: 110 },
  { year: 2024, actual: null, predicted: 140 }, // Future prediction starts
  { year: 2025, actual: null, predicted: 155 },
  { year: 2026, actual: null, predicted: 145 },
  { year: 2027, actual: null, predicted: 120 },
];

export default function TrendsPage() {
  const currentPrediction = useMemo(() => {
    return data.find(d => d.year === 2024)?.predicted || 0;
  }, []);

  return (
    <div className="p-5 pt-24 lg:p-10 max-w-7xl mx-auto">
      <div className="mb-10 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Curvas de Tendencia</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-light italic">
            Predicción del ciclo solar mediante modelos Deep Learning.
          </p>
        </div>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 flex items-center gap-3 shadow-sm min-w-max">
            <Activity className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider">Pico Estimado (2025)</span>
              <span className="text-xl font-bold font-serif leading-none">~155 SSN</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Evolución y Predicción SSN
            </h2>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#334155" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#334155" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontFamily: 'inherit'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    name="Registrado (SSN)"
                    stroke="#334155" 
                    fillOpacity={1} 
                    fill="url(#colorActual)" 
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#334155' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    name="Predicción"
                    stroke="#dc2626" 
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="text-sm font-medium text-slate-600">Datos Históricos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 border border-red-700 border-dashed" />
                <span className="text-sm font-medium text-slate-600">Proyección IA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Modelo Actual</h3>
            <p className="text-lg font-serif font-bold tracking-wide">LSTM v2.4 (Multivariante)</p>
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div>
                <span className="block text-xs text-slate-400 mb-1">Ventana de Observación</span>
                <span className="font-mono text-sm">24 Ciclos Solares (1755-2023)</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Métrica de Error (RMSE)</span>
                <span className="font-mono text-sm text-red-400">±14.2 SSN</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Predicción 2024</span>
                <span className="font-serif text-3xl font-bold text-red-500">{currentPrediction}</span>
                <span className="text-sm text-slate-400 ml-2">Manchas</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Info className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Nota Científica</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              Las proyecciones se ajustan automáticamente a medida que se registran nuevos datos en el 
              <span className="font-semibold text-slate-800 mx-1">Dataset</span>. El ciclo escolar actual (#25) 
              muestra señales de un máximo adelantado y más intenso de lo estimado originalmente por el consenso científico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
