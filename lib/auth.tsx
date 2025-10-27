"use client";

import React, { createContext, useState, useEffect, ReactNode, PropsWithChildren } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { User, Role } from "./types";
import { supabase } from "./supabaseClient";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signUp: (
    fullName: string,
    email: string,
    pass: string
  ) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await updateUserProfile(session);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateUserProfile(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateUserProfile = async (session: Session | null) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile.full_name,
          role: profile.role,
          avatarUrl: profile.avatar_url,
        });
      }
    } else {
      setUser(null);
    }
  };

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signUp = async (
    fullName: string,
    email: string,
    pass: string
  ) => {
    // SÉCURITÉ : Toutes les inscriptions publiques sont par défaut avec le rôle 'client'.
    // Les comptes admin et employé doivent être créés via un panneau d'administration.
    const defaultRole: Role = "client";
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          role: defaultRole,
        },
      },
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};