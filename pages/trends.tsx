"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Line, Brush, Legend, ComposedChart, ReferenceLine,
} from "recharts";
import { Info, TrendingUp, Zap, Clock, Map as MapIcon, ChevronDown } from "lucide-react";

// Shared tick formatter yearFloat → "YYYY-MM"
const yf2m = (v: any) => {
  if (typeof v !== 'number') return String(v || '');
  const yr = Math.floor(v);
  const mo = Math.round((v - yr) * 12) + 1;
  return `${yr}-${String(Math.min(mo, 12)).padStart(2, "0")}`;
};

// ─── Chart skeleton ───────────────────────────────────────────────────────────
function ChartSkeleton({ height = 400, text = "Calculando…" }: { height?: number, text?: string }) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center animate-pulse shadow-sm"
    >
      <div className="flex flex-col items-center gap-3 opacity-60">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-bold">{text}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendsPage() {
  const [baseLoading, setBaseLoading]       = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  
  // Separated rendering flags for non-blocking mounting
  const [renderSsn, setRenderSsn] = useState(false);
  const [renderButterfly, setRenderButterfly] = useState(false);

  // RAM cache
  const [clientCache, setClientCache] = useState<Record<number, any>>({});

  const [forecastHorizon, setForecastHorizon] = useState(60);
  const [forecast, setForecast] = useState<any>(null);
  const [monthIdx,  setMonthIdx]  = useState(0);
  const [mounted, setMounted] = useState(false);

  // ── Parallel delayed application to unblock main thread ─────────────
  const applyData = useCallback((data: any, fromCache: boolean = false) => {
    if (!fromCache) {
      setForecastLoading(true);
      setRenderSsn(false);
      setRenderButterfly(false);
    }
    
    // Defer processing to visual pipeline
    setTimeout(() => {
      setForecast(data);
      if (data.forecastStartIndex > 0) setMonthIdx(data.forecastStartIndex);
      
      if (!fromCache) {
        setForecastLoading(false);
        setBaseLoading(false);
        // Render components incrementally
        setTimeout(() => setRenderSsn(true), 10);
        setTimeout(() => setRenderButterfly(true), 50);
      }
    }, 0);
  }, []);

  // ── Fetch forecast with RAM Cache ─────────────
  const fetchForecast = useCallback(async (horizon: number) => {
    if (clientCache[horizon]) {
      applyData(clientCache[horizon], true);
      return;
    }

    setForecastLoading(true);
    setRenderSsn(false);
    setRenderButterfly(false);

    try {
      const res = await fetch(`/api/forecast?horizon=${horizon}`);
      if (!res.ok) throw new Error("Forecast fetch failed");
      const json = await res.json();
      setClientCache(prev => ({ ...prev, [horizon]: json }));
      applyData(json, false);
    } catch (e) {
      console.error(e);
      setForecastLoading(false);
      setBaseLoading(false);
    }
  }, [clientCache, applyData]);

  useEffect(() => {
    setMounted(true);
    fetchForecast(forecastHorizon);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when horizon changes (debounced via button or select)
  const handleHorizonChange = useCallback((h: number) => {
    setForecastHorizon(h);
    fetchForecast(h);
  }, [fetchForecast]);

  // ── Derived data — all O(1) lookups, zero heavy computation ────────────────
  const predictions       = forecast?.predictions       ?? [];
  const butterflyHistorical = forecast?.butterflyHistorical ?? [];
  const butterflyForecast   = forecast?.butterflyForecast   ?? [];
  const densityCache      = forecast?.densityCache       ?? {};
  const xDomain           = forecast?.xDomain            ?? [0, 1];

  const currentMonthData  = predictions[monthIdx] ?? {};
  const currentDiskDensity = densityCache[monthIdx] ?? [];
  const forecastOptions   = useMemo(() => predictions.filter((p: any) => p.isForecast), [predictions]);

  if (baseLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-xl shadow-sm animate-spin" />
        <span className="text-slate-500 font-bold tracking-widest animate-pulse uppercase">
          Sincronizando Ciclo…
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-20 lg:p-8 max-w-screen-2xl mx-auto min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white text-slate-600 rounded-md text-[10px] md:text-xs font-bold border border-slate-200 shadow-sm uppercase tracking-wider">
              Hathaway Model v1.0
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 hidden md:block">Pronóstico Temporal</h1>
        </div>
      </div>

      {/* Simplified Prediction Horizon Control */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <h2 className="text-base md:text-lg font-bold text-slate-800 uppercase tracking-tight">
           Proyección Ciclo 25
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 transition-all rounded-lg px-4 py-2 w-full shadow-sm">
              <Clock className="w-4 h-4 text-indigo-500 pointer-events-none" />
              <div className="flex flex-col relative flex-1">
                <select
                  value={forecastHorizon}
                  onChange={(e) => handleHorizonChange(parseInt(e.target.value))}
                  className="bg-transparent text-slate-900 font-bold text-sm outline-none appearance-none cursor-pointer w-full pr-6 py-1"
                >
                  <option value={12} className="bg-white">Próximo Año</option>
                  <option value={24} className="bg-white">Próximos 2 Años</option>
                  <option value={60} className="bg-white">Próximos 5 Años</option>
                  <option value={120} className="bg-white">Próxima Década</option>
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
            </div>
          </div>
          
          <button
            onClick={() => fetchForecast(forecastHorizon)}
            disabled={forecastLoading}
            className="flex items-center justify-center p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shrink-0 shadow-md"
            title="Sincronizar Predicción"
          >
            <Zap className={`h-5 w-5 ${forecastLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

        {/* SSN Chart */}
      <div className="bg-white p-4 lg:p-8 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        <h3 className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-between uppercase tracking-widest">
          <span>Sunspot Number (SSN)</span>
          <TrendingUp className="h-5 w-5 opacity-40 text-indigo-600" />
        </h3>
        
        {!mounted || forecastLoading || !renderSsn ? <ChartSkeleton height={400} text="Generando Serie SSN..." /> : (
          <div className="w-full overflow-x-auto pb-4 mt-6">
            <div className="h-[450px] min-w-[800px] bg-white rounded-lg flex items-center justify-center">
              <ComposedChart width={800} height={450} data={predictions} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis type="number" dataKey="yearFloat" scale="linear" domain={xDomain}
                  fontSize={10} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#64748b", fontWeight: 700 }} tickFormatter={yf2m} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }} 
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                  labelFormatter={yf2m} 
                />
                <Legend verticalAlign="top" height={40} iconType="circle"
                  wrapperStyle={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, paddingBottom: "20px" }} />
                <Line isAnimationActive={false} type="monotone" dataKey="historySsn" name="Histórico" stroke="#94a3b8" strokeWidth={3} dot={false} strokeOpacity={0.6} />
                <Line isAnimationActive={false} type="monotone" dataKey="hathawaySSN" name="Kalman Filter" stroke="#4f46e5" strokeWidth={3} dot={false} strokeDasharray="8 6" />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#4f46e5" strokeWidth={2} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#4f46e5", fontSize: 10, fontWeight: "bold" }} />
                )}
                <Brush dataKey="yearFloat" height={24} stroke="#e2e8f0" fill="#f8fafc" tickFormatter={yf2m} />
              </ComposedChart>
            </div>
          </div>
        )}
      </div>

      {/* Butterfly Diagram */}
      <div className="mt-6 bg-white p-4 lg:p-8 rounded-xl border border-slate-200 shadow-sm min-h-[400px] mb-12">
        <h3 className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-between uppercase tracking-widest">
          <span>Distribución Latitudinal (Spörer)</span>
          <MapIcon className="h-5 w-5 opacity-40 text-indigo-600" />
        </h3>
        
        {!mounted || forecastLoading || !renderButterfly ? <ChartSkeleton height={400} text="Mapeando Latitudes..." /> : (
          <div className="w-full overflow-x-auto pb-4 mt-6">
            <div className="h-[450px] min-w-[800px] bg-white rounded-lg flex items-center justify-center">
              <ScatterChart width={800} height={450} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis type="number" dataKey="year" name="Mes" domain={xDomain}
                  fontSize={10} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#64748b", fontWeight: 700 }} tickFormatter={yf2m} />
                <YAxis dataKey="lat" hide={true} domain={[-50, 50]} />
                <ZAxis dataKey="area" range={[2, 12]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                  formatter={(v: any, n: any) => [typeof v === "number" ? v.toFixed(2) : v, n]}
                  labelFormatter={yf2m}
                />
                <Legend verticalAlign="top" height={40} iconType="circle"
                  wrapperStyle={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, paddingBottom: "20px" }} />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#4f46e5" strokeWidth={2} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#4f46e5", fontSize: 10, fontWeight: "bold" }} />
                )}
                <Scatter isAnimationActive={false} name="Registros Históricos" data={butterflyHistorical} fill="#94a3b8" fillOpacity={0.4} />
                <Scatter isAnimationActive={false} name="Modelo Generativo" data={butterflyForecast} fill="#4f46e5" fillOpacity={0.7} />
              </ScatterChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
