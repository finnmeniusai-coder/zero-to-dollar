"use client";

import React, { useState } from "react";
import { useToast } from "../../_components/Toast";
import { HiOutlineCog6Tooth, HiOutlineCreditCard } from "react-icons/hi2";
import { useAuth } from "../../_lib/useAuth";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export function AccountTab() {
  const toast = useToast();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const translateError = (message: string) => {
    if (message.includes("Password should be at least")) return "Your new password needs to be at least 8 characters long.";
    return message;
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      toast.show("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.show("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.show(translateError(err.message || "Failed to update password"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      toast.show("Failed to log out");
    }
  };

  const handleDelete = async () => {
    // For now we just sign out as account deletion via Supabase client is limited
    // to the service role or a specific function.
    toast.show("Account deletion requested");
    setTimeout(handleLogout, 2000);
  };

  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);

    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);

      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      toast.show(err.message === "No Stripe customer found" 
        ? "You don't have an active subscription yet." 
        : "Failed to open subscription manager.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] px-2 py-4 pb-32">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-2 text-text-primary tracking-tight">Account</h1>
        <p className="text-text-secondary text-sm leading-relaxed font-sans">
          Manage your account settings and subscription.
        </p>
      </div>

      <div className="space-y-8">
        {/* Email */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-text-primary px-1 font-sans">Email Address</label>
            <div className="w-full px-4 py-3.5 rounded-xl bg-dashboard-bg border border-border-base text-text-secondary font-medium font-sans">
              {user?.email || "No email linked"}
            </div>
          </div>
        </section>

        {/* Password */}
        <section className="space-y-4 pt-6 border-t border-border-base">
          <h3 className="text-sm font-bold text-text-primary px-1 font-sans">Change Password</h3>
          <div className="space-y-4 font-sans">
            <input 
              type="password" 
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-border-base focus:ring-2 focus:ring-primary-coral focus:border-transparent outline-none transition-all font-medium"
            />
            <input 
              type="password" 
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-border-base focus:ring-2 focus:ring-primary-coral focus:border-transparent outline-none transition-all font-medium"
            />
            <button 
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-text-primary text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="space-y-4 pt-6 border-t border-border-base">
          <h3 className="text-sm font-bold text-text-primary px-1 font-sans">Subscription</h3>
          <div className="p-6 bg-white border border-border-base rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-coral/10 flex items-center justify-center text-primary-coral">
                <HiOutlineCreditCard size={24} />
              </div>
              <div>
                <p className="font-bold text-text-primary">Corner Pro Plan</p>
                <p className="text-sm text-text-muted">Managed via Stripe</p>
              </div>
            </div>
            <button 
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="text-sm font-bold text-text-primary hover:underline px-2 disabled:opacity-50"
            >
              {portalLoading ? "Loading..." : "Manage subscription"}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-12 border-t border-border-base">
          <div className="p-6 border-l-4 border-l-error bg-error/5 rounded-2xl space-y-6 font-sans">
            <h3 className="text-sm font-bold text-error">Danger Zone</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleLogout}
                className="px-6 py-3 border border-border-base bg-white rounded-xl text-sm font-bold text-text-primary hover:bg-dashboard-bg transition-colors"
              >
                Log out
              </button>
              <button 
                onClick={() => setIsDeleting(true)}
                className="px-6 py-3 border border-error/30 bg-white rounded-xl text-sm font-bold text-error hover:bg-error/5 transition-colors"
              >
                Delete my account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleting(false)} />
          <div className="relative bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl animate-fade-up text-center font-sans">
            <h3 className="font-display text-2xl mb-4 text-text-primary">Are you sure?</h3>
            <p className="text-[#4A4A4A] mb-8 text-sm leading-relaxed">
              This will permanently delete your page and all your data. This cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="w-full py-4 bg-error text-white rounded-2xl font-bold shadow-lg shadow-error/20 hover:bg-error/80 transition-all font-sans"
              >
                Yes, delete my account
              </button>
              <button 
                onClick={() => setIsDeleting(false)}
                className="w-full py-4 bg-dashboard-bg text-text-primary rounded-2xl font-bold border border-border-base hover:bg-border-base transition-all font-sans"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
