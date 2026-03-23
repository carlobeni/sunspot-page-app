import Image from "next/image";
import { Info, Server, Building2, Handshake } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="p-5 pt-24 lg:p-10 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-10 border-b border-slate-200 pb-6 flex items-end gap-4">
        <div className="bg-red-100 p-3 rounded-xl border border-red-200">
          <Info className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Información</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-light italic">
            Detalles del sistema, instituciones académicas y entidades de apoyo.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Sistema */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <Server className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-serif font-bold text-slate-900">Información del Sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Arquitectura</h3>
              <p className="text-sm text-slate-600 font-mono">Raspberry Pi 5 / 8GB RAM</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Modelos AI</h3>
              <p className="text-sm text-slate-600 font-mono">ONNX Runtime (NPU)</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Versión</h3>
              <p className="text-sm text-slate-600 font-mono">v1.0.0-beta</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Autor</h3>
              <p className="text-sm text-slate-600 italic">Carlos Benítez (FIUNA)</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Instituciones */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 pb-4 mb-6 self-stretch border-b border-slate-100">
              <Building2 className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-serif font-bold text-slate-900">Instituciones</h2>
            </div>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="relative h-24 w-32 md:h-28 md:w-36 grayscale hover:grayscale-0 transition-all duration-300">
                <Image 
                  src="/logos/fiuna.png" 
                  alt="Logo FIUNA" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="relative h-24 w-32 md:h-28 md:w-36 grayscale hover:grayscale-0 transition-all duration-300">
                <Image 
                  src="/logos/fpuna.jpg" 
                  alt="Logo FPUNA" 
                  fill 
                  className="object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </section>

          {/* Apoyan */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 pb-4 mb-6 self-stretch border-b border-slate-100">
              <Handshake className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-serif font-bold text-slate-900">Apoyan</h2>
            </div>
            <div className="flex items-center justify-center gap-8 w-full">
              <div className="relative h-24 w-32 md:h-28 md:w-36 grayscale hover:grayscale-0 transition-all duration-300">
                <Image 
                  src="/logos/becas.png" 
                  alt="Logo Becas" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="relative h-24 w-32 md:h-28 md:w-36 grayscale hover:grayscale-0 transition-all duration-300">
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
    </div>
  );
}
