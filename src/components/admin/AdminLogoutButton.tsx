"use client";

import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setShowConfirm(false);
    router.push("/");
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-500 hover:text-white transition-all duration-150 disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>{isLoading ? "Keluar..." : "Keluar"}</span>
      </button>

      <LogoutConfirmModal
        open={showConfirm}
        loading={isLoading}
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
