"use client";

import React from "react";

interface CuratorMedalBadgeProps {
  rank: 1 | 2 | 3;
  animToggle?: boolean;
  animKey?: number;
  delayIndex?: number;
  size?: number | string; // font-size in px or CSS clamp/rem
  className?: string;
}

const STAR_CLIP =
  "polygon(50.00% 0.00%, 59.57% 8.08%, 71.69% 4.95%, 76.81% 16.38%, 89.09% 18.83%, 88.74% 31.34%, 98.75% 38.87%, 93.00% 50.00%, 98.75% 61.13%, 88.74% 68.66%, 89.09% 81.17%, 76.81% 83.62%, 71.69% 95.05%, 59.57% 91.92%, 50.00% 100.00%, 40.43% 91.92%, 28.31% 95.05%, 23.19% 83.62%, 10.91% 81.17%, 11.26% 68.66%, 1.25% 61.13%, 7.00% 50.00%, 1.25% 38.87%, 11.26% 31.34%, 10.91% 18.83%, 23.19% 16.38%, 28.31% 4.95%, 40.43% 8.08%)";

export function CuratorMedalBadge({
  rank,
  animToggle = false,
  animKey = 0,
  delayIndex = 0,
  size = 17,
  className = "",
}: CuratorMedalBadgeProps) {
  const rankClass = `kt-r${rank} ${animToggle ? "kt-b" : "kt-a"}`;
  const delay1 = 0.15 * delayIndex;
  const delay2 = 0.8 + 0.15 * delayIndex;

  return (
    <span
      key={`curator-medal-${rank}-${animKey}`}
      className={`kb ${rankClass} ${className}`}
      role="img"
      aria-label={`Karya terbaik ${rank}`}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
        animationDelay: `${delay1}s, ${delay2}s`,
        ["--star" as any]: STAR_CLIP,
      }}
    >
      <span className="kb-halo" />
      <span className="kb-tail kb-tl" />
      <span className="kb-tail kb-tr" />
      <span className="kb-rosette" />
      <span className="kb-ring" />
      <span className="kb-disc">
        <svg
          className="kb-star"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />
        </svg>
        <span className="kb-num">{rank}</span>
      </span>
      <span className="kb-spark kb-s1" />
      <span className="kb-spark kb-s2" />
    </span>
  );
}

