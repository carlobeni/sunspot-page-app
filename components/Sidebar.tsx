"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Telescope, LineChart, Activity, Settings, View, Menu, X, LogOut, Info, Calendar, Home } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Observatorio", href: "/observatory", icon: Telescope },
  { name: "Tendencia", href: "/trends", icon: LineChart },
  { name: "Registros", href: "/records", icon: Calendar },
  { name: "Ajustes", href: "/settings", icon: Settings },
  { name: "Información", href: "/info", icon: Info },
];

import { AuthProvider, useAuth } from "@/lib/AuthContext";

export function Sidebar() {
  const router = useRouter();
  const { user, signOut, isGuest } = useAuth();
  const pathname = router.pathname;
  const [isOpen, setIsOpen] = useState(false);

  // Filter nav items for guest
  const filteredNavItems = navItems.filter(item => {
    if (isGuest && item.href === "/settings") return false;
    return true;
  });

  if (['/login', '/register', '/recover'].includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
  };

  const userEmail = isGuest ? "invitado@solar-digital.org" : (user?.email || "usuario@fiuna.edu.py");
  const userName = isGuest ? "Invitado" : (user?.user_metadata?.full_name || userEmail.split('@')[0]);
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo removed */}
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-500 hover:text-slate-800">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-white text-slate-600 border-r border-slate-200 transform transition-transform duration-300 lg:transform-none pt-16 lg:pt-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="hidden lg:flex items-center gap-3 p-8">
          {/* Logo removed */}
        </div>
        
        <nav className="flex-1 space-y-1 p-0 py-6">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/camera");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg mx-3 my-1",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center gap-3 bg-slate-50 p-4 mb-4 rounded-lg mx-2 border border-slate-100 relative overflow-hidden">
            {isGuest && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-lg">
                    Invitado
                </div>
            )}
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-slate-200 flex-shrink-0 shadow-sm">
              <span className="text-sm font-bold text-slate-900">{userInitials}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate capitalize">{userName}</span>
              <span className="text-xs text-slate-500 truncate">{userEmail}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:text-red-700 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
