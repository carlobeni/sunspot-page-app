"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, KeyRound, Globe, ArrowLeft, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";

export default function RecoverPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecover = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Detail */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle,_rgba(16,185,129,0.02)_0%,_transparent_70%)] animate-pulse duration-[8000ms]" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-200 rounded-full opacity-40" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm relative z-10">
        <div className="flex flex-col items-center">
          <BrandLogo size={48} className="mb-6" />
          <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
            Recuperación de Acceso
          </h2>
          <p className="mt-3 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Investigación y Análisis Solar
          </p>
        </div>

        {!isSent ? (
          <form className="mt-10 space-y-6" onSubmit={handleRecover}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Institucional</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                  placeholder="usuario@institucion.edu"
                  disabled={isLoading || isPending}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 border border-slate-100 rounded-xl">
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold flex items-start gap-3">
                 <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                 Se enviarán instrucciones de restablecimiento al correo institucional asociado para restaurar el acceso.
               </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-slate-900 px-4 py-3.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Enviar Instrucciones
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-8 py-4">
             <div className="bg-emerald-50 p-8 border border-emerald-100 rounded-2xl">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest leading-relaxed">
                  Instrucciones enviadas. Verifique su bandeja de entrada institucional.
                </p>
             </div>
             <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-black text-slate-900 hover:text-slate-700 transition-colors uppercase tracking-widest"
             >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio de Sesión
             </Link>
          </div>
        )}

        {!isSent && (
          <div className="text-center pt-8 border-t border-slate-50">
             <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider">
               Recordé mis credenciales
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
