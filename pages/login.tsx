"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2 } from "lucide-react";
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
        router.push("/camera");
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          <View className="h-10 w-10 text-red-600 mb-6" strokeWidth={1.5} />
          <h2 className="text-center text-3xl font-serif font-bold tracking-tight text-slate-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 italic">
            Panel de Administración Sunspot
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email Institucional</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue="carlosbenitez@fiuna.edu.py"
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm bg-slate-50 transition-shadow"
                placeholder="ejemplo@fiuna.edu.py"
                disabled={isLoading || isPending}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue="password123"
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm bg-slate-50 transition-shadow"
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
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                disabled={isLoading || isPending}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link href="/recover" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isPending}
              className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {(isLoading || isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>
          <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
              Solicitar acceso
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
