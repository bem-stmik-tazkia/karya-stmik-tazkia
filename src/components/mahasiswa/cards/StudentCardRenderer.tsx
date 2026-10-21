"use client";

import React from "react";
import StandardStudentCard, { StudentCardData } from "./umum/StandardStudentCard";

export interface StudentCardRendererProps {
  skinId?: string;
  data?: StudentCardData;
  customPrimary?: string;
  customSecondary?: string;
  enableTilt?: boolean;
  isSkeleton?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
  onFilterAngkatan?: (ang: any) => void;
  onFilterStatus?: (st: string) => void;
  onFilterSkill?: (sk: string) => void;
}

export const StudentCardRenderer: React.FC<StudentCardRendererProps> = ({
  skinId = "classic",
  data,
  customPrimary = "#FF8A2B",
  customSecondary = "#0B1F4A",
  enableTilt = true,
  isSkeleton = false,
  onContactClick,
  onProfileClick,
  onTriggerUnlock,
  onFilterAngkatan,
  onFilterStatus,
  onFilterSkill,
}) => {
  switch (skinId) {
    case "custom":
      return (
        <StandardStudentCard
          data={data}
          primaryColor={customPrimary || "#FF8A2B"}
          secondaryColor={customSecondary || "#0B1F4A"}
          enableTilt={enableTilt}
          isSkeleton={isSkeleton}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
          onTriggerUnlock={onTriggerUnlock}
          onFilterAngkatan={onFilterAngkatan}
          onFilterStatus={onFilterStatus}
          onFilterSkill={onFilterSkill}
        />
      );

    case "standard":
    case "classic":
    default:
      return (
        <StandardStudentCard
          data={data}
          primaryColor="#FF8A2B"
          secondaryColor="#0B1F4A"
          enableTilt={enableTilt}
          isSkeleton={isSkeleton}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
          onTriggerUnlock={onTriggerUnlock}
          onFilterAngkatan={onFilterAngkatan}
          onFilterStatus={onFilterStatus}
          onFilterSkill={onFilterSkill}
        />
      );
  }
};

export default StudentCardRenderer;
