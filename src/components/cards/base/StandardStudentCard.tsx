"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  PENGHARGAAN_CATALOG,
  PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { StudentCardFront } from "./StudentCardFront";
import { StudentCardBack } from "./StudentCardBack";
import type { StudentCardData, StandardStudentCardProps } from "./types";

export type { StudentCardData, StandardStudentCardProps };

const DEFAULT_FEATURED_IDS = [9, 4, 7, 10, 14];
const VISIBLE_COUNT = 4;

export const StandardStudentCard: React.FC<StandardStudentCardProps> = ({
  data = {
    name: "Anisa Aulia",
    initials: "A",
    angkatan: "ANGKATAN 2",
    statusIcon: "🚀",
    status: "Open for Collab",
    major: "Sistem Informasi",
    skills: [],
    bio: undefined,
    roleTitle: "Mahasiswa Aktif STMIK Tazkia",
    serial: "KTZ-2026-STD-001",
    featuredBadgeIds: DEFAULT_FEATURED_IDS,
  },
  primaryColor = "#FF8A2B",
  secondaryColor = "#0B1F4A",
  enableTilt = true,
  isSkeleton = false,
  isPreview = false,
  onContactClick,
  onProfileClick,
  onTriggerUnlock,
  onFilterAngkatan,
  onFilterStatus,
  onFilterSkill,
  outerBorderClassName,
  cardBodyClassName,
  nameClassName,
  holoOverlay,
  watermarkElement,
  bannerOverlay,
  floatingPill,
  avatarDecoration,
  dividerClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  backOverlay,
  backContainerClassName,
  backHeaderTitle,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"umum" | "terbatas">("umum");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(1);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Unlocked badges (defaults to student's unlocked badges or empty if isSkeleton)
  const unlockedBadgeIds = useMemo(() => {
    if (isSkeleton) return [];
    if (data.unlockedBadgeIds !== undefined) {
      return data.unlockedBadgeIds;
    }
    return data.featuredBadgeIds || [];
  }, [data.unlockedBadgeIds, data.featuredBadgeIds, isSkeleton]);

  // Featured 5 badges shown on the front of the card
  const featuredBadges: PenghargaanBadge[] = useMemo(() => {
    if (isSkeleton) return [];
    const ids =
      data.featuredBadgeIds !== undefined
        ? data.featuredBadgeIds
        : unlockedBadgeIds.slice(0, 5);
    return ids
      .map((id) => PENGHARGAAN_CATALOG.find((b) => b.id === id))
      .filter((b): b is PenghargaanBadge => Boolean(b))
      .slice(0, 5);
  }, [data.featuredBadgeIds, unlockedBadgeIds, isSkeleton]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      transition: "transform 80ms ease-out",
    });

    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "none",
      transition: "transform 350ms ease-out",
    });
    setGlareStyle({ opacity: 0 });
  };

  const handleTabChange = (tab: "umum" | "terbatas") => {
    setActiveTab(tab);
    setCarouselIndex(0);
    const first = PENGHARGAAN_CATALOG.find((b) => b.group === tab);
    if (first) {
      setSelectedBadgeId(first.id);
    }
  };

  const handleSelectBadge = (badge: PenghargaanBadge) => {
    setSelectedBadgeId(badge.id);
    if (badge.group !== activeTab) {
      setActiveTab(badge.group);
      const groupBadges = PENGHARGAAN_CATALOG.filter((b) => b.group === badge.group);
      const idx = groupBadges.findIndex((b) => b.id === badge.id);
      const newMax = Math.max(0, groupBadges.length - VISIBLE_COUNT);
      setCarouselIndex(Math.min(Math.max(0, idx - 1), newMax));
    }
  };

  const handleOpenBadgeDetails = (badge: PenghargaanBadge) => {
    handleSelectBadge(badge);
    setIsFlipped(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...tiltStyle,
      }}
      className="relative w-full max-w-[338px] mx-auto select-none subpixel-antialiased will-change-transform"
    >
      {/* 3D Flip Container */}
      <div className="relative h-[480px] w-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <StudentCardFront
            data={data}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isSkeleton={isSkeleton}
            isPreview={isPreview}
            isFlipped={isFlipped}
            glareStyle={glareStyle}
            featuredBadges={featuredBadges}
            unlockedBadgeIds={unlockedBadgeIds}
            onProfileClick={onProfileClick}
            onContactClick={onContactClick}
            onFlipToBack={() => setIsFlipped(true)}
            onOpenBadgeDetails={handleOpenBadgeDetails}
            onFilterAngkatan={onFilterAngkatan}
            onFilterStatus={onFilterStatus}
            onFilterSkill={onFilterSkill}
            outerBorderClassName={outerBorderClassName}
            cardBodyClassName={cardBodyClassName}
            nameClassName={nameClassName}
            holoOverlay={holoOverlay}
            watermarkElement={watermarkElement}
            bannerOverlay={bannerOverlay}
            floatingPill={floatingPill}
            avatarDecoration={avatarDecoration}
            dividerClassName={dividerClassName}
            primaryButtonClassName={primaryButtonClassName}
            secondaryButtonClassName={secondaryButtonClassName}
          />

          {/* ================= BACK OF CARD ================= */}
          <StudentCardBack
            data={data}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isSkeleton={isSkeleton}
            isFlipped={isFlipped}
            unlockedBadgeIds={unlockedBadgeIds}
            activeTab={activeTab}
            selectedBadgeId={selectedBadgeId}
            carouselIndex={carouselIndex}
            onTabChange={handleTabChange}
            onSelectBadge={handleSelectBadge}
            onPrevBadge={(e) => {
              e.stopPropagation();
              setCarouselIndex((prev) => Math.max(0, prev - 1));
            }}
            onNextBadge={(e) => {
              e.stopPropagation();
              const tabBadges = PENGHARGAAN_CATALOG.filter((b) => b.group === activeTab);
              const maxIdx = Math.max(0, tabBadges.length - VISIBLE_COUNT);
              setCarouselIndex((prev) => Math.min(maxIdx, prev + 1));
            }}
            onFlipToFront={() => setIsFlipped(false)}
            onProfileClick={onProfileClick}
            outerBorderClassName={outerBorderClassName}
            nameClassName={nameClassName}
            holoOverlay={holoOverlay}
            backOverlay={backOverlay}
            backContainerClassName={backContainerClassName}
            backHeaderTitle={backHeaderTitle}
            primaryButtonClassName={primaryButtonClassName}
            secondaryButtonClassName={secondaryButtonClassName}
          />
        </div>
      </div>
    </div>
  );
};

export default StandardStudentCard;
