"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Check, SlidersHorizontal } from "lucide-react";
import { PENGHARGAAN_CATALOG } from "@/data/penghargaanCatalog";
import ShareProfileModal from "@/components/mahasiswa/modals/ShareProfileModal";
import SkinPreviewModal from "@/components/mahasiswa/modals/SkinPreviewModal";
import StudentBadgeDetailModal from "@/components/mahasiswa/profile/StudentBadgeDetailModal";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DashboardProfileHeader,
  type ProfileViewData,
} from "./DashboardProfileHeader";
import { DashboardCollabBanner } from "./DashboardCollabBanner";
import { DashboardClaimBanner } from "./DashboardClaimBanner";
import { DashboardShelfCustomizer } from "./DashboardShelfCustomizer";
import { DashboardBadgesGrid } from "./DashboardBadgesGrid";
import { DashboardProjectsSection } from "./DashboardProjectsSection";
import type { ProjectData } from "./NeobrutalismProjectCard";
import { useDashboardProfile } from "./useDashboardProfile";

export type { ProfileViewData };

interface NeobrutalismProfileViewProps {
  profile: ProfileViewData;
  projects: ProjectData[];
  posts?: unknown[];
  isOwnProfile?: boolean;
}

export function NeobrutalismProfileView({
  profile,
  projects,
  isOwnProfile = false,
}: NeobrutalismProfileViewProps) {
  const { user } = useAuth();

  const {
    activeCategory,
    setActiveCategory,
    showShareModal,
    setShowShareModal,
    showSkinModal,
    setShowSkinModal,
    activeSkinId,
    selectedBadge,
    setSelectedBadge,
    claimableGrants,
    evaluatedProjects,
    studentUserId,
    studentBadgeIds,
    activeBadgeTab,
    setActiveBadgeTab,
    displayedBadges,
    featuredBadgeIds,
    isCustomizingShelf,
    setIsCustomizingShelf,
    badgeToSwap,
    setBadgeToSwap,
    newlyUnlockedBadgeIds,
    markBadgeAsSeen,
    markAllAsSeen,
    handleClaimBadge,
    handleClaimAll,
    pendingCollabRequests,
    handleAcceptCollab,
    handleRejectCollab,
    handleToggleFeaturedBadge,
    handleReplaceSlot,
    handleRemoveSlot,
    activeSkin,
    handleApplySkin,
    shareUrl,
    categories,
    filteredProjects,
    validSkills,
  } = useDashboardProfile({ profile, projects, isOwnProfile, user });

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 pb-24 sm:pb-28 max-w-6xl">
      {/* ── STUDENT HEADER CARD ── */}
      <DashboardProfileHeader
        profile={profile}
        activeSkin={activeSkin}
        validSkills={validSkills}
        isOwnProfile={isOwnProfile}
        onOpenSkinModal={() => setShowSkinModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
      />

      {/* ── BADGE & PRESTASI SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-10 relative overflow-hidden shadow-xs"
      >
        <div className="mb-5 sm:mb-6 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <h2 className="text-sm sm:text-lg font-bold tracking-tight text-foreground font-mono uppercase whitespace-nowrap">
                Penghargaan &amp; Prestasi
              </h2>
              {isOwnProfile && newlyUnlockedBadgeIds.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{newlyUnlockedBadgeIds.length} Baru Terbuka</span>
                </span>
              ) : studentBadgeIds.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{studentBadgeIds.length} Diraih</span>
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
                {studentBadgeIds.length} / {PENGHARGAAN_CATALOG.length} Diraih
              </span>
              <button
                type="button"
                onClick={() => setIsCustomizingShelf((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isCustomizingShelf
                    ? "bg-primary text-white border border-primary shadow-xs"
                    : "bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border hover:border-primary/30"
                }`}
                title="Atur badge yang disorot di rak kartu mahasiswa"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {isCustomizingShelf
                    ? "Selesai Mengatur"
                    : `Atur Sorotan Kartu (${featuredBadgeIds.length}/5)`}
                </span>
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Penghargaan pencapaian dan rekam jejak prestasi mahasiswa di galeri platform STMIK Tazkia.
          </p>
        </div>

        {/* Collab Banner */}
        <DashboardCollabBanner
          isOwnProfile={isOwnProfile}
          pendingCollabRequests={pendingCollabRequests}
          onAccept={handleAcceptCollab}
          onReject={handleRejectCollab}
        />

        {/* Claimable Grants & New Unlock Banner */}
        <DashboardClaimBanner
          isOwnProfile={isOwnProfile}
          claimableGrants={claimableGrants}
          newlyUnlockedBadgeIds={newlyUnlockedBadgeIds}
          onClaimAll={handleClaimAll}
          onMarkAllSeen={markAllAsSeen}
        />

        {/* Shelf Customizer */}
        <DashboardShelfCustomizer
          isCustomizingShelf={isCustomizingShelf}
          featuredBadgeIds={featuredBadgeIds}
          badgeToSwap={badgeToSwap}
          onClose={() => {
            setIsCustomizingShelf(false);
            setBadgeToSwap(null);
          }}
          onCancelSwap={() => setBadgeToSwap(null)}
          onReplaceSlot={handleReplaceSlot}
          onRemoveSlot={handleRemoveSlot}
        />

        {/* Badges Grid */}
        <DashboardBadgesGrid
          displayedBadges={displayedBadges}
          studentBadgeIds={studentBadgeIds}
          featuredBadgeIds={featuredBadgeIds}
          claimableGrants={claimableGrants}
          newlyUnlockedBadgeIds={newlyUnlockedBadgeIds}
          isOwnProfile={isOwnProfile}
          isCustomizingShelf={isCustomizingShelf}
          activeBadgeTab={activeBadgeTab}
          onTabChange={(tab) => {
            setActiveBadgeTab(tab);
            setBadgeToSwap(null);
          }}
          onSelectBadge={(badge) => setSelectedBadge(badge)}
          onToggleFeatured={handleToggleFeaturedBadge}
          onClaimBadge={handleClaimBadge}
          onMarkBadgeSeen={markBadgeAsSeen}
        />
      </motion.div>

      {/* ── PROJECTS SECTION ── */}
      <DashboardProjectsSection
        projects={projects}
        filteredProjects={filteredProjects}
        categories={categories}
        activeCategory={activeCategory}
        isOwnProfile={isOwnProfile}
        authorProfile={profile}
        onCategoryChange={setActiveCategory}
      />

      {/* Share Modal */}
      {showShareModal && (
        <ShareProfileModal
          studentName={profile.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Skin Preview Modal */}
      {showSkinModal && (
        <SkinPreviewModal
          studentName={profile.full_name}
          prodi={profile.prodi || "STMIK Tazkia"}
          angkatan={profile.angkatan || 2026}
          avatarUrl={profile.avatar_url || null}
          bio={profile.bio || undefined}
          skills={validSkills}
          statusBadge={profile.status_badge || undefined}
          activeSkinId={activeSkinId}
          featuredBadgeIds={featuredBadgeIds}
          unlockedBadgeIds={studentBadgeIds}
          studentId={profile.id}
          userId={profile.user_id}
          onApplySkin={handleApplySkin}
          onClose={() => setShowSkinModal(false)}
        />
      )}

      {/* Badge Inspect Modal */}
      <StudentBadgeDetailModal
        selectedBadge={selectedBadge}
        studentBadgeIds={studentBadgeIds}
        studentUserId={studentUserId}
        evaluatedProjects={evaluatedProjects}
        mahasiswa={profile as any}
        activeSkinId={activeSkinId}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}

