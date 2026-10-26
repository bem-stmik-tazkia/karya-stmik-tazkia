"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageZoomModalProps {
  selectedImage: string | null;
  onClose: () => void;
}

export default function ImageZoomModal({ selectedImage, onClose }: ImageZoomModalProps) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-card border border-border"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Dokumentasi Karya Full"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

