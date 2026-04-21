import Image from "next/image";
import { Info, Server, Building2, Handshake, Cpu, Activity, ShieldCheck } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-[#020617] text-slate-200 animate-in fade-in duration-700">
      {/* Header Noir */}
      <div className="mb-16 border-b border-slate-800 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-4xl font-serif font-black text-white tracking-widest uppercase flex items-center gap-8">
            <Info className="h-12 w-12 text-slate-600" />
            Información
          </h1>
          <p className="text-slate-500 mt-6 text-xl font-light italic border-l-2 border-slate-800 pl-8 tracking-tight">
            Arquitectura de hardware, <span className="text-white font-black underline underline-offset-8">instituciones académicas</span> y protocolos de desarrollo.
          </p>
        </div>
        <div className="hidden lg:block">
           <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.8em]">Documentation v4.6</span>
        </div>
      </div>

      <div className="space-y-16">
        {/* System Specifications Section Noir */}
        <section className="bg-slate-900 rounded-2xl border border-slate-800 p-12 shadow-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Cpu className="h-40 w-40" />
          </div>
          <div className="flex items-center gap-4 pb-8 border-b border-slate-800 mb-10">
            <Server className="h-8 w-8 text-white opacity-40" />
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.3em]">Especificaciones Técnicas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-black p-8 rounded-xl border border-slate-800 transition-all hover:bg-white/5">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Computación</h3>
              <p className="text-xs text-white font-mono font-black italic">Raspberry Pi 5 // 8GB LPDDR4</p>
            </div>
            <div className="bg-black p-8 rounded-xl border border-slate-800 transition-all hover:bg-white/5">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Inferencia AI</h3>
              <p className="text-xs text-white font-mono font-black italic">ONNX Runtime Accelerated</p>
            </div>
            <div className="bg-black p-8 rounded-xl border border-slate-800 transition-all hover:bg-white/5">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Build Target</h3>
              <p className="text-xs text-white font-mono font-black italic">v4.6 Production Stable</p>
            </div>
            <div className="bg-black p-8 rounded-xl border border-slate-800 transition-all hover:bg-white/5">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Lead Architecture</h3>
              <p className="text-xs text-white font-mono font-black uppercase tracking-tighter">Carlos Benítez // FIUNA</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Institutions Section Noir */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-12 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-4 pb-8 mb-12 self-stretch border-b border-slate-800">
              <Building2 className="h-8 w-8 text-white opacity-40" />
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.3em]">Filiación</h2>
            </div>
            <div className="flex items-center justify-center gap-12 w-full p-8 bg-black/40 border border-slate-800 shadow-inner">
              <div className="relative h-28 w-40 grayscale hover:grayscale-0 contrast-125 transition-all duration-700">
                <Image 
                  src="/logos/fiuna.png" 
                  alt="Logo FIUNA" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="w-px h-16 bg-slate-800" />
              <div className="relative h-28 w-40 grayscale hover:grayscale-0 contrast-125 transition-all duration-700">
                <Image 
                  src="/logos/fpuna.jpg" 
                  alt="Logo FPUNA" 
                  fill 
                  className="object-contain mix-blend-screen"
                />
              </div>
            </div>
          </section>

          {/* Support Section Noir */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-12 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-4 pb-8 mb-12 self-stretch border-b border-slate-800">
              <ShieldCheck className="h-8 w-8 text-white opacity-40" />
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.3em]">Patrocinios</h2>
            </div>
            <div className="flex items-center justify-center gap-12 w-full p-8 bg-black/40 border border-slate-800 shadow-inner">
              <div className="relative h-28 w-40 grayscale hover:grayscale-0 contrast-125 opacity-60 hover:opacity-100 transition-all duration-700">
                <Image 
                  src="/logos/becas.png" 
                  alt="Logo Becas" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="w-px h-16 bg-slate-800" />
              <div className="relative h-28 w-40 grayscale hover:grayscale-0 contrast-125 opacity-60 hover:opacity-100 transition-all duration-700">
                <Image 
                  src="/logos/pubiabm.jpg" 
                  alt="Logo PUBIABM" 
                  fill 
                  className="object-contain mix-blend-screen"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Footer License */}
      <div className="mt-24 pt-10 border-t border-slate-800 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
        <span>© 2026 Solar Predictive Portal</span>
        <div className="flex gap-10">
          <span className="text-white opacity-20">FIUNA</span>
          <span className="text-white opacity-20">FPUNA</span>
          <span className="text-white opacity-20">ITAIPU</span>
        </div>
      </div>
    </div>
  );
}
