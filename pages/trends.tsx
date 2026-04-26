"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Line, Brush, Legend, ComposedChart, ReferenceLine,
} from "recharts";
import { Info, TrendingUp, Zap, Map as MapIcon, Loader2 } from "lucide-react";
import Head from "next/head";

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
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-xl animate-spin" />
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
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-xl shadow-sm animate-spin" />
        <span className="text-slate-500 font-bold tracking-widest animate-pulse uppercase">
          Sincronizando Ciclo…
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-20 lg:p-8 lg:pt-24 max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Head>
        <title>Tendencia | Plataforma de Investigación Solar</title>
      </Head>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <TrendingUp className="h-7 w-7 text-slate-800 shrink-0" strokeWidth={1.5} />
            Tendencia de Actividad
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium hidden sm:block max-w-2xl">
            Análisis y proyección de la actividad fotosférica basado en <span className="text-slate-900 font-bold">registros históricos y modelos generativos</span>.
          </p>
          <div className="flex items-center gap-2 mt-4 text-[10px] leading-relaxed text-slate-400 font-medium italic border-l-2 border-slate-200 pl-3">
             <Info className="h-3 w-3 shrink-0" />
             Las proyecciones se calculan automáticamente en base a los registros almacenados en la plataforma.
          </div>
        </div>
      </div>

      {/* Simplified Prediction Horizon Control */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Horizonte de Proyección</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <div className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-800 transition-all rounded-lg px-4 py-2 w-full shadow-sm">
              <select
                value={forecastHorizon}
                onChange={(e) => handleHorizonChange(parseInt(e.target.value))}
                className="bg-transparent text-slate-900 font-bold text-sm outline-none appearance-none cursor-pointer w-full pr-10 py-1"
              >
                <option value={12}>+12 Meses</option>
                <option value={24}>+24 Meses</option>
                <option value={60}>+60 Meses (5 años)</option>
                <option value={120}>+120 Meses (10 años)</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                 <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {forecastLoading && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in zoom-in duration-300">
               <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
               <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest hidden sm:block">Sincronizando</span>
            </div>
          )}
        </div>
      </div>

        {/* SSN Chart */}
      <div className="bg-white p-6 lg:p-10 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-slate-800" />
             Número de Manchas Solares (SSN)
          </h3>
          <span className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 rounded border border-slate-100 uppercase tracking-widest">Filtro de Kalman</span>
        </div>
        
        {!mounted || forecastLoading || !renderSsn ? <ChartSkeleton height={400} text="Generando Serie SSN..." /> : (
          <div className="w-full h-[450px]">
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictions} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis type="number" dataKey="yearFloat" scale="linear" domain={xDomain}
                  fontSize={10} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#94a3b8", fontWeight: 700 }} tickFormatter={yf2m} />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }} 
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                  labelFormatter={yf2m} 
                />
                <Legend verticalAlign="top" align="right" height={40} iconType="circle"
                  wrapperStyle={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, paddingBottom: "20px" }} />
                <Line isAnimationActive={false} type="monotone" dataKey="historySsn" name="Histórico" stroke="#cbd5e1" strokeWidth={3} dot={false} strokeOpacity={0.6} />
                <Line isAnimationActive={false} type="monotone" dataKey="hathawaySSN" name="Modelo Generativo" stroke="#10b981" strokeWidth={3} dot={false} strokeDasharray="8 6" />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#10b981", fontSize: 9, fontWeight: "900" }} />
                )}
              </ComposedChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Butterfly Diagram */}
      <div className="mt-6 bg-white p-4 lg:p-8 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        <h3 className="text-[10px] font-black text-slate-400 mb-1 flex items-center justify-between uppercase tracking-[0.2em]">
          <span>Distribución Latitudinal (Spörer)</span>
          <MapIcon className="h-5 w-5 opacity-40 text-emerald-600" />
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
                  cursor={{ strokeDasharray: "3 3", stroke: "#10b981" }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                  formatter={(v: any, n: any) => [typeof v === "number" ? v.toFixed(2) : v, n]}
                  labelFormatter={yf2m}
                />
                <Legend verticalAlign="top" height={40} iconType="circle"
                  wrapperStyle={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, paddingBottom: "20px" }} />
                {predictions[monthIdx]?.yearFloat != null && (
                  <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#10b981" strokeWidth={2} strokeDasharray="4 4"
                    label={{ value: predictions[monthIdx].month, position: "top", fill: "#059669", fontSize: 10, fontWeight: "bold" }} />
                )}
                <Scatter isAnimationActive={false} name="Registros Históricos" data={butterflyHistorical} fill="#94a3b8" fillOpacity={0.4} />
                <Scatter isAnimationActive={false} name="Modelo Generativo" data={butterflyForecast} fill="#10b981" fillOpacity={0.7} />
              </ScatterChart>
            </div>
          </div>
        )}
      </div>

      {/* Scientific References Section */}
      <div className="mt-12 mb-20 p-8 bg-slate-900 text-white rounded-2xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-1000" />
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            Base Científica y Referencias
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Análisis SSN (Kalman Filter)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                La proyección del número de manchas solares se basa en el modelo de filtro de Kalman adaptativo, optimizado para la predicción de series temporales solares no lineales.
              </p>
              <p className="text-[10px] font-mono text-emerald-500/80 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                Podladchikova, T., & Van der Linden, R. A. M. (2012). A Kalman Filter for Sunspot Number Series Analysis and Prediction. Solar Physics.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Distribución Latitudinal
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                La ley de Spörer y la migración latitudinal del ciclo solar siguen las caracterizaciones cinemáticas y observacionales descritas por Hathaway.
              </p>
              <p className="text-[10px] font-mono text-emerald-500/80 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                Hathaway, D. H. (2010). The Solar Cycle. Living Reviews in Solar Physics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
