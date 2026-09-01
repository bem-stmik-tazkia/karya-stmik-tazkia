"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function RealtimeProjectsListener({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    // Subscribe to realtime changes
    const channel = supabase
      .channel("projects-listener-" + userId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "karya",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (mounted) router.refresh();
        }
      )
      .subscribe();

    // Delay fallback polling to avoid negative timestamp errors on initial mount
    const startDelay = setTimeout(() => {
      if (!mounted) return;
      interval = setInterval(() => {
        if (mounted) router.refresh();
      }, 30000);
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
