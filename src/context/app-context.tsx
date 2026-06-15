"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface AppContextType {
  activeJDId: string | null;
  setActiveJDId: (id: string | null) => void;
  jobDescriptions: { id: string; title: string; created_at: string }[];
  refreshJDs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeJDId, setActiveJDId] = useState<string | null>(null);
  const [jobDescriptions, setJobDescriptions] = useState<{ id: string; title: string; created_at: string }[]>([]);

  const refreshJDs = async () => {
    try {
      const jds = await api.listJobDescriptions();
      setJobDescriptions(jds);
      if (!activeJDId && jds.length > 0) {
        setActiveJDId(jds[0].id);
      }
    } catch {
      /* backend may not be running */
    }
  };

  useEffect(() => {
    refreshJDs();
  }, []);

  return (
    <AppContext.Provider value={{ activeJDId, setActiveJDId, jobDescriptions, refreshJDs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
