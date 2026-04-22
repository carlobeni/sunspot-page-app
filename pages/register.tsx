"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, UserPlus, Globe, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { ACADEMIC_DEGREES, COUNTRIES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const name = formData.get("name") as string;
    const age = formData.get("age") as string;
    const degree = formData.get("degree") as string;
    const university = formData.get("university") as string;
    const country = formData.get("country") as string;
    const phone = formData.get("phone") as string;

    // Validation: Passwords must match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    // Validation: Minimum password length (optional but recommended)
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setIsLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          age: parseInt(age),
          academic_degree: degree,
          university: university,
          country: country,
          phone: phone,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-slate-200/50 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-2xl w-full space-y-8 bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02),0_1px_8px_rgb(0,0,0,0.01)] border border-slate-100/50 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform hover:scale-105 duration-300">
            <UserPlus className="h-7 w-7 text-slate-800" strokeWidth={1.5} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Crear Cuenta
          </h2>
          <p className="mt-2.5 text-center text-sm font-medium text-slate-600">
            Únete al Portal de Inteligencia Sunspot
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500 py-8">
            <div className="bg-emerald-50 p-8 border border-emerald-100 rounded-2xl shadow-sm">
              <p className="text-sm text-emerald-800 font-bold leading-relaxed">
                ¡Registro completado! Verifica tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-slate-900 transition-colors"
            >
              Ir al Login
            </Link>
          </div>
        ) : (
          <form className="mt-12 space-y-12" onSubmit={handleRegister}>
            {error && (
            <div className="bg-red-100 border border-red-300 text-black px-4 py-3 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-400">
              {error}
            </div>
          )}
            
            <div className="space-y-10">
              {/* Personal Information Group */}
              <div className="space-y-6">
                <div className="relative">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1 mb-2">Información Personal</h3>
                  <div className="h-px bg-slate-100 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                  <div className="space-y-2.5 md:col-span-2">
                    <label htmlFor="name" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Nombre Completo</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="Juan Pérez"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="age" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Edad</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="25"
                      disabled={isLoading || isPending}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Teléfono</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="+595 9xx..."
                      disabled={isLoading || isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Group */}
              <div className="space-y-6">
                <div className="relative">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1 mb-2">Información Académica</h3>
                  <div className="h-px bg-slate-100 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                  <div className="space-y-2.5 md:col-span-2">
                    <label htmlFor="university" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Universidad</label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="Universidad Nacional de Asunción"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="degree" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Grado</label>
                    <select
                      id="degree"
                      name="degree"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium cursor-pointer"
                      disabled={isLoading || isPending}
                    >
                      <option value="" disabled selected>Seleccionar...</option>
                      {ACADEMIC_DEGREES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label htmlFor="country" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">País</label>
                    <select
                      id="country"
                      name="country"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium cursor-pointer"
                      disabled={isLoading || isPending}
                    >
                      <option value="" disabled selected>Seleccionar...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Credentials Group */}
              <div className="space-y-6">
                <div className="relative">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-1 mb-2">Credenciales</h3>
                  <div className="h-px bg-slate-100 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                  <div className="space-y-2.5 md:col-span-2">
                    <label htmlFor="email-address" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Email</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="usuario@fiuna.edu.py"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Contraseña</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="••••••••"
                      disabled={isLoading || isPending}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-600 uppercase tracking-widest pl-1">Confirmar</label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 outline-none text-sm transition-all shadow-sm font-medium"
                      placeholder="••••••••"
                      disabled={isLoading || isPending}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-5 border border-slate-200 rounded-2xl shadow-sm mt-4">
               <p className="text-xs text-black leading-relaxed font-bold flex items-start gap-2">
                 <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                 Nota: Todas las solicitudes de registro deben ser validadas por el sistema mediante confirmación de correo electrónico.
               </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-2.5 rounded-xl bg-slate-800 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-900 focus:ring-4 focus:ring-slate-800/20 disabled:opacity-50 transition-all shadow-md hover:shadow-xl active:scale-[0.98]"
              >
                {(isLoading || isPending) ? (
                  <>
                    <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Aceptar
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-8 border-t border-slate-100">
               <span className="text-sm font-medium text-slate-700">¿Ya tienes cuenta?</span>
               <Link href="/login" className="ml-2 text-sm font-bold text-slate-800 hover:text-slate-900 transition-colors border-b border-slate-800/30 hover:border-slate-800">
                 Iniciar sesión
               </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
