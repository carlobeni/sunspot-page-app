"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, UserPlus, Globe } from "lucide-react";
import { useState, useTransition } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      startTransition(() => {
        router.push("/login");
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Noir Background Element */}
      <div className="absolute bottom-0 left-0 p-32 opacity-[0.02] -rotate-12 -translate-x-32 translate-y-32">
        <Globe className="h-[40rem] w-[40rem] text-white" />
      </div>

      <div className="max-w-md w-full space-y-12 bg-slate-900 p-12 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-black border border-slate-800 flex items-center justify-center mb-8">
            <UserPlus className="h-8 w-8 text-white" strokeWidth={1} />
          </div>
          <h2 className="text-center text-3xl font-serif font-black tracking-widest text-white uppercase">
            Registro
          </h2>
          <p className="mt-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-relaxed">
            Solicitud de Acceso al Nodo Central
          </p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleRegister}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs transition-all"
                placeholder="CARLOS BENITEZ"
                disabled={isLoading || isPending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email-address" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Academic Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs transition-all"
                placeholder="USER@FIUNA.EDU.PY"
                disabled={isLoading || isPending}
              />
            </div>
          </div>

          <div className="bg-black/60 p-6 border border-slate-800">
             <p className="text-[9px] text-slate-600 font-light italic leading-loose uppercase tracking-tighter">
               Nota: Todas las solicitudes de registro deben ser validadas por el administrador del sistema antes de autorizar el acceso a la telemetría.
             </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || isPending}
              className="group relative flex w-full justify-center items-center gap-4 rounded-xl bg-white px-6 py-5 text-[10px] font-black uppercase tracking-[0.5em] text-black hover:bg-slate-200 focus-visible:outline-none shadow-2xl disabled:opacity-30 transition-all active:scale-95"
            >
              {(isLoading || isPending) ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando Nodo...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-8 border-t border-slate-800">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ya registrado //</span>
             <Link href="/login" className="ml-3 text-[9px] font-black text-white hover:underline uppercase tracking-widest">
               Volver al Login
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
