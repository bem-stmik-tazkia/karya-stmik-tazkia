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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-border bg-red-500 text-white font-black text-xs hover:-translate-y-0.5 shadow-[2px_2px_0px_#991b1b] hover:bg-red-600 transition-all uppercase disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        {isLoading ? "Keluar..." : "Keluar Akun"}
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
