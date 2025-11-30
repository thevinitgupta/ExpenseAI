"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useApiKeySetup() {
  const router = useRouter();
  const { status } = useSession();

  const saveApiKey = useCallback(async (apiKey: string) => {
    if (!apiKey.trim()) throw new Error("API key is required");

    // Send raw key to backend (server encrypts)
    const res = await fetch("/api/user/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save API key");
    }

    // Save ONLY a flag locally
    localStorage.setItem("gemini_configured", "true");
  }, []);

  const skipValidation = useCallback(async (apiKey: string) => {
    await saveApiKey(apiKey); // same backend logic
  }, [saveApiKey]);

  const isConfigured = useCallback(async () => {
    if (typeof window === "undefined") return false;
  
    // 1. Check local storage flag
    if (localStorage.getItem("gemini_configured") === "true") return true;
  
    // 2. Ask backend if the user has an API key
    const res = await fetch("/api/user/apikey", {
      method: "GET",
    });
  
    if (!res.ok) return false;
  
    const data = await res.json();
    if (data.exists === true) {
      localStorage.setItem("gemini_configured", "true");
      return true;
    }
  
    return false;
  }, []);
    
  const removeLocalConfig = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.setItem("gemini_configured","false");
  }, []);

  const requireConfiguredOrRedirect = useCallback(() => {
    if (typeof window === "undefined") return;

    const configured = localStorage.getItem("gemini_configured");
    if (!configured) {
      router.push("/setup");
    }
  }, [router]);

  return {
    saveApiKey,
    skipValidation,
    isConfigured,
    requireConfiguredOrRedirect,
    removeLocalConfig
  };
}
