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
    <div className="p-5 pt-24 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-[#020617] text-slate-200">
      {/* Modals Overlay Noir */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-black">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">
                {modalType === "add" && "NUEVO REGISTRO / ACCESS"}
                {modalType === "edit" && "EDITAR PERFIL / CONFIG"}
                {modalType === "pass" && "SINC SECURITY / CRYPTO"}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-8 space-y-6">
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Label Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs uppercase tracking-tighter" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Network ID / Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs uppercase tracking-widest"
                    >
                      <option value="Visualizador">Visualizador (Standard)</option>
                      <option value="Administrador">Administrador (Root)</option>
                    </select>
                  </div>
                </>
              )}

              {(modalType === "add" || modalType === "pass") && (
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Password Key</label>
                  <input 
                    required 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="block w-full rounded-xl border border-slate-800 bg-black py-4 px-4 text-white focus:border-white outline-none text-xs" 
                  />
                </div>
              )}

              <div className="pt-6 flex gap-4 justify-end border-t border-slate-800 mt-4">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="px-6 py-3 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-3 px-8 py-3 text-[10px] font-black text-black bg-white hover:bg-slate-200 transition-all rounded-xl disabled:opacity-50 uppercase tracking-[0.2em]"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {isSubmitting ? "Sincronizando..." : "Cometer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Noir */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-800 pb-12">
        <div>
          <h1 className="text-4xl font-serif font-black text-white tracking-widest uppercase flex items-center gap-8">
            <SettingsIcon className="h-12 w-12 text-slate-600" />
            Control
          </h1>
          <p className="text-slate-500 mt-6 text-xl font-light italic border-l-2 border-slate-800 pl-8 tracking-tight">
            Gestión de arquitecturas de red y <span className="text-white font-black underline underline-offset-8">permisos binarios</span>.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-4 px-10 py-5 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.05)] w-full md:w-auto active:scale-95"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isSaving ? "SYNCING..." : "COMMIT GLOBAL CHANGES"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar Noir */}
        <div className="lg:w-80 flex-shrink-0 space-y-px bg-slate-900 border border-slate-800 rounded-2xl h-fit shadow-2xl overflow-hidden p-1">
          {[
            { id: "general", name: "Network Layer", icon: Network },
            { id: "accounts", name: "Security Protocols", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-8 py-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id
                    ? "bg-slate-800 text-white border-l-4 border-white"
                    : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-200 border-l-4 border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-slate-600")} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area Noir */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Network Section Noir */}
            {activeTab === "general" && (
               <div className="p-10 lg:p-16 space-y-12 animate-in fade-in duration-700">
                <div className="flex items-center gap-4 pb-8 border-b border-slate-800">
                  <Cpu className="h-8 w-8 text-white opacity-40" />
                  <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.3em]">Conectividad</h2>
                </div>
                
                <div className="space-y-12">
                  <p className="text-xs font-light text-slate-500 italic max-w-3xl leading-relaxed uppercase tracking-tighter">
                    Administración de interfaces duales: Internal Hotspot (LAN) y External Uplink (WLAN). Sincronización continua de hardware Raspberry Pi 5.
                  </p>

                  <div className="bg-black border border-slate-800 rounded-xl p-10 relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                        <Network className="h-32 w-32" />
                    </div>
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Internal Hotspot [LAN_01]</h3>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tight italic font-medium">Puerta de enlace administrativa para control remoto directo.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-12 h-6 bg-slate-800 rounded-xl peer peer-checked:after:bg-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-600 after:rounded-xl after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 border border-slate-700 peer-checked:bg-white/10 peer-checked:border-white"></div>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800">
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">SSID IDENTIFIER</label>
                        <input type="text" defaultValue="Sunspot_LAN_01" disabled={activeUserRole !== "Administrador"} className="block w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 text-xs text-white font-mono uppercase focus:border-white outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">ENCRYPTION KEY</label>
                        <input type="password" defaultValue="admin123" disabled={activeUserRole !== "Administrador"} className="block w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 text-xs text-white outline-none focus:border-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black border border-slate-800 rounded-xl p-10 shadow-2xl">
                    <div className="flex items-start justify-between mb-10">
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">External WLAN Uplink</h3>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tight italic font-medium">Sincronización con infraestructuras de red institucionales.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked 
                          disabled={activeUserRole !== "Administrador"}
                        />
                        <div className="w-12 h-6 bg-slate-800 rounded-xl peer peer-checked:after:bg-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-600 after:rounded-xl after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 border border-slate-700 peer-checked:bg-white/10 peer-checked:border-white"></div>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-[9px] font-black text-slate-500 mb-6 flex items-center gap-3 uppercase tracking-widest">
                        RF Signal Scan
                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                      </h4>
                      <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
                        {[
                          { ssid: "FIUNA_Lab", signal: "Excelent", security: "WPA2", connected: true },
                          { ssid: "FIUNA_Alumnos", signal: "Strong", security: "Open", connected: false },
                          { ssid: "Sunspot_Research", signal: "Moderate", security: "WPA3", connected: false },
                        ].map((net, i) => (
                          <div key={i} className={cn("p-6 flex items-center justify-between transition-all", net.connected ? "bg-white/5" : "hover:bg-slate-800/40")}>
                            <div className="flex flex-col">
                              <span className={cn("text-xs font-black uppercase tracking-widest", net.connected ? "text-white" : "text-slate-500")}>
                                {net.ssid}
                              </span>
                              <span className="text-[9px] text-slate-600 mt-1 flex gap-3 uppercase font-black tracking-tighter">
                                <span>Signal: {net.signal}</span>
                                <span className="opacity-30">//</span>
                                <span>{net.security}</span>
                              </span>
                            </div>
                            {net.connected ? (
                              <span className="text-[9px] font-black text-white bg-slate-800 px-4 py-2 border border-white/20 uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                Active Link
                              </span>
                            ) : (
                              <button 
                                disabled={activeUserRole !== "Administrador"}
                                className="text-[9px] font-black text-slate-600 bg-black border border-slate-800 px-6 py-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest disabled:opacity-20"
                              >
                                Connect
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
              <div className="p-0 animate-in fade-in duration-700">
                <div className="p-10 lg:p-16 pb-8">
                  <div className="flex items-center gap-4 pb-8 border-b border-slate-800">
                    <Users className="h-8 w-8 text-white opacity-40" />
                    <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.3em]">Permisos</h2>
                  </div>
                  <p className="text-[10px] font-black text-slate-600 mt-6 uppercase tracking-widest italic">Root access required for credential modification.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-black">
                      <tr>
                        <th scope="col" className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Identity Identifier</th>
                        <th scope="col" className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Access Rank</th>
                        <th scope="col" className="px-10 py-6 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Last Sync</th>
                        <th scope="col" className="px-10 py-6 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Action Keys</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-black/40 transition-all">
                          <td className="whitespace-nowrap px-10 py-8">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-black border border-slate-800 flex items-center justify-center">
                                <span className="text-xs font-black text-white font-serif tracking-widest">{user.name.charAt(0)}</span>
                              </div>
                              <div className="ml-6">
                                <div className="text-xs font-black text-white uppercase tracking-widest">{user.name}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-10 py-8">
                            <span className={cn(
                              "inline-flex items-center rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest border",
                              user.role === "Administrador" 
                                ? "bg-white text-black border-white" 
                                : "bg-black text-slate-500 border-slate-800"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-10 py-8 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                            {user.lastLogin}
                          </td>
                          <td className="whitespace-nowrap px-10 py-8 text-right font-medium">
                            {activeUserRole === "Administrador" && (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => openEditUserModal(user)}
                                  className="text-slate-100 hover:bg-white hover:text-black p-3 border border-slate-800 transition-all rounded-xl"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => openPasswordModal(user.id)}
                                  className="text-slate-100 hover:bg-white hover:text-black p-3 border border-slate-800 transition-all rounded-xl"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.id)}
                                  className="text-slate-500 hover:bg-white hover:text-black p-3 border border-slate-800 transition-all rounded-xl"
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
                    <div className="p-10 border-t border-slate-800 flex justify-end">
                      <button 
                        onClick={openAddUserModal}
                        className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.4em] transition-all flex items-center gap-3 border border-dashed border-slate-800 px-8 py-4 hover:border-white"
                      >
                        + ADD NEW CREDENTIAL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
