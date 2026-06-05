import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10 w-full max-w-lg"
          >
            <Card glowColor="cyan" className={cn("w-full border-[#00f5ff]/20 p-6 relative overflow-hidden", className)}>
              <div className="scanlines-overlay absolute inset-0 pointer-events-none opacity-20" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  {title && (
                    <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#bf5fff]">
                      {title}
                    </h2>
                  )}
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div>{children}</div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
