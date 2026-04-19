"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  emoji?: string;
  visible: boolean;
}

export interface Publication {
  id: string;
  title: string;
  url: string;
}

export interface SocialHandles {
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  facebook: string;
  onlyfans: string;
  linkedin: string;
  spotify: string;
  website: string;
}

export interface ProfileData {
  displayName: string;
  bio: string;
  avatar: string;
  username: string;
  social: SocialHandles;
  extraText: string;
  extraPhoto: string;
  publications: Publication[];
}

export interface AppearanceData {
  backgroundId: string;
  customBg: string;
  themeId: string;
}

export interface PaymentsData {
  stripeUrl: string;
  buttonLabel: string;
  showButton: boolean;
}

export interface PageData {
  profile: ProfileData;
  links: LinkItem[];
  appearance: AppearanceData;
  payments: PaymentsData;
  isPublished: boolean;
}

export interface PageContextType {
  data: PageData;
  setProfile: (patch: Partial<ProfileData>) => void;
  setSocial: (patch: Partial<SocialHandles>) => void;
  setAppearance: (patch: Partial<AppearanceData>) => void;
  setPayments: (patch: Partial<PaymentsData>) => void;
  addLink: (link: Omit<LinkItem, "id">) => void;
  updateLink: (id: string, patch: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (ids: string[]) => void;
  toggleLink: (id: string) => void;
  addPublication: (pub: Omit<Publication, "id">) => void;
  updatePublication: (id: string, patch: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
  setPublished: (v: boolean) => void;
  setFullData: (data: PageData) => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_DATA: PageData = {
  profile: {
    displayName: "Maya",
    bio: "Brooklyn-based florist & event designer. Creating magic with blooms.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    username: "maya",
    social: {
      instagram: "https://instagram.com/maya_blooms",
      tiktok: "https://tiktok.com/@maya_blooms",
      youtube: "",
      twitter: "https://twitter.com/maya_blooms",
      facebook: "",
      onlyfans: "",
      linkedin: "",
      spotify: "",
      website: "https://mayablooms.com",
    },
    extraText: "For event inquiries, please email me directly.",
    extraPhoto: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&fit=crop",
    publications: [
      { id: "1", title: "Vogue Living", url: "#" },
      { id: "2", title: "Architectural Digest", url: "#" },
    ],
  },
  links: [
    { id: "L1", title: "Summer Workshop Series", url: "https://example.com/workshops", emoji: "🌸", visible: true },
    { id: "L2", title: "Waitlist for 2025 Weddings", url: "https://example.com/weddings", visible: true },
    { id: "L3", title: "Shop Dried Bouquets", url: "https://example.com/shop", visible: true },
  ],
  appearance: {
    backgroundId: "warm-sunrise",
    customBg: "",
    themeId: "warm-coral",
  },
  payments: {
    stripeUrl: "https://buy.stripe.com/test_maya",
    buttonLabel: "Book a 1:1 consultation",
    showButton: true,
  },
  isPublished: false,
};

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PageData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase
  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.full_data) {
        setData(profile.full_data as PageData);
      } else if (profile) {
        // If profile exists but no data, use current data but update username
        setData(prev => ({
          ...prev,
          profile: { ...prev.profile, username: profile.username || prev.profile.username }
        }));
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and auth listener
  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        refresh();
      } else if (event === "SIGNED_OUT") {
        setData(DEFAULT_DATA);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  // Helper to save to DB
  const saveToDb = useCallback(async (currentData: PageData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        username: currentData.profile.username,
        display_name: currentData.profile.displayName,
        is_published: currentData.isPublished,
        full_data: currentData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      console.log("Saved successfully");
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (isLoading) return;
    
    const saveTimeout = setTimeout(() => {
      saveToDb(data);
    }, 2000); // Save after 2s of no changes

    return () => clearTimeout(saveTimeout);
  }, [data, isLoading, saveToDb]);

  const setProfile = useCallback((patch: Partial<ProfileData>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  }, []);

  const setSocial = useCallback((patch: Partial<SocialHandles>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        social: { ...prev.profile.social, ...patch },
      },
    }));
  }, []);

  const setAppearance = useCallback((patch: Partial<AppearanceData>) => {
    setData((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...patch },
    }));
  }, []);

  const setPayments = useCallback((patch: Partial<PaymentsData>) => {
    setData((prev) => ({
      ...prev,
      payments: { ...prev.payments, ...patch },
    }));
  }, []);

  const addLink = useCallback((link: Omit<LinkItem, "id">) => {
    setData((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        { ...link, id: `L${Date.now()}` },
      ],
    }));
  }, []);

  const updateLink = useCallback((id: string, patch: Partial<LinkItem>) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    }));
  }, []);

  const deleteLink = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((link) => link.id !== id),
    }));
  }, []);

  const reorderLinks = useCallback((ids: string[]) => {
    setData((prev) => {
      const newLinks = ids.map((id) => prev.links.find((l) => l.id === id)!);
      return { ...prev, links: newLinks };
    });
  }, []);

  const toggleLink = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((link) =>
        link.id === id ? { ...link, visible: !link.visible } : link
      ),
    }));
  }, []);

  const addPublication = useCallback((pub: Omit<Publication, "id">) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        publications: [
          ...prev.profile.publications,
          { ...pub, id: `P${Date.now()}` },
        ],
      },
    }));
  }, []);

  const updatePublication = useCallback((id: string, patch: Partial<Publication>) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        publications: prev.profile.publications.map((pub) =>
          pub.id === id ? { ...pub, ...patch } : pub
        ),
      },
    }));
  }, []);

  const deletePublication = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        publications: prev.profile.publications.filter((pub) => pub.id !== id),
      },
    }));
  }, []);

  const setPublished = useCallback((v: boolean) => {
    setData((prev) => ({ ...prev, isPublished: v }));
  }, []);

  const setFullData = useCallback((newData: PageData) => {
    setData(newData);
  }, []);

  return (
    <PageContext.Provider
      value={{
        data,
        setProfile,
        setSocial,
        setAppearance,
        setPayments,
        addLink,
        updateLink,
        deleteLink,
        reorderLinks,
        toggleLink,
        addPublication,
        updatePublication,
        deletePublication,
        setPublished,
        setFullData,
        isLoading,
        refresh,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}
