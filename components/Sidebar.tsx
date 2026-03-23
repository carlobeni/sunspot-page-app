"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Camera, Database, Activity, Settings, View, Menu, X, LogOut } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Cámara", href: "/camera", icon: Camera },
  { name: "Dataset", href: "/dataset", icon: Database },
  { name: "Tendencias", href: "/trends", icon: Activity },
  { name: "Ajustes", href: "/settings", icon: Settings },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <View className="h-6 w-6 text-red-600" />
          <span className="text-lg font-serif font-bold text-slate-900 tracking-tight">Sunspot Panel</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-500 hover:text-slate-900">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-white text-slate-600 border-r border-slate-200 transform transition-transform duration-300 lg:transform-none pt-16 lg:pt-0 shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-slate-100">
          <View className="h-8 w-8 text-red-600" />
          <span className="text-xl font-serif font-bold text-slate-900 tracking-tight">Sunspot Panel</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/camera");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-red-600" : "text-slate-400 group-hover:text-red-500"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 mb-3 border border-slate-100">
            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center border border-red-200 flex-shrink-0">
              <span className="text-sm font-bold text-red-700 font-serif">CB</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">Carlos Benítez</span>
              <span className="text-[11px] text-slate-500 truncate">carlosbenitez@fiuna.edu.py</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
