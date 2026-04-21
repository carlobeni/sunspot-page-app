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
function ChartSkeleton({ height = 450, text = "Calculando…" }: { height?: number, text?: string }) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-xl bg-slate-800/40 animate-pulse flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 opacity-50">
        <div className="w-10 h-10 border-4 border-slate-500 border-t-white rounded-xl animate-spin" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{text}</span>
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
    <div className="flex items-center justify-center min-h-screen bg-[#020617]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-xl animate-spin" />
        <span className="text-white font-serif font-black italic tracking-widest animate-pulse uppercase">
          Sincronizando Ciclo…
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-[#020617] text-slate-200">

      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-4 py-1 bg-slate-900 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] border border-slate-800">
              Hathaway Model v1.0
            </span>
          </div>
          <h1 className="text-4xl font-serif font-black text-white tracking-widest uppercase">Pronóstico</h1>
          <p className="text-slate-500 mt-4 text-xl font-light tracking-tight max-w-2xl leading-relaxed italic border-l-2 border-slate-800 pl-6">
            Ley de Spörer proyectada sobre el{" "}
            <span className="text-white font-black underline decoration-slate-700 underline-offset-8">Ciclo Solar 25</span>.
          </p>
        </div>
      </div>

      {/* Simplified Prediction Horizon Control */}
      <div className="mb-12 flex items-center justify-between border-b border-slate-800/50 pb-6">
        <h2 className="text-xl font-serif font-black text-white italic tracking-widest opacity-80 hidden sm:block">
           Proyección
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-[#10b981] transition-all rounded-full px-5 py-2 shadow-lg relative">
              <Clock className="w-4 h-4 text-[#10b981] pointer-events-none" />
              <div className="flex flex-col relative">
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold leading-none mb-0.5 pointer-events-none">
                  Ventana de Predicción
                </span>
                <select
                  value={forecastHorizon}
                  onChange={(e) => handleHorizonChange(parseInt(e.target.value))}
                  className="bg-transparent text-white font-black text-[11px] sm:text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer w-[120px] sm:w-[140px]"
                >
                  <option value={12} className="bg-slate-900 text-slate-200">1 Año a futuro</option>
                  <option value={24} className="bg-slate-900 text-slate-200">2 Años a futuro</option>
                  <option value={60} className="bg-slate-900 text-slate-200">5 Años a futuro</option>
                  <option value={120} className="bg-slate-900 text-slate-200">10 Años a futuro</option>
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-[#10b981] transition-colors pointer-events-none absolute right-4" />
            </div>
          </div>
          
          <button
            onClick={() => fetchForecast(forecastHorizon)}
            disabled={forecastLoading}
            className="flex items-center justify-center p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[#10b981] disabled:opacity-50 transition-colors shadow-lg"
            title="Sincronizar Predicción"
          >
            <Zap className={`h-4 w-4 ${forecastLoading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* SSN Chart */}
      <div className="bg-slate-900 p-10 lg:p-20 rounded-2xl border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-[560px]">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.5em] mb-2 flex justify-between items-center border-l-4 border-white pl-8">
          SSN
          <TrendingUp className="h-5 w-5 opacity-40" />
        </h3>
        <p className="text-[10px] text-slate-400 mb-10 pl-8 font-light italic tracking-widest uppercase">
          Amplitud suavizada mediante Filtro de Kalman Adaptativo.
        </p>
        {forecastLoading || !renderSsn ? <ChartSkeleton height={450} text="Generando Serie SSN..." /> : (
          <div className="h-[450px] animate-in fade-in duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictions} margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis type="number" dataKey="yearFloat" scale="linear" domain={xDomain}
                  fontSize={9} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#475569" }} tickFormatter={yf2m} />
                <YAxis width={80} fontSize={9} tick={{ fill: "#475569" }}
                  label={{ value: "Manchas/mes", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#fff" }} labelFormatter={yf2m} />
                <Legend verticalAlign="top" height={36} iconType="circle"
                  wrapperStyle={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                <Line isAnimationActive={false} type="monotone" dataKey="historySsn" name="Continuidad Histórica" stroke="#475569" strokeWidth={1} dot={false} strokeOpacity={0.5} />
                <Line isAnimationActive={false} type="monotone" dataKey="hathawaySSN" name="Pronóstico Kalman" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#fff" strokeWidth={1} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#fff", fontSize: 8, fontWeight: "bold" }} />
                )}
                <Brush dataKey="yearFloat" height={20} stroke="#1e293b" fill="#020617" tickFormatter={yf2m} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Butterfly Diagram */}
      <div className="mt-8 bg-slate-900 p-10 lg:p-20 rounded-2xl border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-[560px] mb-20">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.5em] mb-2 flex justify-between items-center border-l-4 border-white pl-8">
          Reconstrucción Proyectada de la Ley de Spörer
          <MapIcon className="h-5 w-5 opacity-40" />
        </h3>
        <p className="text-[10px] text-slate-400 mb-10 pl-8 font-light italic tracking-widest uppercase">
          Evolución espacio-temporal de la latitud según la relación exponencial de Hathaway.
        </p>
        {!mounted || forecastLoading || !renderButterfly ? <ChartSkeleton height={450} text="Mapeando Latitudes..." /> : (
          <div className="h-[450px] w-full animate-in fade-in duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis type="number" dataKey="year" name="Mes" domain={xDomain}
                  fontSize={9} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#475569" }} tickFormatter={yf2m} />
                <YAxis type="number" dataKey="lat" name="Latitud (°)" domain={[-50, 50]}
                  width={80} fontSize={9} tick={{ fill: "#475569" }}
                  label={{ value: "Latitud (°)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} />
                <ZAxis dataKey="area" range={[1, 8]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#fff" }}
                  formatter={(v: any, n: any) => [typeof v === "number" ? v.toFixed(2) : v, n]}
                  labelFormatter={yf2m}
                />
                <Legend verticalAlign="top" height={36} iconType="circle"
                  wrapperStyle={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }} />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#ffffff" strokeWidth={1.5} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#ffffff", fontSize: 9, fontWeight: "bold" }} />
                )}
                <Scatter isAnimationActive={false} name="Registros Históricos" data={butterflyHistorical} fill="#475569" fillOpacity={0.35} />
                <Scatter isAnimationActive={false} name="Predicción Adaptativa" data={butterflyForecast} fill="#10b981" fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
