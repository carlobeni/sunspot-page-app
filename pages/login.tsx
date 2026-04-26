"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, ShieldCheck, Globe, Telescope } from "lucide-react";
import { useState, useTransition } from "react";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { checkModelsCached, downloadModelsWithProgress, ModelLoadProgress } from "@/lib/model-loader";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model loading states
  const [isPreparingModels, setIsPreparingModels] = useState(false);
  const [modelProgress, setModelProgress] = useState<ModelLoadProgress | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("LoginPage: Intentando login tradicional...");
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LoginPage: Error de login:", error.message);
      setError(error.message);
      setIsLoading(false);
      return;
    }

    console.log("LoginPage: Login exitoso, verificando modelos...");
    
    // Check if models need to be downloaded
    try {
      const cached = await checkModelsCached();
      if (!cached) {
        setIsPreparingModels(true);
        await downloadModelsWithProgress((progress) => {
          setModelProgress(progress);
        });
      }
    } catch (err) {
      console.error("Error al preparar modelos:", err);
      // We continue anyway, they will be loaded on demand if fail
    }

    startTransition(() => {
      router.push("/");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Head>
        <title>Acceso | Plataforma de Investigación Solar</title>
      </Head>

      {/* Subtle Background Detail */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle,_rgba(16,185,129,0.02)_0%,_transparent_70%)] animate-pulse duration-[8000ms]" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-200 rounded-full opacity-40" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-200 rounded-full opacity-30" />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm relative z-10">
        <div className="flex flex-col items-center">
          <BrandLogo size={48} className="mb-6" />
          <h2 className="text-center text-xl font-bold text-slate-900 tracking-tight">
            Acceso a la Plataforma
          </h2>
          <p className="mt-2 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Investigación y Análisis Solar
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                  placeholder="usuario@institucion.edu"
                  disabled={isLoading || isPending}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                  placeholder="••••••••"
                  disabled={isLoading || isPending}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
                  disabled={isLoading || isPending}
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors">
                  Recordarme
                </label>
              </div>

              <div className="text-xs">
                <Link href="/recover" className="font-bold text-slate-700 hover:text-slate-900 transition-colors">
                  Recuperar Contraseña
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isPending}
              className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-slate-900 px-4 py-3.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
            >
              {(isLoading || isPending) ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-500 border-t-white rounded-sm animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar
                </>
              )}
            </button>
          </form>



          <div className="text-center pt-8 border-t border-slate-50">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿No tienes cuenta?</span>
             <Link href="/register" className="ml-2 text-xs font-black text-slate-900 hover:text-slate-700 transition-colors border-b border-slate-900/20">
               Registrarse
             </Link>
          </div>
        </div>
      </div>

      {/* Model Preparation Overlay */}
      {isPreparingModels && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div 
                className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin" 
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Telescope className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Preparando Herramientas de Análisis</h3>
              <p className="text-slate-400 text-sm font-medium">
                Descargando modelos de inteligencia artificial para el procesamiento de imágenes solares.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${modelProgress?.overallProgress || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-400">{modelProgress?.modelName || "Iniciando..."}</span>
                <span className="text-white">{Math.round(modelProgress?.overallProgress || 0)}%</span>
              </div>

              <div className="pt-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">
                  Esta operación se realiza solo una vez y optimiza significativamente el rendimiento de la clasificación.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
