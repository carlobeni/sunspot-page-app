import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useRouter } from "next/router";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isGuest: false,
  signOut: async () => {},
  signInAsGuest: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check Guest Mode first
      const guestFlag = localStorage.getItem('sunspot_guest_mode');
      if (guestFlag === 'true') {
        setIsGuest(true);
        setUser({ 
          id: 'guest', 
          email: 'invitado@solar-digital.org', 
          user_metadata: { full_name: 'Invitado del Sistema' } 
        } as any);
        setLoading(false);
        return;
      }

      // 2. Check Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If we get a real session, always override guest mode
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsGuest(false);
        localStorage.removeItem('sunspot_guest_mode');
      } else {
        setSession(null);
        // Only clear user if we are NOT currently in guest mode
        const isStillGuest = localStorage.getItem('sunspot_guest_mode') === 'true';
        if (!isStillGuest) {
          setUser(null);
          setIsGuest(false);
        }
      }
      setLoading(false);

      if (_event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    localStorage.removeItem('sunspot_guest_mode');
    setIsGuest(false);
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const signInAsGuest = () => {
    console.log("AuthContext: Iniciando sesión como invitado...");
    try {
      localStorage.setItem('sunspot_guest_mode', 'true');
      setIsGuest(true);
      setUser({ 
          id: 'guest', 
          email: 'invitado@solar-digital.org', 
          user_metadata: { full_name: 'Invitado del Sistema' } 
      } as any);
      setSession(null);
      console.log("AuthContext: Redirigiendo a /observatory...");
      router.push("/observatory");
    } catch (err) {
      console.error("AuthContext: Error en signInAsGuest:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuest, signOut, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
