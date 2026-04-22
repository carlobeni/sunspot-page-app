"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, KeyRound, Globe, ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";

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
      redirectTo: `${window.location.origin}/settings`,
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
      {/* Decorative Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-slate-200/50 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02),0_1px_8px_rgb(0,0,0,0.01)] border border-slate-100/50 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform hover:scale-105 duration-300">
            <KeyRound className="h-7 w-7 text-indigo-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Recuperar
          </h2>
          <p className="mt-2.5 text-center text-sm font-medium text-slate-600">
            Restablezca sus credenciales de acceso
          </p>
        </div>

        {!isSent ? (
          <form className="mt-10 space-y-6" onSubmit={handleRecover}>
            {error && (
            <div className="bg-red-100 border border-red-300 text-black px-4 py-3 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-400">
              {error}
            </div>
          )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Correo Electrónico</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm transition-all shadow-sm font-medium"
                  placeholder="usuario@fiuna.edu.py"
                  disabled={isLoading || isPending}
                />
              </div>
            </div>

            <div className="bg-indigo-100 p-5 border border-indigo-300 rounded-2xl shadow-sm">
               <p className="text-xs text-black leading-relaxed font-bold">
                 Se enviará una clave de cifrado temporal al correo institucional asociado para restaurar el acceso.
               </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-2.5 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 transition-all shadow-md hover:shadow-xl active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5" />
                    Aceptar
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 py-4">
             <div className="bg-emerald-50 p-8 border border-emerald-100 rounded-2xl shadow-sm">
                <p className="text-sm text-emerald-800 font-bold">
                  Instrucciones enviadas. Verifique su bandeja de entrada.
                </p>
             </div>
             <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-800 hover:text-indigo-950 transition-colors"
             >
                <ArrowLeft className="h-4 w-4" />
                Volver al Login
             </Link>
          </div>
        )}

        {!isSent && (
          <div className="text-center pt-8 border-t border-slate-100">
             <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-800 transition-colors">
               Recordé mis credenciales
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
