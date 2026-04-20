"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePage } from "../../_state/PageContext";
import { useToast } from "../../_components/Toast";
import { LoginPromptModal } from "./LoginPromptModal";
import { useAuth } from "../../_lib/useAuth";
import { supabase } from "../../../lib/supabase";
import { HiOutlineEye, HiArrowTopRightOnSquare } from "react-icons/hi2";

interface DashboardHeaderProps {
  onPreviewClick: () => void;
}

export function DashboardHeader({ onPreviewClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { data, setPublished } = usePage();
  const { isAuthenticated, signOut } = useAuth();
  const toast = useToast();
  const [modalMode, setModalMode] = useState<"save" | "publish" | null>(null);

  const handleSave = () => {
    if (isAuthenticated) {
      toast.show("Changes saved to your account");
    } else {
      // Save work to sessionStorage and redirect
      sessionStorage.setItem("pending_work", JSON.stringify({ 
        data, 
        action: "save" 
      }));
      router.push("/signup");
    }
  };

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  const handlePublish = async () => {
    if (isAuthenticated) {
      if (data.isPublished) {
        toast.show("Page updated successfully");
      } else {
        // Trigger Stripe Checkout
        try {
          setIsCheckoutLoading(true);
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) throw new Error("No user session");

          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              username: data.profile.username,
            }),
          });

          const { url, error } = await response.json();
          if (error) throw new Error(error);

          if (url) {
            window.location.href = url;
          }
        } catch (err: any) {
          console.error("Checkout redirect failed:", err);
          toast.show("Failed to start checkout. Please try again.");
        } finally {
          setIsCheckoutLoading(false);
        }
      }
    } else {
      // Save work to sessionStorage and redirect
      sessionStorage.setItem("pending_work", JSON.stringify({ 
        data, 
        action: "publish" 
      }));
      router.push("/signup");
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-border-base px-5 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-display text-2xl text-text-primary tracking-tight">
          corner
        </Link>
        
        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dashboard-bg rounded-full border border-border-base">
          <div className={`w-2 h-2 rounded-full ${data.isPublished ? 'bg-success' : 'bg-amber-400'}`} />
          <span className="text-xs font-medium text-text-secondary">
            {data.isPublished ? (
              <span className="flex items-center gap-1.5">
                Live at corner.link/{data.profile.username}
                <HiArrowTopRightOnSquare className="opacity-50" />
              </span>
            ) : (
              "Draft — only you can see this"
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onPreviewClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-primary border border-border-base rounded-xl hover:bg-dashboard-bg transition-colors"
        >
          <HiOutlineEye size={18} />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-semibold text-text-primary border border-border-base rounded-xl hover:bg-dashboard-bg transition-colors"
        >
          Save
        </button>

        <button
          onClick={handlePublish}
          disabled={isCheckoutLoading}
          className="px-5 py-2 text-sm font-semibold text-white bg-primary-coral rounded-xl hover:bg-primary-coral-hover shadow-lg shadow-primary-coral/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCheckoutLoading ? "Processing..." : (data.isPublished ? "Update Page" : "Publish")}
        </button>
      </div>

    </header>
  );
}
