"use client";

import React, { useState } from "react";
import { Mail, RotateCw, User } from "lucide-react";
import { PenghargaanBadge } from "@/data/penghargaanCatalog";
import { StudentCardSocials } from "./StudentCardSocials";
import { StudentCardFrontBadges } from "./StudentCardFrontBadges";
import type { StudentCardData } from "./types";

interface StudentCardFrontProps {
  data: StudentCardData;
  primaryColor: string;
  secondaryColor: string;
  isSkeleton?: boolean;
  isPreview?: boolean;
  isFlipped?: boolean;
  glareStyle: React.CSSProperties;
  featuredBadges: PenghargaanBadge[];
  unlockedBadgeIds: number[];
  onProfileClick?: () => void;
  onContactClick?: () => void;
  onFlipToBack: () => void;
  onOpenBadgeDetails: (badge: PenghargaanBadge) => void;
  onFilterAngkatan?: (ang: any) => void;
  onFilterStatus?: (st: string) => void;
  onFilterSkill?: (sk: string) => void;
  outerBorderClassName?: string;
  cardBodyClassName?: string;
  nameClassName?: string;
  holoOverlay?: React.ReactNode;
  watermarkElement?: React.ReactNode;
  bannerOverlay?: React.ReactNode;
  floatingPill?: React.ReactNode;
  avatarDecoration?: React.ReactNode;
  dividerClassName?: string;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
}

export const StudentCardFront: React.FC<StudentCardFrontProps> = ({
  data,
  primaryColor,
  secondaryColor,
  isSkeleton = false,
  isPreview = false,
  isFlipped = false,
  glareStyle,
  featuredBadges,
  unlockedBadgeIds,
  onProfileClick,
  onContactClick,
  onFlipToBack,
  onOpenBadgeDetails,
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
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={!isFlipped ? onProfileClick : undefined}
      className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] subpixel-antialiased ${
        outerBorderClassName || "p-[1px] bg-slate-200/90 dark:bg-slate-800"
      } shadow-sm hover:shadow-md transition-shadow duration-300 ${
        isFlipped ? "pointer-events-none" : "pointer-events-auto"
      } ${onProfileClick && !isFlipped ? "cursor-pointer" : ""}`}
    >
      <div
        className={`relative w-full h-full rounded-[20px] overflow-hidden flex flex-col justify-between ${
          cardBodyClassName || "bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100"
        }`}
      >
        {/* Dynamic Mouse Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-[20px]"
          style={glareStyle}
        />

        {/* Holographic foil overlay */}
        {holoOverlay}

        {/* Watermark Slot */}
        {watermarkElement}

        {/* TOP SECTION: BANNER + AVATAR + INFO */}
        <div>
          {/* Header Banner */}
          <div
            className="relative h-[110px] w-full overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${secondaryColor} 0%, #0E2558 50%, #16347A 100%)`,
            }}
          >
            {bannerOverlay || (
              <>
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
                  }}
                />
              </>
            )}

            {/* Top Pills: Angkatan & Status */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
              {/* Angkatan */}
              {isSkeleton ? (
                <span className="w-16 h-5 rounded-full bg-[#1b3252]/85 border border-white/15 backdrop-blur-md shadow-xs inline-block" />
              ) : (
                <span
                  onClick={(e) => {
                    if (onFilterAngkatan) {
                      e.stopPropagation();
                      onFilterAngkatan(data.angkatan);
                    }
                  }}
                  className={`text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-[#1b3252]/85 text-slate-200 border border-white/15 backdrop-blur-md shadow-xs shrink-0 ${
                    onFilterAngkatan
                      ? "hover:border-orange-400 hover:text-white cursor-pointer transition"
                      : ""
                  }`}
                >
                  {data.angkatan || (isPreview ? "ANGKATAN —" : "ANGKATAN 2")}
                </span>
              )}

              {/* Status Pill */}
              {isSkeleton ? (
                <span className="h-5 px-2.5 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 border border-white/15 backdrop-blur-md shadow-xs">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 0 6px ${primaryColor}`,
                    }}
                  />
                  <span className="w-14 h-2 rounded-full bg-white/20 inline-block" />
                </span>
              ) : (
                (() => {
                  const statusStr = data.status || (!isPreview ? "Open for Collab" : "");
                  if (!statusStr) return null;
                  const emojiMatch = statusStr.match(/^(\p{Emoji}|\p{Extended_Pictographic})/u);
                  const iconToDisplay =
                    data.statusIcon && data.statusIcon !== "🟠"
                      ? data.statusIcon
                      : emojiMatch
                      ? emojiMatch[0]
                      : null;
                  const textToDisplay =
                    statusStr.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, "").trim() ||
                    statusStr;

                  return (
                    <span
                      onClick={(e) => {
                        if (onFilterStatus && data.status) {
                          e.stopPropagation();
                          onFilterStatus(data.status);
                        }
                      }}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 text-slate-100 border border-white/15 backdrop-blur-md shadow-xs max-w-[60%] min-w-0 ${
                        onFilterStatus ? "hover:border-orange-400 cursor-pointer transition" : ""
                      }`}
                    >
                      {iconToDisplay ? (
                        <span className="shrink-0 text-[12px] leading-none">{iconToDisplay}</span>
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: primaryColor,
                            boxShadow: `0 0 6px ${primaryColor}`,
                          }}
                        />
                      )}
                      <span className="truncate">{textToDisplay}</span>
                    </span>
                  );
                })()
              )}
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div className="relative">
            <div
              className={dividerClassName || "h-[3px] w-full"}
              style={dividerClassName ? undefined : { backgroundColor: primaryColor }}
            />
            {floatingPill}
          </div>

          {/* Avatar & Social Row */}
          <div className="px-5 relative flex justify-between items-end -mt-10 mb-3">
            {/* Avatar with Glow Ring */}
            <div className="relative">
              {avatarDecoration}
              <div
                className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all"
                style={{
                  outline: `3px solid ${primaryColor}`,
                  outlineOffset: "1px",
                  boxShadow: `0 0 18px ${primaryColor}66`,
                }}
              >
                {data.avatarUrl && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.avatarUrl}
                    alt={data.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-black text-2xl text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {data.initials ? (
                      data.initials
                    ) : data.name && data.name !== "—" ? (
                      data.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-8 h-8 text-white/90" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Social Buttons */}
            <StudentCardSocials socials={data.socials} />
          </div>

          {/* Student Info: Name, Major, Bio, Skills */}
          <div className="px-5">
            {isSkeleton ? (
              <div className="space-y-2 py-0.5">
                <div className="h-4 w-40 rounded-md bg-slate-200 dark:bg-slate-700/80 animate-pulse my-0.5" />
                <div className="h-3 w-28 rounded-md bg-slate-200/90 dark:bg-slate-700/70 animate-pulse mt-1" />
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                  <div className="h-2.5 w-5/6 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pt-2">
                  <div className="h-4 w-16 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                  <div className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <h3
                    className={
                      nameClassName ||
                      "font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white group-hover:text-orange-500 transition line-clamp-1"
                    }
                    title={data.name}
                  >
                    {data.name}
                  </h3>
                </div>

                <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                  <span style={{ color: primaryColor }}>🎓</span>
                  <span>{data.major || "—"}</span>
                </p>

                {data.bio ? (
                  <p
                    className="text-xs mt-2 line-clamp-3 leading-relaxed text-slate-600 dark:text-slate-300"
                    title={data.bio}
                  >
                    {data.bio}
                  </p>
                ) : (
                  <p className="text-xs mt-2 italic text-slate-400/80 dark:text-slate-500/80 line-clamp-2">
                    {isPreview ? "Belum ada biodata (pratinjau kosong)." : "Belum mengisi bio."}
                  </p>
                )}

                {data.skills && data.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {data.skills.slice(0, 3).map((skill, idx) => {
                      const pillColors = [
                        { bg: `${primaryColor}18`, border: `${primaryColor}55`, text: primaryColor },
                        { bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.40)", text: "#0ea5e9" },
                        { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.35)", text: "#a855f7" },
                      ];
                      const c = pillColors[idx % pillColors.length];
                      return (
                        <span
                          key={idx}
                          onClick={(e) => {
                            if (onFilterSkill) {
                              e.stopPropagation();
                              onFilterSkill(skill);
                            }
                          }}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                            onFilterSkill
                              ? "cursor-pointer hover:brightness-110 active:scale-95"
                              : ""
                          }`}
                          style={{
                            backgroundColor: c.bg,
                            borderColor: c.border,
                            color: c.text,
                          }}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {data.skills.length > 3 && (
                      <span className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500">
                        +{data.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: 5 HEX BADGES & ACTION BUTTONS */}
        <div className="px-5 pb-4 pt-2 relative z-10">
          <StudentCardFrontBadges
            data={data}
            featuredBadges={featuredBadges}
            unlockedBadgeIds={unlockedBadgeIds}
            isSkeleton={isSkeleton}
            isFlipped={isFlipped}
            onOpenBadgeDetails={onOpenBadgeDetails}
            onOpenLemari={onFlipToBack}
          />

          {/* Action Buttons: Hubungi & Balik Kartu */}
          <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onContactClick) {
                  onContactClick();
                } else if (data.contactEmail) {
                  window.location.href = `mailto:${data.contactEmail}`;
                } else if (onProfileClick) {
                  onProfileClick();
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer hover:brightness-110 ${
                primaryButtonClassName || ""
              }`}
              style={primaryButtonClassName ? undefined : { backgroundColor: primaryColor }}
            >
              <Mail className="w-4 h-4" /> Hubungi
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFlipToBack();
              }}
              title="Klik untuk membalik kartu (Buka Lemari Penghargaan)"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition hover:rotate-90 cursor-pointer shadow-xs ${
                secondaryButtonClassName ||
                "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

