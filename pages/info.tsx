import { Info, Server, Building2, Cpu, ShieldCheck } from "lucide-react";
import Head from "next/head";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function InfoPage() {
  return (
    <div className="p-4 pt-20 lg:p-12 max-w-screen-xl mx-auto min-h-screen bg-slate-50 text-slate-900">
      <Head>
        <title>Información | Plataforma de Investigación Solar</title>
      </Head>
      {/* Header */}
      <div className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
             <Info className="h-7 w-7 md:h-9 md:w-9 text-slate-800" />
             Información del Proyecto
          </h1>
          <p className="text-slate-500 mt-3 text-sm md:text-base font-medium max-w-xl">
            Especificaciones técnicas, arquitectura de hardware y marcos institucionales de desarrollo.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* System Specifications Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
             <Cpu className="h-32 w-32 text-slate-900" />
          </div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-10">
             <Server className="h-6 w-6 text-slate-800" />
             <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest text-xs">Especificaciones Técnicas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Computación</h3>
               <p className="text-sm text-slate-900 font-bold">Raspberry Pi 5 / 8GB</p>
            </div>
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inferencia AI</h3>
               <p className="text-sm text-slate-900 font-bold">ONNX Runtime</p>
            </div>
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Build Target</h3>
               <p className="text-sm text-slate-900 font-bold">v1.0 Production</p>
            </div>
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Arquitectura</h3>
               <p className="text-sm text-slate-900 font-bold">Yolo26 Nano + ConvNextV2 Atto</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50">
             <a 
               href="https://github.com/carlobeni/sunspot-page-app" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-900 font-bold border border-slate-200 hover:bg-slate-100 transition-all"
             >
               <GithubIcon className="h-5 w-5" />
               Repositorio en GitHub
             </a>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Institutions Section */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-10">
               <Building2 className="h-6 w-6 text-slate-800" />
               <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest text-xs">Instituciones Académicas</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 w-full p-8 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-24 w-32 flex items-center justify-center">
                <img 
                  src="/logos/fiuna.png" 
                  alt="Logo FIUNA" 
                  className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="hidden sm:block w-px h-16 bg-slate-200" />
              <div className="h-24 w-32 flex items-center justify-center">
                <img 
                  src="/logos/fpuna.jpg" 
                  alt="Logo FPUNA" 
                  className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-12">
             <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-10">
               <ShieldCheck className="h-6 w-6 text-slate-800" />
               <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest text-xs">Con el Apoyo de</h2>
             </div>
             <div className="flex flex-wrap items-center justify-center gap-12 w-full p-8 bg-slate-50 rounded-xl border border-slate-100">
               <div className="h-20 w-32 flex items-center justify-center">
                  <img 
                    src="/logos/becas.png" 
                    alt="Logo Becas" 
                    className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                  />
               </div>
               <div className="hidden sm:block w-px h-16 bg-slate-200" />
               <div className="h-20 w-32 flex items-center justify-center">
                  <img 
                    src="/logos/pubiabm.jpg" 
                    alt="Logo PUBIABM" 
                    className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                  />
               </div>
             </div>
          </section>
        </div>
      </div>
      
      {/* Clean Footer */}
      <div className="mt-24 pt-12 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.8em]">
           Solar Digital System
        </p>
      </div>
    </div>
  );
}
