import React from "react";

export interface StudentCardData {
  name: string;
  initials?: string;
  angkatan?: string | number;
  statusIcon?: string;
  status?: string;
  major?: string;
  projectCount?: number;
  skills?: string[];
  bio?: string;
  roleTitle?: string;
  serial?: string;
  avatarUrl?: string | null;
  socials?: {
    website?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  contactEmail?: string;
  featuredBadgeIds?: number[];
  unlockedBadgeIds?: number[];
  badges?: Array<{ id: string; label: string; icon?: string }>;
  projects?: any[];
  cardSkin?: string;
}

export interface StandardStudentCardProps {
  data?: StudentCardData;
  primaryColor?: string;
  secondaryColor?: string;
  enableTilt?: boolean;
  isSkeleton?: boolean;
  isPreview?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
  onFilterAngkatan?: (ang: any) => void;
  onFilterStatus?: (st: string) => void;
  onFilterSkill?: (sk: string) => void;
  // Visual customization slots from skin
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
  backOverlay?: React.ReactNode;
  backContainerClassName?: string;
  backHeaderTitle?: React.ReactNode;
}

