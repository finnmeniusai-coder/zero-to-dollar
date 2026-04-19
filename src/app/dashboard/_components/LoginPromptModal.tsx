"use client";

import React from "react";
import Link from "next/link";
import { HiOutlineXMark } from "react-icons/hi2";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  mode: "save" | "publish";
}

export function LoginPromptModal({ isOpen, onClose, onContinue, mode }: LoginPromptModalProps) {
  if (!isOpen) return null;

  const content = {
    save: {
      headline: "Save your page",
      body: "Create a free account to save your draft — you can come back and edit anytime.",
    },
    publish: {
      headline: "Ready to go live?",
      body: "Create an account and publish your page for $12/year. Cancel anytime.",
    },
  }[mode];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[440px] rounded-[32px] p-8 md:p-10 shadow-2xl animate-fade-up">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <HiOutlineXMark size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="font-display text-2xl md:text-3xl mb-4 text-text-primary">
            {content.headline}
          </div>
          <p className="text-text-secondary leading-relaxed mb-8">
            {content.body}
          </p>

          <div className="w-full space-y-4">
            <Link
              href="/signup"
              className="block w-full bg-primary-coral text-white py-4 rounded-2xl font-semibold shadow-lg shadow-primary-coral/20 hover:bg-primary-coral-hover transition-colors text-center"
            >
              Sign up to save
            </Link>

            <Link 
              href="/login"
              className="block w-full text-center text-sm font-medium text-text-muted hover:text-text-primary transition-colors py-2"
            >
              Already have an account? <span className="text-primary-coral">Log in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
