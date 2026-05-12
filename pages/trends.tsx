"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Line, Brush, Legend, ComposedChart, ReferenceLine, ReferenceArea, Label
} from "recharts";
import { Info, TrendingUp, Zap, Map as MapIcon, Loader2, Activity } from "lucide-react";
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
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{text}</span>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const [forecast, setForecast] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [baseLoading, setBaseLoading] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState(60);
  const [showKalman, setShowKalman] = useState(true);
  const [showDMD, setShowDMD] = useState(true);
  const [showDmdSpörer, setShowDmdSpörer] = useState(true);
  const [monthIdx, setMonthIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [renderButterfly, setRenderButterfly] = useState(false);
  const [renderSsn, setRenderSsn] = useState(false);
  
  const [clientCache, setClientCache] = useState<Record<number, any>>({});

  useEffect(() => {
    setMounted(true);
    fetchForecast(60);
    // Staggered render for performance
    setTimeout(() => setRenderButterfly(true), 400);
    setTimeout(() => setRenderSsn(true), 800);
  }, []);

  const applyData = (data: any, fromCache: boolean) => {
    setForecast(data);
    setMonthIdx(Math.max(0, (data?.predictions?.length || 0) - (parseInt(String(data?.horizon || 60)) || 60) - 1));
  };

  const fetchForecast = useCallback(async (h: number) => {
    if (clientCache[h]) {
      applyData(clientCache[h], true);
      return;
    }
    setForecastLoading(true);
    try {
      const res = await fetch(`/api/forecast?horizon=${h}`);
      if (!res.ok) throw new Error("Forecast fetch failed");
      const json = await res.json();
      setClientCache(prev => ({ ...prev, [h]: json }));
      applyData(json, false);
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
      setBaseLoading(false);
    }
  }, [clientCache]);

  const handleHorizonChange = (h: number) => {
    setForecastHorizon(h);
    fetchForecast(h);
  };

  // ── Derived data — all O(1) lookups, zero heavy computation ────────────────
  const predictions       = forecast?.predictions       ?? [];
  const butterflyHistorical = forecast?.butterflyHistorical ?? [];
  const butterflyForecast   = forecast?.butterflyForecast   ?? [];
  const butterflyDmdAdjustment = forecast?.butterflyDmdAdjustment ?? [];
  const butterflyDmdForecast   = forecast?.butterflyDmdForecast   ?? [];
  const densityCache      = forecast?.densityCache       ?? {};
  const xDomain           = forecast?.xDomain            ?? [0, 1];

  const currentMonthData  = predictions[monthIdx] ?? {};
  const currentDiskDensity = densityCache[monthIdx] ?? [];
  const forecastOptions   = useMemo(() => predictions.filter((p: any) => p.isForecast), [predictions]);

  // ── Metrics Calculation (MAPE) ───────────────────────────────────────────
  const { mapeKalman, mapeDmd, lastHistoryYear } = useMemo(() => {
    const historyData = predictions.filter((p: any) => !p.isForecast);
    const validHistoryData = historyData.filter((p: any) => p.historySsn > 5);
    const lastYear = historyData.length > 0 ? historyData[historyData.length - 1].yearFloat : null;

    if (validHistoryData.length === 0) return { mapeKalman: "0.0", mapeDmd: "0.0", lastHistoryYear: lastYear };
    
    const calc = (key: string) => {
      const sum = validHistoryData.reduce((acc: number, p: any) => acc + (Math.abs(p.historySsn - p[key]) / p.historySsn), 0);
      return ((sum / validHistoryData.length) * 100).toFixed(1);
    };
    
    return {
      mapeKalman: calc('kalmanSSN_history'),
      mapeDmd: calc('dmdSSN_history'),
      lastHistoryYear: lastYear
    };
  }, [predictions]);

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

      {/* Spörer Diagram Chart (Butterfly) First */}
      <div className="mt-6 bg-white p-4 lg:p-8 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-slate-50 gap-4">
          <h3 className="text-[10px] font-black text-slate-400 flex items-center gap-3 uppercase tracking-[0.2em]">
            <MapIcon className="h-5 w-5 opacity-40 text-emerald-600" />
            DIAGRAMA DE SPÖRER
          </h3>

          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <button 
              onClick={() => setShowDmdSpörer(!showDmdSpörer)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 shadow-sm ${showDmdSpörer ? 'bg-purple-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${showDmdSpörer ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${showDmdSpörer ? 'text-purple-700' : 'text-slate-400'}`}>
                Integral DMD Spörer
              </span>
              <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">
                Capa Experimental
              </span>
            </div>
          </div>
        </div>
        
        {!mounted || forecastLoading || !renderButterfly ? <ChartSkeleton height={400} text="Mapeando Latitudes..." /> : (
          <div className="w-full overflow-x-auto pb-4 mt-6">
            <div className="min-w-[1000px] bg-white rounded-xl p-2 border border-slate-50 shadow-inner">
              <ScatterChart width={1000} height={500} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis type="number" dataKey="year" name="Año" domain={xDomain}
                  fontSize={10} angle={-35} textAnchor="end" height={60}
                  tick={{ fill: "#64748b", fontWeight: 700 }} tickFormatter={yf2m} />
                <YAxis type="number" dataKey="lat" name="Latitud" domain={[-50, 50]}
                  tick={{ fill: "#64748b", fontWeight: 700 }} fontSize={10} unit="°" />
                <ZAxis type="number" dataKey="ssn" range={[5, 35]} name="SSN" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "#10b981" }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }}
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                  labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                  formatter={(v: any, n: any) => [typeof v === "number" ? v.toFixed(0) : v, n === "ssn" ? "Manchas" : n]}
                  labelFormatter={yf2m}
                />
                <Legend verticalAlign="top" height={40} align="center"
                  wrapperStyle={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, paddingBottom: "20px" }} />
                
                <ReferenceArea x1={1996.4} x2={2008.9} fill="#f5f3ff" fillOpacity={0.4} />
                <ReferenceArea x1={2008.9} x2={2019.9} fill="#eff6ff" fillOpacity={0.4} />
                <ReferenceArea x1={2019.9} x2={2030.0} fill="#f0fdf4" fillOpacity={0.4}>
                  <Label value="CICLO 25" position="insideTopLeft" fill="#059669" fontSize={12} fontWeight={900} offset={20} />
                </ReferenceArea>
                <ReferenceArea x1={2030.0} x2={2041.0} fill="#fffbeb" fillOpacity={0.4} />

                {lastHistoryYear && (
                  <ReferenceLine x={lastHistoryYear} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: yf2m(lastHistoryYear), position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                )}

                <Scatter isAnimationActive={false} name="Registros Históricos" data={butterflyHistorical} fill="#94a3b8" fillOpacity={0.3} />
                
                {showDmdSpörer && (
                  <>
                    <Scatter isAnimationActive={false} name="Ajuste DMD Spörer" data={butterflyDmdAdjustment} fill="#8b5cf6" fillOpacity={0.5} />
                    <Scatter isAnimationActive={false} name="Predicción DMD Spörer" data={butterflyDmdForecast} fill="#8b5cf6" fillOpacity={0.9} />
                  </>
                )}
              </ScatterChart>
            </div>
          </div>
        )}
      </div>

      {/* SSN Chart Second */}
      <div className="bg-white p-6 lg:p-10 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-slate-50 gap-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
             <Activity className="h-5 w-5 opacity-40 text-blue-600" />
             Número de Manchas Solares (SSN)
          </h3>
          
          {/* Responsive Model Selection Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-4 px-3 py-1.5 transition-all">
              <button 
                onClick={() => setShowKalman(!showKalman)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 shadow-sm ${showKalman ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${showKalman ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${showKalman ? 'text-emerald-700' : 'text-slate-400'}`}>
                  Podladchikova + Kalman
                </span>
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                  Error: <span className="text-emerald-500">{mapeKalman}%</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            <div className="flex items-center gap-4 px-3 py-1.5 transition-all">
              <button 
                onClick={() => setShowDMD(!showDMD)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 shadow-sm ${showDMD ? 'bg-violet-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${showDMD ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${showDMD ? 'text-violet-700' : 'text-slate-400'}`}>
                  Integral DMD Spörer
                </span>
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                  Error: <span className="text-violet-500">{mapeDmd}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {!mounted || forecastLoading || !renderSsn ? <ChartSkeleton height={400} text="Generando Serie SSN..." /> : (
          <div className="w-full overflow-x-auto pb-4 mt-6">
            <div className="min-w-[1000px] bg-white rounded-xl p-2 border border-slate-50 shadow-inner h-[500px]">
               <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={predictions} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis type="number" dataKey="yearFloat" scale="linear" domain={xDomain}
                    fontSize={10} angle={-35} textAnchor="end" height={60}
                    tick={{ fill: "#94a3b8", fontWeight: 700 }} tickFormatter={yf2m} />
                  <YAxis tick={{ fill: "#64748b", fontWeight: 700 }} fontSize={10} width={40} />
                  
                  <ReferenceArea x1={2019.9} x2={2030.0} fill="#f0fdf4" fillOpacity={0.4}>
                    <Label value="CICLO 25" position="insideTopLeft" fill="#059669" fontSize={12} fontWeight={900} offset={20} />
                  </ReferenceArea>

                  {lastHistoryYear && (
                    <ReferenceLine x={lastHistoryYear} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: yf2m(lastHistoryYear), position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  )}

                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px" }} 
                    itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                    labelStyle={{ fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}
                    labelFormatter={yf2m} 
                  />

                  <Legend 
                    verticalAlign="top" align="center" height={60}
                    content={(props) => {
                      const { payload } = props;
                      if (!payload) return null;
                      return (
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 border-b border-slate-50 pb-4">
                          {/* History Group */}
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Observación</span>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-slate-300" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico</span>
                            </div>
                          </div>

                          {showKalman && (
                            <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                              <span className="text-[9px] font-black text-emerald-200 uppercase tracking-tighter">P. + Kalman</span>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-0.5 bg-emerald-500" />
                                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ajuste</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-0.5 bg-emerald-500 border-t border-dashed" style={{ borderTopStyle: 'dashed' }} />
                                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Predicción</span>
                                 </div>
                              </div>
                            </div>
                          )}

                          {showDMD && (
                            <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                              <span className="text-[9px] font-black text-violet-200 uppercase tracking-tighter">Integral DMD Spörer</span>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-0.5 bg-violet-500" />
                                   <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Ajuste</span>
                                 </div>
                                 <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-0.5 bg-violet-500 border-t border-dashed" style={{ borderTopStyle: 'dashed' }} />
                                   <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Predicción</span>
                                 </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  
                  <ReferenceArea x1={1996.4} x2={2008.9} fill="#f5f3ff" fillOpacity={0.9}>
                    <Label value="CICLO 23" position="insideTop" offset={45} fill="#7c3aed" fontSize={10} fontWeight={900} style={{ letterSpacing: '0.1em' }} />
                  </ReferenceArea>
                  <ReferenceArea x1={2008.9} x2={2019.9} fill="#eff6ff" fillOpacity={0.9}>
                    <Label value="CICLO 24" position="insideTop" offset={45} fill="#2563eb" fontSize={10} fontWeight={900} style={{ letterSpacing: '0.1em' }} />
                  </ReferenceArea>
                  <ReferenceArea x1={2019.9} x2={2030.0} fill="#f0fdf4" fillOpacity={0.9}>
                    <Label value="CICLO 25" position="insideTop" offset={45} fill="#059669" fontSize={10} fontWeight={900} style={{ letterSpacing: '0.1em' }} />
                  </ReferenceArea>
                  <ReferenceArea x1={2030.0} x2={2041.0} fill="#fffbeb" fillOpacity={0.9}>
                    <Label value="CICLO 26" position="insideTop" offset={45} fill="#d97706" fontSize={10} fontWeight={900} style={{ letterSpacing: '0.1em' }} />
                  </ReferenceArea>

                  <Line isAnimationActive={false} type="monotone" dataKey="historySsn" name="Histórico (Obs)" stroke="#cbd5e1" strokeWidth={3} dot={false} strokeOpacity={0.6} />
                  
                  {showKalman && (
                    <>
                      <Line isAnimationActive={false} type="monotone" dataKey="kalmanSSN_history" name="Ajuste (Kalman)" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line isAnimationActive={false} type="monotone" dataKey="kalmanSSN_forecast" name="Predicción (Kalman)" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="8 6" />
                    </>
                  )}
                  
                  {showDMD && (
                    <>
                      <Line isAnimationActive={false} type="monotone" dataKey="dmdSSN_history" name="Ajuste (Integral DMD Spörer)" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeOpacity={0.8} />
                      <Line isAnimationActive={false} type="monotone" dataKey="dmdSSN_forecast" name="Predicción (Integral DMD Spörer)" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    </>
                  )}
                  
                  {predictions[monthIdx]?.yearFloat != null && (
                    <ReferenceLine x={predictions[monthIdx].yearFloat} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4"
                      label={{ value: predictions[monthIdx].month, position: "top", fill: "#10b981", fontSize: 9, fontWeight: "900" }} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
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
          </div>
        </div>
      </div>
    </div>
  );
}
