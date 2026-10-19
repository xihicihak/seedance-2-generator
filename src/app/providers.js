"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import config from "@/lib/config";
import { LanguageProvider } from "@/context/LanguageContext";

import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = config?.theme || "slate-indigo";
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  return (
    <SessionProvider>
      <LanguageProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              border: "1px solid #27272a",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}
