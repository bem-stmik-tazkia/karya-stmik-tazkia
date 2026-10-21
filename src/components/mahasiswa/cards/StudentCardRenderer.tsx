"use client";

import React from "react";
import StandardStudentCard, { StudentCardData } from "./umum/StandardStudentCard";
import BEM2026StudentCard from "./khusus/BEM2026StudentCard";
import RistekQuantumCard from "./khusus/RistekQuantumCard";
import RistekMechaCard from "./khusus/RistekMechaCard";
import CustomStudentCard from "./umum/CustomStudentCard";

export interface StudentCardRendererProps {
  skinId?: string;
  data?: StudentCardData;
  customPrimary?: string;
  customSecondary?: string;
  enableTilt?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
}

export const StudentCardRenderer: React.FC<StudentCardRendererProps> = ({
  skinId = "classic",
  data,
  customPrimary = "#38bdf8",
  customSecondary = "#0f172a",
  enableTilt = true,
  onContactClick,
  onProfileClick,
}) => {
  switch (skinId) {
    case "bem2026":
      return (
        <BEM2026StudentCard
          data={data}
          enableTilt={enableTilt}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
        />
      );

    case "ristekA":
    case "ristekQuantum":
      return (
        <RistekQuantumCard
          data={data}
          enableTilt={enableTilt}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
        />
      );

    case "ristekB":
    case "ristekMecha":
      return (
        <RistekMechaCard
          data={data}
          enableTilt={enableTilt}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
        />
      );

    case "custom":
      return (
        <CustomStudentCard
          data={data}
          primaryColor={customPrimary}
          secondaryColor={customSecondary}
          enableTilt={enableTilt}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
        />
      );

    case "standard":
    case "classic":
    default:
      return (
        <StandardStudentCard
          data={data}
          enableTilt={enableTilt}
          onContactClick={onContactClick}
          onProfileClick={onProfileClick}
        />
      );
  }
};

export default StudentCardRenderer;

