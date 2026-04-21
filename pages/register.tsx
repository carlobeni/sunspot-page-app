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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute bottom-0 left-0 p-32 opacity-[0.05] -rotate-12 -translate-x-32 translate-y-32 pointer-events-none">
        <Globe className="h-[40rem] w-[40rem] text-indigo-900" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 shadow-sm rounded-lg flex items-center justify-center mb-6">
            <UserPlus className="h-6 w-6 text-indigo-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Registro
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Solicitud de acceso al nodo central
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 outline-none text-sm transition-colors shadow-sm font-medium"
                placeholder="Carlos Benítez"
                disabled={isLoading || isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico Institucional</label>
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

          <div className="bg-amber-50 p-4 border border-amber-200 rounded-md shadow-sm">
             <p className="text-xs text-amber-800 leading-relaxed font-medium">
               Nota: Todas las solicitudes de registro deben ser validadas por el administrador del sistema antes de autorizar el acceso a la telemetría.
             </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isPending}
              className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus-visible:outline-none disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {(isLoading || isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-6 border-t border-slate-200">
             <span className="text-sm font-semibold text-slate-500">¿Ya tienes cuenta?</span>
             <Link href="/login" className="ml-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
               Iniciar sesión
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
