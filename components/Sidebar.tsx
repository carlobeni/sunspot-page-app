"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Telescope, LineChart, Activity, Settings, View, Menu, X, LogOut, Info, Calendar } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Observatorio", href: "/observatory", icon: Telescope },
  { name: "Tendencia", href: "/trends", icon: LineChart },
  { name: "Registros", href: "/records", icon: Calendar },
  { name: "Ajustes", href: "/settings", icon: Settings },
  { name: "Información", href: "/info", icon: Info },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = router.pathname;
  const [isOpen, setIsOpen] = useState(false);

  if (['/login', '/register', '/recover'].includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <View className="h-6 w-6 text-slate-200" />
          <span className="text-lg font-serif font-black text-white tracking-widest uppercase">Sunspot Panel</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400 hover:text-white">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0f172a] text-slate-400 border-r border-slate-800 transform transition-transform duration-300 lg:transform-none pt-16 lg:pt-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="hidden lg:flex items-center gap-3 p-8 border-b border-slate-800">
          <View className="h-8 w-8 text-white" />
          <span className="text-xl font-serif font-black text-white tracking-widest uppercase">Sunspot Panel</span>
        </div>
        
        <nav className="flex-1 space-y-0 p-0 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/camera");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center px-8 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 border-l-4 rounded-xl mx-2 my-1",
                  isActive
                    ? "bg-slate-800/50 text-white border-white"
                    : "text-slate-500 hover:bg-slate-800/20 hover:text-slate-200 border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "mr-4 h-4 w-4 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-300"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/30 p-4 mb-4 border border-slate-800 rounded-xl mx-2">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 flex-shrink-0">
              <span className="text-xs font-black text-white font-serif">CB</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-white truncate uppercase tracking-tighter">Carlos Benítez</span>
              <span className="text-[9px] text-slate-500 truncate italic">carlosbenitez@fiuna.edu.py</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-transparent border border-slate-700 hover:text-white hover:border-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
