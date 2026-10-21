"use client";

import React from "react";
import StandardStudentCard, {
  StandardStudentCardProps,
  StudentCardData,
} from "./StandardStudentCard";

export interface CustomStudentCardProps extends StandardStudentCardProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export const CustomStudentCard: React.FC<CustomStudentCardProps> = ({
  primaryColor = "#f97316",
  secondaryColor = "#061d3a",
  ...props
}) => {
  return (
    <StandardStudentCard
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      {...props}
    />
  );
};

export default CustomStudentCard;
