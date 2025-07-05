"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.());
    };
  }, [initialize]);

  return children;
}
