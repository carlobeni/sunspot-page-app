"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { View, Loader2, UserPlus, Globe, ShieldCheck } from "lucide-react";
import { useState, useTransition, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ACADEMIC_DEGREES } from "@/lib/constants";
import { BrandLogo } from "@/components/BrandLogo";
import { COUNTRY_LIST } from "@/lib/country-data";

function CustomCountrySelect({
  options,
  value,
  onChange,
  renderOption,
  renderValue,
  disabled,
  className
}: {
  options: typeof COUNTRY_LIST;
  value: string;
  onChange: (val: string) => void;
  renderOption: (opt: typeof COUNTRY_LIST[0]) => React.ReactNode;
  renderValue: (opt: typeof COUNTRY_LIST[0]) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.code === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 py-3 px-3 text-slate-900 focus:border-slate-800 outline-none text-sm font-medium transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1 pointer-events-none mr-1 min-w-0">
          {renderValue(selectedOption)}
        </div>
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-max max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
          {options.map((opt) => (
            <div
              key={opt.code}
              className={`relative cursor-pointer select-none py-2 px-3 hover:bg-slate-100 ${
                value === opt.code ? "bg-slate-50 font-bold text-slate-900" : "text-slate-700"
              }`}
              onClick={() => {
                onChange(opt.code);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">{renderOption(opt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState("py");
  const [selectedCountry, setSelectedCountry] = useState("py");
  const [phoneNumber, setPhoneNumber] = useState("");

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    const parts = [];
    for (let i = 0; i < digits.length; i += 3) {
      parts.push(digits.slice(i, i + 3));
    }
    return parts.join("-");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

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
    const phoneCountryCode = formData.get("phoneCountryCode") as string;
    const phoneNum = formData.get("phone") as string;
    const phone = `${phoneCountryCode} ${phoneNum}`;

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      setIsLoading(false);
      return;
    }

    // Validation: Age cannot be negative
    if (parseInt(age) < 0) {
      setError("La edad no puede ser un valor negativo.");
      setIsLoading(false);
      return;
    }

    // Validation: Phone format
    const phoneRegex = /^[0-9\s\-]{6,15}$/;
    if (!phoneRegex.test(phoneNum)) {
      setError("Por favor, ingrese un número de teléfono válido (mínimo 6 dígitos).");
      setIsLoading(false);
      return;
    }

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

  return (    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Detail */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,_rgba(16,185,129,0.02)_0%,_transparent_70%)] animate-pulse duration-[8000ms]" />
         <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-slate-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] border border-slate-200 rounded-full opacity-20 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm relative z-10">
        <div className="flex flex-col items-center">
          <BrandLogo size={48} className="mb-6" />
          <h2 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
            Crear Nueva Cuenta
          </h2>
          <p className="mt-3 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Investigación y Análisis Solar
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6 py-8">
            <div className="bg-emerald-50 p-8 border border-emerald-100 rounded-2xl">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest leading-relaxed">
                ¡Registro completado! Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión.
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-900 hover:text-slate-700 transition-colors uppercase tracking-widest"
            >
              Ir al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <form className="mt-12 space-y-12" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            
            <div className="space-y-12">
              {/* Personal Information Group */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Información Personal</h3>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="Ej. Carlos Benítez"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Edad</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      required
                      min="0"
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="25"
                      disabled={isLoading || isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Teléfono</label>
                    <div className="flex gap-2 relative">
                      <input type="hidden" name="phoneCountryCode" value={COUNTRY_LIST.find(c => c.code === phoneCountry)?.dialCode || "+595"} />
                      <CustomCountrySelect
                        className="w-[110px]"
                        options={COUNTRY_LIST}
                        value={phoneCountry}
                        onChange={setPhoneCountry}
                        disabled={isLoading || isPending}
                        renderOption={(opt) => (
                          <>
                            <img src={`https://flagcdn.com/w20/${opt.code}.png`} alt={opt.name} className="w-5 h-auto rounded-[2px]" />
                            <span className="font-medium text-xs">{opt.code.toUpperCase()} ({opt.dialCode})</span>
                          </>
                        )}
                        renderValue={(opt) => (
                          <>
                            <img src={`https://flagcdn.com/w20/${opt.code}.png`} alt={opt.name} className="w-5 h-auto rounded-[2px]" />
                            <span className="font-medium text-xs">{opt.dialCode}</span>
                          </>
                        )}
                      />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className="flex-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                        placeholder="9XX-XXX-XXX"
                        disabled={isLoading || isPending}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information Group */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Ámbito Académico</h3>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="university" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Institución</label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="Ej: Universidad Nacional de Asunción"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="degree" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Grado Académico</label>
                    <select
                      id="degree"
                      name="degree"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:border-slate-800 outline-none text-sm transition-all font-medium cursor-pointer appearance-none"
                      disabled={isLoading || isPending}
                    >
                      <option value="" disabled selected>Seleccionar...</option>
                      {ACADEMIC_DEGREES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">País</label>
                    <input type="hidden" name="country" value={COUNTRY_LIST.find(c => c.code === selectedCountry)?.name || "Paraguay"} />
                    <CustomCountrySelect
                      className="w-full"
                      options={COUNTRY_LIST}
                      value={selectedCountry}
                      onChange={setSelectedCountry}
                      disabled={isLoading || isPending}
                      renderOption={(opt) => (
                        <>
                          <img src={`https://flagcdn.com/w20/${opt.code}.png`} alt={opt.name} className="w-5 h-auto rounded-[2px]" />
                          <span className="font-medium text-sm">{opt.name}</span>
                        </>
                      )}
                      renderValue={(opt) => (
                        <>
                          <img src={`https://flagcdn.com/w20/${opt.code}.png`} alt={opt.name} className="w-5 h-auto rounded-[2px]" />
                          <span className="font-medium text-sm">{opt.name}</span>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Account Credentials Group */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Credenciales de Acceso</h3>
                  <div className="h-px bg-slate-100 flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Institucional</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                      title="Por favor, ingrese un correo electrónico válido"
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="usuario@fiuna.edu.py"
                      disabled={isLoading || isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="••••••••"
                      disabled={isLoading || isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirmar</label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:border-slate-800 outline-none text-sm transition-all font-medium"
                      placeholder="••••••••"
                      disabled={isLoading || isPending}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 border border-slate-100 rounded-xl">
               <p className="text-[10px] text-slate-500 leading-relaxed font-bold flex items-start gap-3">
                 <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                 SISTEMA DE SEGURIDAD: Todas las solicitudes de registro son monitoreadas y requieren validación mediante correo electrónico institucional para su activación definitiva.
               </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || isPending}
                className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-slate-900 px-4 py-4 text-xs font-bold text-white uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
              >
                {(isLoading || isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-8 border-t border-slate-50">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Ya tienes cuenta?</span>
               <Link href="/login" className="ml-2 text-xs font-black text-slate-900 hover:text-slate-700 transition-colors border-b border-slate-900/20">
                 Iniciar Sesión
               </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
