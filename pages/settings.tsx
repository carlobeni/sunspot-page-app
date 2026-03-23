"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Users, Network, Save, Server, Loader2, KeyRound, Pencil, Trash2, X } from "lucide-react";
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

  // The logged-in user simulation
  const activeUserRole = "Administrador"; // Given by requirements

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
      } else if (modalType === "pass") {
        // Mock password update
        console.log(`Password for user ${selectedUserId} updated to ${formData.password}`);
      }
      
      setIsSubmitting(false);
      setModalType(null);
    }, 800);
  };

  return (
    <div className="p-5 pt-24 lg:p-10 max-w-7xl mx-auto">
      {/* Modals Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                {modalType === "add" && "Registrar Nueva Cuenta"}
                {modalType === "edit" && "Editar Usuario"}
                {modalType === "pass" && "Modificar Contraseña"}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-red-600 outline-none sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-red-600 outline-none sm:text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rol de Usuario</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-red-600 outline-none sm:text-sm"
                    >
                      <option value="Visualizador">Visualizador (Lectura)</option>
                      <option value="Administrador">Administrador (Total)</option>
                    </select>
                  </div>
                </>
              )}

              {(modalType === "add" || modalType === "pass") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {modalType === "add" ? "Contraseña Inicial" : "Nueva Contraseña"}
                  </label>
                  <input 
                    required 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-red-600 outline-none sm:text-sm" 
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors rounded-lg border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors rounded-lg disabled:opacity-70 min-w-[140px]"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Ajustes del Sistema</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-light italic">
            Configuración de conectividad y gestión de accesos.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-sm w-full md:w-auto"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0 space-y-1 bg-white p-2 rounded-2xl border border-slate-200 h-fit shadow-sm">
          {[
            { id: "general", name: "Conectividad", icon: Network },
            { id: "accounts", name: "Gestión de Cuentas", icon: Users },
            { id: "system", name: "Información del Sistema", icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-red-50 text-red-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-5 w-5", activeTab === tab.id ? "text-red-600" : "text-slate-400")} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Conectividad */}
            {activeTab === "general" && (
               <div className="p-8 space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Network className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-serif font-bold text-slate-900">Configuración de Conectividad</h2>
                </div>
                
                <div className="space-y-8">
                  <p className="text-sm font-light text-slate-500 italic mb-4">
                    Se empleant dos interfaces: un Hotspot interno para conexión LAN directa, y una antena externa para conectarse a una red WLAN. Ambos pueden operar simultáneamente.
                  </p>

                  {/* Hotspot LAN */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Punto de Acceso LAN (Internal Hotspot)</h3>
                        <p className="text-sm text-slate-500 mt-1">Crea una red local para administrar el dispositivo directamente desde tu celular o PC.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 disabled:opacity-50"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre (SSID)</label>
                        <input type="text" defaultValue="Sunspot_LAN_01" disabled={activeUserRole !== "Administrador"} className="block w-full rounded-lg border-slate-300 py-2 px-3 text-slate-900 focus:ring-red-600 sm:text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
                        <input type="password" defaultValue="admin123" disabled={activeUserRole !== "Administrador"} className="block w-full rounded-lg border-slate-300 py-2 px-3 text-slate-900 focus:ring-red-600 sm:text-sm bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Red WLAN Externa */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Conexión a Red WLAN (Antena Externa)</h3>
                        <p className="text-sm text-slate-500 mt-1">Conecta el dispositivo a internet oa una red institucional para enviar datos.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 disabled:opacity-50"></div>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        Redes Disponibles detectadas
                        <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                      </h4>
                      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                        {[
                          { ssid: "FIUNA_Lab", signal: "Excelente", security: "WPA2", connected: true },
                          { ssid: "FIUNA_Alumnos", signal: "Buena", security: "Abierta", connected: false },
                          { ssid: "Sunspot_Research", signal: "Media", security: "WPA2/WPA3", connected: false },
                        ].map((net, i) => (
                          <div key={i} className={cn("p-4 flex items-center justify-between transition-colors", net.connected ? "bg-red-50" : "hover:bg-slate-50")}>
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-bold", net.connected ? "text-red-700" : "text-slate-900")}>
                                {net.ssid}
                              </span>
                              <span className="text-xs text-slate-500 flex gap-2">
                                <span>Señal: {net.signal}</span>
                                <span>•</span>
                                <span>{net.security}</span>
                              </span>
                            </div>
                            {net.connected ? (
                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded border border-green-200">
                                Conectado
                              </span>
                            ) : (
                              <button 
                                disabled={activeUserRole !== "Administrador"}
                                className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-red-600 transition-colors disabled:opacity-50"
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

            {/* Accesos */}
            {activeTab === "accounts" && (
              <div className="p-0 animate-in fade-in duration-300">
                <div className="p-8 pb-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Users className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-serif font-bold text-slate-900">Cuentas y Permisos</h2>
                  </div>
                  <p className="text-sm font-light text-slate-500 mt-2 italic">Solo los administradores pueden modificar los permisos.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th>
                        <th scope="col" className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                        <th scope="col" className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Última Sesión</th>
                        <th scope="col" className="px-8 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="whitespace-nowrap px-8 py-5">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
                                <span className="text-sm font-bold text-red-700 font-serif">{user.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                <div className="text-sm text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-8 py-5">
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border",
                              user.role === "Administrador" 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-8 py-5 text-sm text-slate-500">
                            {user.lastLogin}
                          </td>
                          <td className="whitespace-nowrap px-8 py-5 text-right text-sm font-medium">
                            {activeUserRole === "Administrador" && (
                              <div className="flex justify-end gap-3">
                                <button 
                                  onClick={() => openEditUserModal(user)}
                                  className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded transition-colors"
                                  title="Editar Usuario"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => openPasswordModal(user.id)}
                                  className="text-amber-600 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded transition-colors"
                                  title="Modificar Contraseña"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 flex items-center gap-1 bg-red-50 px-2 py-1 rounded transition-colors"
                                  title="Eliminar Cuenta"
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
                  
                  {activeUserRole === "Administrador" && (
                    <div className="p-6 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={openAddUserModal}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                      >
                        + Registrar nueva cuenta manual
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sistema */}
            {activeTab === "system" && (
               <div className="p-8 space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <Server className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-serif font-bold text-slate-900">Información del Sistema</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Arquitectura</h3>
                      <p className="mt-1 text-sm text-slate-500 font-mono">Raspberry Pi 5 / 8GB RAM</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Modelos AI</h3>
                      <p className="mt-1 text-sm text-slate-500 font-mono">ONNX Runtime (GPU/NPU Accel)</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Versión del Panel</h3>
                      <p className="mt-1 text-sm text-slate-500 font-mono">v1.0.0-beta</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Desarrollo</h3>
                      <p className="mt-1 text-sm text-slate-500 italic">Facultad de Ingeniería (FIUNA)</p>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
