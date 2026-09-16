"use client";

import React, { useState } from "react";
import CompleteProfileModal from "./CompleteProfileModal";

export function CompleteProfileModalWrapper({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <CompleteProfileModal
      userId={userId}
      onClose={() => setIsOpen(false)}
      onSuccess={() => {
        setIsOpen(false);
        // Refresh router so the dashboard gets the new data
        window.location.reload();
      }}
    />
  );
}
