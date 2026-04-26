import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Telescope, 
  TrendingUp, 
  ClipboardList, 
  ArrowRight, 
  Camera, 
  Activity, 
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Head from "next/head";
import { BrandLogo } from "@/components/BrandLogo";

/* --- Animated Solar Decorations --- */
const SolarBackgroundDecor = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
    {/* Animated Corona Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-[radial-gradient(circle,_rgba(16,185,129,0.04)_0%,_transparent_70%)] animate-pulse duration-[10000ms]" />
    
    {/* Floating Data Particles */}
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-emerald-500/20 rounded-full animate-float-particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${10 + Math.random() * 20}s`,
            animationDelay: `${-Math.random() * 10}s`,
          }}
        />
      ))}
    </div>

    <svg className="absolute w-full h-full" viewBox="0 0 1000 1000">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Solar Wind Flow Lines */}
      {[...Array(8)].map((_, i) => (
        <path 
          key={i}
          d={`M ${-200} ${100 + i * 150} C 300 ${-50 + i * 200}, 700 ${1050 - i * 200}, 1200 ${100 + i * 150}`}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="0.4"
          strokeDasharray="100 200"
          className="animate-solar-wind"
          style={{ animationDelay: `${i * -3}s`, animationDuration: `${20 + i * 5}s` }}
        />
      ))}
    </svg>

    <style jsx>{`
      @keyframes float-particle {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        20% { opacity: 0.5; }
        80% { opacity: 0.5; }
        100% { transform: translate(${Math.random() * 100 - 50}px, -200px) scale(0.5); opacity: 0; }
      }
      @keyframes solar-wind {
        0% { stroke-dashoffset: 600; opacity: 0; }
        50% { opacity: 0.3; }
        100% { stroke-dashoffset: -600; opacity: 0; }
      }
      .animate-float-particle {
        animation: float-particle linear infinite;
      }
      .animate-solar-wind {
        animation: solar-wind linear infinite;
      }
    `}</style>
  </div>
);

/* --- Minimalist Orthographic Solar Disk --- */
const OrthographicSolarDisk = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    <div className="relative w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-[0.2] animate-parabolic">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="solarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="scanline" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="transparent" />
             <stop offset="50%" stopColor="#10B981" stopOpacity="0.2" />
             <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        <circle cx="100" cy="100" r="98" fill="url(#solarGlow)" stroke="#E2E8F0" strokeWidth="0.5" />
        
        {/* Animated Scanline Overlay */}
        <rect x="2" y="2" width="196" height="196" rx="98" fill="url(#scanline)" className="animate-scan">
            <animateTransform attributeName="transform" type="translate" from="0 -200" to="0 200" dur="8s" repeatCount="indefinite" />
        </rect>

        {/* Dotted Lat/Long */}
        {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map(lat => {
          const yOrth = 100 - 98 * Math.sin((lat * Math.PI) / 180);
          const rx = 98 * Math.cos((lat * Math.PI) / 180);
          return (
            <ellipse key={`lat-${lat}`} cx="100" cy={yOrth} rx={rx} ry={rx * 0.15} stroke="#94A3B8" strokeWidth="0.3" strokeDasharray="1 6" fill="none" />
          );
        })}
        {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map(lon => {
          const rx = 98 * Math.sin((lon * Math.PI) / 180);
          return (
            <ellipse key={`lon-${lon}`} cx="100" cy="100" rx={rx} ry={98} stroke="#94A3B8" strokeWidth="0.3" strokeDasharray="1 6" fill="none" />
          );
        })}

        {/* Neural Network Style Bounding Boxes */}
        <g>
          {[
            { x: 35, y: 55, label: "Dso" },
            { x: 150, y: 138, label: "Axx" },
            { x: 90, y: 160, label: "Cso" },
            { x: 135, y: 65, label: "Dso" }
          ].map((d, i) => (
            <g key={i} className="opacity-60">
              <circle cx={d.x + 9} cy={d.y + 7} r="1.5" fill="#10B981" />
              <rect x={d.x} y={d.y} width="18" height="14" fill="rgba(16,185,129,0.05)" stroke="#10B981" strokeWidth="0.8" rx="1" />
              <text x={d.x} y={d.y - 2} fill="#10B981" fontSize="3" fontWeight="black" className="font-mono uppercase tracking-tighter">{d.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>

    <style jsx>{`
      @keyframes parabolic-trajectory {
        0% { transform: translate(-40vw, 40vh) scale(0.5); opacity: 0; }
        20% { opacity: 0.1; }
        50% { transform: translate(0, -10vh) scale(1.2); opacity: 0.25; }
        80% { opacity: 0.1; }
        100% { transform: translate(40vw, 40vh) scale(0.5); opacity: 0; }
      }
      @media (max-width: 768px) {
        @keyframes parabolic-trajectory {
          0% { transform: translate(-20vw, 30vh) scale(0.4); opacity: 0; }
          50% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
          100% { transform: translate(20vw, 30vh) scale(0.4); opacity: 0; }
        }
      }
      .animate-parabolic {
        animation: parabolic-trajectory 25s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth entrance scroll
    const timer = setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-200 scroll-smooth">
      <Head>
        <title>Inicio | Plataforma de Investigación Solar</title>
      </Head>
      
      {/* Hero Section - Sober & Academic */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <SolarBackgroundDecor />
        <OrthographicSolarDisk />
        
        <div className="relative z-10 w-full flex flex-col items-center text-center max-w-4xl space-y-6 md:space-y-8">
          <div className="flex justify-center w-full mb-2">
             <BrandLogo size={72} className="scale-100 md:scale-125 transition-transform duration-1000" />
          </div>
          
          <div className="inline-block px-3 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
             Portal de Investigación Solar
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[1.1] px-4 md:px-0">
              Plataforma de Clasificación <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-emerald-600">
                y Análisis de Actividad Solar.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xs md:text-lg text-slate-500 font-medium leading-relaxed opacity-90 px-6 md:px-0">
              Sistema de <span className="text-slate-950 font-bold border-b-2 border-emerald-500/30">visión por computadora</span> para el monitoreo y registro automático de la fotósfera solar.
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link 
              href="/observatory" 
              className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] group"
            >
              Acceder al Observatorio
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Functionality Sections - Sober Cards */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Módulos de Análisis</h2>
             <p className="text-sm text-slate-500 font-medium">Arquitectura modular diseñada para la detección, clasificación y registro histórico de la actividad fotosférica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            <Link href="/observatory" className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/30">
              <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <Telescope strokeWidth={1.5} className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3">Observatorio de Fotósfera</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                Inferencia local mediante <span className="text-slate-900 font-semibold">YOLOv26 nano</span> y clasificación jerárquica mediante <span className="text-slate-900 font-semibold">ConvNextV2 atto</span>.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] pt-4 border-t border-slate-100">
                <Camera className="h-3 w-3" />
                Detección Asistida
              </div>
            </Link>

            <Link href="/trends" className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/30">
              <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <TrendingUp strokeWidth={1.5} className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3">Análisis de Tendencias</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                Visualización de métricas solares, índices de actividad y evolución temporal de regiones activas mediante registros históricos.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] pt-4 border-t border-slate-100">
                <Activity className="h-3 w-3" />
                Métricas de Actividad
              </div>
            </Link>

            <Link href="/records" className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/30">
              <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <ClipboardList strokeWidth={1.5} className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 mb-3">Base de Datos Histórica</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                Repositorio centralizado de observaciones validadas, exportación de informes PDF técnicos y gestión de metadatos de nivel profesional.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] pt-4 border-t border-slate-100">
                <ShieldCheck className="h-3 w-3" />
                Registros Certificados
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Thesis Section - Academic Tone */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-start">
             {/* Profile Card - Minimalist */}
             <div className="shrink-0 w-full md:w-40">
                <div className="w-40 h-40 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src="/carlos_benitez.png" alt="Carlos Benítez" className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 space-y-1">
                   <h3 className="text-lg font-bold text-slate-900">Carlos Benítez</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                     Tesis de Grado <br />
                     Ingeniería Mecatrónica
                   </p>
                </div>
             </div>

             {/* Project Info */}
             <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Título del Proyecto</span>
                  <p className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed tracking-tight">
                    "Desarrollo de un Prototipo de Procesamiento Local para la Detección, Clasificación y Análisis Predictivo de Manchas Solares mediante Visión Computacional e Inteligencia Artificial"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Tutores</p>
                      <ul className="space-y-3">
                        {[
                          { name: "Juan C. Cabral", inst: "FP-UNA" },
                          { name: "Diego Stalder", inst: "FIUNA" },
                          { name: "José M. Gómez", inst: "FP-UNA" },
                          { name: "Christian E. Schaerer", inst: "FP-UNA" },
                          { name: "Jesús Núñez", inst: "FIUNA" }
                        ].map((t, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs font-bold text-slate-700">
                             <span>{t.name}</span>
                             <span className="text-[9px] text-slate-300 font-medium">{t.inst}</span>
                          </li>
                        ))}
                      </ul>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Institución</p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 tracking-tight">Facultad de Ingeniería (FIUNA)</p>
                        <p className="text-xs font-bold text-slate-800 tracking-tight">Facultad Politécnica (FP-UNA)</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">Universidad Nacional de Asunción</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <BrandLogo size={32} />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             © 2026 Facultad de Ingeniería - UNA
           </p>
        </div>
      </footer>
    </div>
  );
}
