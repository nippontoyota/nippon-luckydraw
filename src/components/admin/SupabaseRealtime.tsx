"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We only initialize it if the keys are present to prevent crashes in environments without them
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function SupabaseRealtime() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase Realtime not initialized: Missing credentials.");
      return;
    }

    // Subscribe to all changes on the 'entries' table
    const entriesSubscription = supabase
      .channel("realtime-entries")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, (payload) => {
        console.log("Realtime event received for entries:", payload);
        router.refresh();
      })
      .subscribe();

    // Subscribe to all changes on the 'branches' table
    const branchesSubscription = supabase
      .channel("realtime-branches")
      .on("postgres_changes", { event: "*", schema: "public", table: "branches" }, (payload) => {
        console.log("Realtime event received for branches:", payload);
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(entriesSubscription);
      supabase.removeChannel(branchesSubscription);
    };
  }, [router]);

  return null; // This is a headless component that just manages websocket subscriptions
}
