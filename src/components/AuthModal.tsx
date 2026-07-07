import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthForm from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="auth-modal-overlay">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md relative p-1 overflow-hidden shadow-2xl z-10"
            id="auth-modal-panel"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors z-20"
              aria-label="Close Authentication Screen"
              id="auth-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Inner Form wrapper */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-4 font-mono text-xs">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                <span>SECURE END-TO-END GATEWAY</span>
              </div>

              <AuthForm onSuccess={onClose} embedMode={true} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
