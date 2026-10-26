"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { DeleteItemState } from "./types";

interface DeleteConfirmModalProps {
  deleteItem: DeleteItemState;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  deleteItem,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-background/80 backdrop-blur-xs"
          />
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Hapus Data?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-foreground">
                {deleteItem.type === "angkatan" ? deleteItem.item.label : deleteItem.value}
              </span>
              ?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

