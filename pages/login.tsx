"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, ShieldCheck, Globe } from "lucide-react";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      startTransition(() => {
        router.push("/observatory");
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 p-32 opacity-[0.05] rotate-45 translate-x-32 -translate-y-32 pointer-events-none">
        <Globe className="h-[40rem] w-[40rem] text-indigo-900" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center mb-6 shadow-sm">
            <View className="h-6 w-6 text-indigo-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Portal de Inteligencia Sunspot - FIUNA
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue="carlosbenitez@fiuna.edu.py"
                className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 outline-none text-sm transition-colors shadow-sm font-medium"
                placeholder="usuario@fiuna.edu.py"
                disabled={isLoading || isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue="password123"
                className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-indigo-500 outline-none text-sm transition-colors shadow-sm font-medium"
                placeholder="••••••••"
                disabled={isLoading || isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                disabled={isLoading || isPending}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-slate-600">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link href="/recover" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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
                  Conectando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Ingresar al sistema
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-6 border-t border-slate-200">
             <span className="text-sm font-semibold text-slate-500">¿No tienes cuenta?</span>
             <Link href="/register" className="ml-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
               Regístrate
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
