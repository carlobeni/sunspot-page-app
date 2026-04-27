"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
      router.push("/login");
    }, 3000);
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
            Nueva Contraseña
          </h2>
          <p className="mt-3 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Investigación y Análisis Solar
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="bg-emerald-50 p-8 border border-emerald-100 rounded-2xl">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest leading-relaxed">
                ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-900 hover:text-slate-700 transition-colors uppercase tracking-widest"
            >
              Ir al Inicio de Sesión
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form className="mt-10 space-y-8" onSubmit={handleReset}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            {userEmail && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Restableciendo para:</span>
                <span className="text-sm font-bold text-slate-700">{userEmail}</span>
                {/* Hidden username field for password managers to avoid mixing with other accounts */}
                <input type="text" name="username" value={userEmail} readOnly hidden autoComplete="username" />
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nueva Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirmar Contraseña</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 border border-slate-100 rounded-xl">
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold flex items-start gap-3">
                 <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                 Para asegurar su cuenta, utilice una combinación de letras, números y caracteres especiales.
               </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-slate-900 px-4 py-3.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Actualizar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
