"use client";

import Link from "next/link";
import { View, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

export default function RecoverPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular el envío del correo electrónico con un retraso de red
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm bg-slate-50 transition-shadow"
                  placeholder="ejemplo@fiuna.edu.py"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 shadow-sm transition-all disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                {isSubmitting ? "Enviando..." : "Enviar Enlace Seguro"}
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
              Se ha enviado un correo a <span className="font-bold">{email}</span>. Verifica tu bandeja de entrada en los próximos minutos.
            </p>
            
            <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 text-center">
              <p className="text-xs text-slate-500 mb-2 italic">Solo visible en entorno de prueba:</p>
              <button 
                onClick={() => {
                  alert(`Redirigiendo a pantalla de reseteo para ${email} (Funcionalidad Mock)`);
                }}
                className="inline-flex items-center justify-center rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Simular enlace recibido en correo
              </button>
            </div>

            <Link 
              href="/login" 
              className="mt-6 inline-flex w-full justify-center rounded-lg bg-red-50 border border-red-100 px-3 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
