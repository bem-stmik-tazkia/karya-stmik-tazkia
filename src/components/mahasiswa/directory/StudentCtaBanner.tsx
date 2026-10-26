"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export const StudentCtaBanner: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-24">
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#FF8A2B] text-[#0B1F4A] p-8 sm:p-12 md:p-14 shadow-lg shadow-orange-500/15 border border-orange-300/40">
        {/* Subtle Ambient Light */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/20 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-10">
          <div className="max-w-2xl">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] tracking-tight text-[#0B1F4A] mb-2.5 leading-tight">
              Belum ada profilmu di sini?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#0B1F4A]/90 leading-relaxed font-medium max-w-xl">
              Login dan masuk sekarang menggunakan akun kampus STMIK Tazkia untuk menampilkan portofolio dan karyamu.
            </p>
          </div>

          <Link
            href={user ? "/dashboard/profile" : "/login"}
            className="inline-flex items-center justify-center gap-2.5 min-h-[50px] sm:min-h-[54px] px-8 sm:px-10 rounded-full bg-[#0B1F4A] hover:bg-[#071533] text-white font-bold text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0.5 transition-all shadow-md hover:shadow-xl shrink-0 self-start md:self-auto cursor-pointer group"
          >
            <span>{user ? "Lengkapi Profil" : "Masuk Sekarang"}</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

