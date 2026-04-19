"use client";

import React, { use, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PageData } from "../_state/PageContext";
import { PublicPage } from "../_components/PublicPage";
import { EXAMPLES } from "../_lib/examples";
import Link from "next/link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username.toLowerCase();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Check examples first for speed and demo consistency
      const example = EXAMPLES.find(e => e.profile.username.toLowerCase() === username);
      if (example) {
        setPageData(example);
        setLoading(false);
        return;
      }

      // 2. Fetch from database
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_data, is_published")
          .eq("username", username)
          .single();

        if (profile?.is_published && profile.full_data) {
          setPageData(profile.full_data as PageData);
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-coral/20 border-t-primary-coral rounded-full animate-spin" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-4xl text-text-primary mb-4">Corner not found.</h1>
        <p className="text-text-secondary mb-8">This corner hasn&apos;t been claimed or published yet.</p>
        <Link href="/" className="bg-primary-coral text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary-coral/20">
          Claim your corner
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PublicPage 
        profile={pageData.profile}
        links={pageData.links}
        appearance={pageData.appearance}
        payments={pageData.payments}
        animate={true}
        interactive={true}
      />
      
      <div className="fixed bottom-6 right-6 z-[100]">
        <Link 
          href="/"
          className="bg-white/80 backdrop-blur-md border border-border-base px-4 py-2 rounded-full text-xs font-bold text-text-primary shadow-lg hover:bg-white transition-all flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-primary-coral animate-pulse" />
          Create your own corner
        </Link>
      </div>
    </div>
  );
}
