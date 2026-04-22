"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Users, Network, Save, Server, Loader2, KeyRound, Pencil, Trash2, X, Shield, Cpu, Activity } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type User = {
  id: number;
  name: string;
  email: string;
  role: "Administrador" | "Visualizador";
  lastLogin: string;
};

const initialUsers: User[] = [
  { id: 1, name: "Carlos Benítez", email: "carlosbenitez@fiuna.edu.py", role: "Administrador", lastLogin: "Hace 2 min" },
  { id: 2, name: "Investigador FIUNA", email: "inv01@fiuna.edu.py", role: "Visualizador", lastLogin: "Ayer" },
];

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [modalType, setModalType] = useState<"pass" | "add" | "edit" | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "Visualizador", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUserRole = "Administrador"; 

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const deleteUser = (id: number) => {
    if (activeUserRole !== "Administrador") return;
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const openEditUserModal = (user: User) => {
    if (activeUserRole !== "Administrador") return;
    setSelectedUserId(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role, password: "" });
    setModalType("edit");
  };

  const openPasswordModal = (id: number) => {
    if (activeUserRole !== "Administrador") return;
    setSelectedUserId(id);
    setFormData({ ...formData, password: "" });
    setModalType("pass");
  };

  const openAddUserModal = () => {
    if (activeUserRole !== "Administrador") return;
    setFormData({ name: "", email: "", role: "Visualizador", password: "" });
    setModalType("add");
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (modalType === "add") {
        const newUser: User = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          role: formData.role as "Administrador" | "Visualizador",
          lastLogin: "Nunca",
        };
        setUsers([...users, newUser]);
      } else if (modalType === "edit") {
        setUsers(users.map(u => {
          if (u.id === selectedUserId) {
            return {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role as "Administrador" | "Visualizador",
            };
          }
          return u;
        }));
      }
      setIsSubmitting(false);
      setModalType(null);
    }, 800);
  };

  return (
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-slate-50 text-slate-900">
      {/* Modals Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {modalType === "add" && "Nuevo Usuario"}
                {modalType === "edit" && "Editar Usuario"}
                {modalType === "pass" && "Actualizar Contraseña"}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Nombre</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-slate-800 outline-none text-sm transition-colors shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-slate-800 outline-none text-sm transition-colors shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Rol</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-slate-800 outline-none text-sm transition-colors shadow-sm"
                    >
                      <option value="Visualizador">Visualizador</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </>
              )}

              {(modalType === "add" || modalType === "pass") && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">Contraseña</label>
                  <input 
                    required 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-slate-900 focus:border-slate-800 outline-none text-sm transition-colors shadow-sm" 
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-200 mt-6">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-all rounded-md disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-slate-800" />
            Configuración
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base font-medium max-w-xl hidden md:block">
            Gestión de conectividad y acceso al sistema.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-all w-full md:w-auto shadow-sm"
        >
          {isSaving ? <div className="h-4 w-4 border-2 border-slate-200 border-t-white rounded-sm animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
          {[
            { id: "general", name: "Red", icon: Network },
            { id: "accounts", name: "Usuarios", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-slate-100 text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4", activeTab === tab.id ? "text-slate-800" : "text-slate-400")} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Network Section */}
            {activeTab === "general" && (
               <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <Cpu className="h-6 w-6 text-slate-800" />
                  <h2 className="text-lg font-bold text-slate-900">Red Inalámbrica (Hotspot)</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Red RPi-5 (LAN interna)</h3>
                        <p className="text-xs text-slate-500 mt-1">Red emitida por el dispositivo principal.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600">Nombre (SSID)</label>
                        <input type="text" defaultValue="Sunspot_LAN_01" disabled={activeUserRole !== "Administrador"} className="block w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-900 font-mono focus:border-slate-800 outline-none transition-colors shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600">Contraseña</label>
                        <input type="password" defaultValue="admin123" disabled={activeUserRole !== "Administrador"} className="block w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-sm text-slate-900 focus:border-slate-800 outline-none transition-colors shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Red Externa (WLAN Uplink)</h3>
                        <p className="text-xs text-slate-500 mt-1">Conexión a internet para sincronización con Supabase.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        Redes Disponibles
                        <div className="h-3 w-3 border-2 border-slate-200 border-t-slate-500 rounded-sm animate-spin" />
                      </h4>
                      <div className="border border-slate-200 shadow-sm rounded-md divide-y divide-slate-100 bg-white overflow-hidden">
                        {[
                          { ssid: "FIUNA_Lab", signal: "Excelente", security: "WPA2", connected: true },
                          { ssid: "FIUNA_Alumnos", signal: "Buena", security: "Abierta", connected: false },
                          { ssid: "Sunspot_Research", signal: "Regular", security: "WPA3", connected: false },
                        ].map((net, i) => (
                          <div key={i} className={cn("p-4 flex items-center justify-between", net.connected ? "bg-slate-100" : "hover:bg-slate-50")}>
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-bold", net.connected ? "text-slate-900" : "text-slate-700")}>
                                {net.ssid}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                                <span>Señal: {net.signal}</span>
                                <span className="opacity-50">•</span>
                                <span>{net.security}</span>
                              </span>
                            </div>
                            {net.connected ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                                Conectado
                              </span>
                            ) : (
                              <button 
                                disabled={activeUserRole !== "Administrador"}
                                className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-1.5 rounded hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                              >
                                Conectar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
               </div>
            )}

            {/* Access Section Noir */}
            {activeTab === "accounts" && (
              <div className="animate-in fade-in duration-500 bg-white">
                <div className="p-6 lg:p-10 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Perfiles de Acceso</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Gestión de usuarios y niveles de permiso.</p>
                  </div>
                  {activeUserRole === "Administrador" && (
                    <button 
                      onClick={openAddUserModal}
                      className="text-sm font-semibold bg-white border border-slate-200 shadow-sm hover:border-slate-800 hover:text-slate-900 text-slate-700 px-4 py-2 rounded-md transition-colors"
                    >
                      Añadir Usuario
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4 hidden sm:table-cell">Último Acceso</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center font-bold text-slate-800">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                <div className="text-xs font-medium text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold border shadow-sm",
                              user.role === "Administrador" 
                                ? "bg-slate-100 text-slate-900 border-slate-200" 
                                : "bg-white text-slate-600 border-slate-200"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell text-sm font-medium text-slate-500">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {activeUserRole === "Administrador" && (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => openEditUserModal(user)}
                                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                  title="Editar info"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => openPasswordModal(user.id)}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Cambiar contraseña"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
