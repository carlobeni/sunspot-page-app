import Link from "next/link";
import { 
  Telescope, 
  TrendingUp, 
  ClipboardList, 
  ChevronRight, 
  Info, 
  ArrowRight, 
  Camera, 
  Activity, 
  ShieldCheck,
} from "lucide-react";
import Head from "next/head";

/* --- Minimalist Orthographic Solar Disk --- */
/* --- Minimalist Orthographic Solar Disk --- */
const OrthographicSolarDisk = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    <div className="relative w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-[0.12]">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="solarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <circle cx="100" cy="100" r="98" fill="url(#solarGlow)" stroke="#E2E8F0" strokeWidth="0.5" />
        
        {/* Dotted Lat/Long - Technical Guidance */}
        {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map(lat => {
          const yOrth = 100 - 98 * Math.sin((lat * Math.PI) / 180);
          const rx = 98 * Math.cos((lat * Math.PI) / 180);
          return (
            <ellipse key={`lat-${lat}`} cx="100" cy={yOrth} rx={rx} ry={rx * 0.15} stroke="#94A3B8" strokeWidth="0.4" strokeDasharray="1 4" fill="none" />
          );
        })}
        {[-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map(lon => {
          const rx = 98 * Math.sin((lon * Math.PI) / 180);
          return (
            <ellipse key={`lon-${lon}`} cx="100" cy="100" rx={rx} ry={98} stroke="#94A3B8" strokeWidth="0.4" strokeDasharray="1 4" fill="none" />
          );
        })}

        {/* Bounding Boxes - Automatic Assisted Detection */}
        <g>
          {[
            { x: 35, y: 55, label: "Dso" },
            { x: 150, y: 138, label: "Axx" },
            { x: 90, y: 160, label: "Cso" },
            { x: 135, y: 65, label: "Dso" }
          ].map((d, i) => (
            <g key={i} className="opacity-80">
              <circle cx={d.x + 5} cy={d.y + 5} r="2" fill="#1E293B" opacity="0.5" />
              <rect x={d.x} y={d.y} width="18" height="14" fill="none" stroke="#10B981" strokeWidth="1" rx="1" />
              <text x={d.x} y={d.y - 2} fill="#10B981" fontSize="3.5" fontWeight="bold" className="font-mono uppercase tracking-tighter">{d.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-200">
      <Head>
        <title>Inicio | Plataforma de Investigación Solar</title>
      </Head>
      {/* Hero Section - Sober & Academic */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <OrthographicSolarDisk />
        
        <div className="relative z-10 text-center max-w-4xl space-y-10">
          <div className="inline-block px-3 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
             Portal de Investigación Solar
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Plataforma de Clasificación <br /> y Análisis de Actividad Solar.
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Sistema integral para la <span className="text-slate-900">clasificación, registro y análisis</span> automático asistido mediante arquitecturas de Deep Learning.
            </p>
          </div>

          <div className="pt-6 flex justify-center gap-6">
            <Link 
              href="/observatory" 
              className="px-8 py-3 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              Acceder al Observatorio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Functionality Sections - Sober Cards */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            
            <Link href="/observatory" className="group space-y-6">
              <div className="h-10 w-10 text-slate-800">
                <Telescope strokeWidth={1.5} className="h-full w-full" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Observatorio</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Detección automática asistida por <span className="text-slate-900 font-semibold">YOLO26n</span> y <span className="text-slate-900 font-semibold">ConvNextV2</span> sobre disco solar completo.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-3 border-t border-slate-200">
                <Camera className="h-3 w-3" />
                Monitoreo Solar
              </div>
            </Link>

            <Link href="/trends" className="group space-y-6">
              <div className="h-10 w-10 text-slate-800">
                <TrendingUp strokeWidth={1.5} className="h-full w-full" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Tendencia</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Análisis histórico y prospectivo de ciclos solares basado en registros de la NOAA y misiones SDO.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-3 border-t border-slate-200">
                <Activity className="h-3 w-3" />
                Predicción de Ciclos
              </div>
            </Link>

            <Link href="/records" className="group space-y-6">
              <div className="h-10 w-10 text-slate-800">
                <ClipboardList strokeWidth={1.5} className="h-full w-full" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Registros</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Gestión centralizada de auditorías, registro de eventos y exportación de informes técnicos en formato PDF.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-3 border-t border-slate-200">
                <ShieldCheck className="h-3 w-3" />
                Archivo Histórico
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Thesis Section - Academic Tone */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-16">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Proyecto de Tesis de Grado</div>
            <h2 className="text-2xl font-bold text-slate-900 leading-relaxed max-w-2xl mx-auto">
              Implementación de Modelos de Aprendizaje Profundo para el Análisis de la Fotósfera Solar.
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm md:text-base font-semibold text-slate-800">
                Carlos Benítez, Juan C. Cabral, Diego Stalder, <br className="hidden md:block" />
                José M. Gómez, Christian E. Schaerer, Jesús Núñez
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {/* Institutional mentions removed for redundancy */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-50 text-center border-t border-slate-200">
        <p className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.8em]">
           Solar Digital System
        </p>
      </footer>
    </div>
  );
}
