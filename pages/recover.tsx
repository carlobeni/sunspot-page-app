"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, KeyRound, Globe, ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";

export default function RecoverPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Noir Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.01]">
        <KeyRound className="h-[60rem] w-[60rem] text-white" />
      </div>

      <div className="max-w-md w-full space-y-12 bg-slate-900 p-12 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-black border border-slate-800 flex items-center justify-center mb-8">
            <KeyRound className="h-8 w-8 text-white" strokeWidth={1} />
          </div>
          <h2 className="text-center text-3xl font-serif font-black tracking-widest text-white uppercase">
            Recuperar
          </h2>
          <p className="mt-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-relaxed">
            Restablecer Protocolo de Seguridad
          </p>
        </div>

        {!isSent ? (
          <form className="mt-10 space-y-8" onSubmit={handleRecover}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Network ID / Email</label>
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
                 Se enviará una clave de cifrado temporal al correo institucional asociado para restaurar el acceso al nodo.
               </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-4 rounded-xl bg-white px-6 py-5 text-[10px] font-black uppercase tracking-[0.5em] text-black hover:bg-slate-200 focus-visible:outline-none shadow-2xl disabled:opacity-30 transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando Registro...
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5" />
                    Enviar Instrucciones
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-10 animate-in zoom-in-95 duration-500">
             <div className="bg-white/10 p-10 border border-white/20">
                <p className="text-xs text-white font-black uppercase tracking-widest leading-loose">
                  Instrucciones enviadas. Verifique su bandeja de entrada institucional.
                </p>
             </div>
             <Link 
                href="/login"
                className="inline-flex items-center gap-3 text-[10px] font-black text-white hover:underline uppercase tracking-widest transition-all"
             >
                <ArrowLeft className="h-4 w-4" />
                Regresar al Login
             </Link>
          </div>
        )}

        {!isSent && (
          <div className="text-center pt-8 border-t border-slate-800">
             <Link href="/login" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">
               Recordé mis credenciales
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
