"use client";

import Link from "next/link";
import { View, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function RecoverPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          <View className="h-10 w-10 text-red-600 mb-6" strokeWidth={1.5} />
          <h2 className="text-center text-3xl font-serif font-bold tracking-tight text-slate-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 italic">
            Las instrucciones te llegarán por correo
          </p>
        </div>
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleRecover}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email Institucional</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm bg-slate-50 transition-shadow"
                  placeholder="ejemplo@fiuna.edu.py"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 shadow-sm transition-all"
              >
                Enviar Enlace Seguro
              </button>
            </div>
            <div className="text-center text-sm text-slate-500 pt-3 border-t border-slate-100">
              <Link href="/login" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
                Volver al panel de acceso
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-center text-sm font-medium text-slate-600">
              Solicitud recibida. Verifica tu bandeja de entrada en los próximos minutos.
            </p>
            <Link 
              href="/login" 
              className="mt-4 inline-flex w-full justify-center rounded-lg bg-red-50 border border-red-100 px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
