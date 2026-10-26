import React from "react";

// ==========================================
// CUSTOM BUILDER SVG ICONS (HARD HAT & PICKAXE)
// ==========================================

export const HardHatSvg = ({
  className = "w-4 h-4",
  strokeWidth = 2.2,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
    <path d="M4 15v-3a6 6 0 0 1 6-6h0" />
    <path d="M14 6h0a6 6 0 0 1 6 6v3" />
  </svg>
);

export const PickaxeSvg = ({
  className = "w-4 h-4",
  strokeWidth = 2.2,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="M14.5 3.5C18 5 20.5 8.5 21 12.5c-2.5-1.5-5.5-2-8.5-1.5L9 7.5c.5-3 0-6-1.5-8.5 4 .5 7.5 3 9 6.5Z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <path d="M14 10 3.5 20.5a1.41 1.41 0 0 1-2-2L12 8" />
    <path d="m15 6 3 3" />
  </svg>
);

export const BuilderComboSvg = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 20 19 5" />
    <path d="M15 4c2.5 1 4.5 3 5 5.5" />
    <path d="M20 20 5 5" />
    <path d="M9 4C6.5 5 4.5 7 4 9.5" />
    <circle cx="12" cy="12" r="3.5" fill="#091526" stroke="currentColor" strokeWidth="2" />
  </svg>
);

