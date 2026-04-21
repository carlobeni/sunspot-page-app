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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <KeyRound className="h-[60rem] w-[60rem] text-indigo-900" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 shadow-sm rounded-lg flex items-center justify-center mb-6">
            <KeyRound className="h-6 w-6 text-indigo-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Restablezca sus credenciales de acceso
          </p>
        </div>

        {!isSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleRecover}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 outline-none text-sm transition-colors shadow-sm font-medium"
                  placeholder="usuario@fiuna.edu.py"
                  disabled={isLoading || isPending}
                />
              </div>
            </div>

            <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-md shadow-sm">
               <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                 Se enviará una clave de cifrado temporal al correo institucional asociado para restaurar el acceso.
               </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-none disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
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
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
             <div className="bg-emerald-50 p-6 border border-emerald-200 rounded-md shadow-sm">
                <p className="text-sm text-emerald-800 font-bold">
                  Instrucciones enviadas. Verifique su bandeja de entrada.
                </p>
             </div>
             <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
             >
                <ArrowLeft className="h-4 w-4" />
                Volver al Login
             </Link>
          </div>
        )}

        {!isSent && (
          <div className="text-center pt-6 border-t border-slate-200">
             <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
               Recordé mis credenciales
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
