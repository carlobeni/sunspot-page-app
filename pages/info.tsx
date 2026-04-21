import Image from "next/image";
import { Info, Server, Building2, Handshake, Cpu, Activity, ShieldCheck } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="p-4 pt-20 lg:p-8 max-w-screen-2xl mx-auto min-h-screen bg-slate-50 text-slate-900 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
             <Info className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
             Información
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base font-medium max-w-xl hidden md:block">
            Arquitectura de hardware, afiliaciones académicas y protocolos de desarrollo.
          </p>
        </div>
        <div className="hidden md:block">
           <span className="px-3 py-1 bg-white text-slate-600 rounded-md text-xs font-semibold border border-slate-200 shadow-sm">
             Documentation v4.6
           </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* System Specifications Section */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-10 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
             <Cpu className="h-24 w-24 text-slate-900" />
          </div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-8">
             <Server className="h-6 w-6 text-indigo-600" />
             <h2 className="text-lg font-bold text-slate-900">Especificaciones Técnicas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm">
               <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Computación</h3>
               <p className="text-sm text-slate-900 font-mono font-medium">Raspberry Pi 5 / 8GB</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm">
               <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Inferencia AI</h3>
               <p className="text-sm text-slate-900 font-mono font-medium">ONNX Runtime</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm">
               <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Build Target</h3>
               <p className="text-sm text-slate-900 font-mono font-medium">v4.6 Production</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm">
               <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Arquitectura</h3>
               <p className="text-sm text-slate-900 font-mono font-medium">Carlos Benítez - FIUNA</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Institutions Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-10 flex flex-col items-center">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-8 self-stretch">
               <Building2 className="h-6 w-6 text-indigo-600" />
               <h2 className="text-lg font-bold text-slate-900">Filiación</h2>
            </div>
            <div className="flex items-center justify-center gap-8 w-full p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="relative h-20 w-32 grayscale hover:grayscale-0 contrast-125 transition-all duration-700">
                <Image 
                  src="/logos/fiuna.png" 
                  alt="Logo FIUNA" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="w-px h-12 bg-slate-300" />
              <div className="relative h-20 w-32 grayscale hover:grayscale-0 contrast-125 transition-all duration-700">
                <Image 
                  src="/logos/fpuna.jpg" 
                  alt="Logo FPUNA" 
                  fill 
                  className="object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-10 flex flex-col items-center">
             <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-8 self-stretch">
               <ShieldCheck className="h-6 w-6 text-emerald-600" />
               <h2 className="text-lg font-bold text-slate-900">Patrocinios</h2>
             </div>
             <div className="flex items-center justify-center gap-8 w-full p-6 bg-slate-50 border border-slate-200 rounded-lg">
               <div className="relative h-20 w-32 grayscale hover:grayscale-0 contrast-125 opacity-70 hover:opacity-100 transition-all duration-700">
                  <Image 
                    src="/logos/becas.png" 
                    alt="Logo Becas" 
                    fill 
                    className="object-contain"
                  />
               </div>
               <div className="w-px h-12 bg-slate-300" />
               <div className="relative h-20 w-32 grayscale hover:grayscale-0 contrast-125 opacity-70 hover:opacity-100 transition-all duration-700">
                  <Image 
                    src="/logos/pubiabm.jpg" 
                    alt="Logo PUBIABM" 
                    fill 
                    className="object-contain mix-blend-multiply"
                  />
               </div>
             </div>
          </section>
        </div>
      </div>
      
      {/* Footer License */}
      <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-slate-600 gap-4">
        <span>© 2026 Solar Predictive Portal</span>
        <div className="flex gap-6">
           <span className="text-slate-500">FIUNA</span>
           <span className="text-slate-500">FPUNA</span>
           <span className="text-slate-500">ITAIPU</span>
        </div>
      </div>
    </div>
  );
}
