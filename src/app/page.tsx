"use client";

import React from "react";
import Link from "next/link";
import { PublicPage } from "./_components/PublicPage";
import { PhoneFrame } from "./_components/PhoneFrame";
import { EXAMPLES } from "./_lib/examples";
import { 
  HiOutlineSparkles, 
  HiOutlineCreditCard, 
  HiOutlineGlobeAlt, 
  HiOutlineDevicePhoneMobile 
} from "react-icons/hi2";
import { useAuth } from "./_lib/useAuth";

export default function LandingPage() {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-bg-cream selection:bg-primary-coral/20">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-cream/80 backdrop-blur-md border-b border-border-base px-6 py-4 flex items-center justify-between">
        <div className="font-display text-2xl tracking-tight text-text-primary">corner</div>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <Link 
              href="/dashboard"
              className="bg-text-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all font-sans"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login"
                className="text-sm font-bold text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors font-sans"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="bg-[#E8735A] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#E8735A]/20 hover:bg-[#E8735A]/90 transition-all font-sans"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-20 pb-10 md:pt-32 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] text-text-primary mb-8 animate-fade-up">
            Your corner of <br className="hidden md:block" /> the internet.
          </h1>
          <p 
            className="text-lg md:text-xl text-text-secondary max-w-[560px] leading-relaxed mb-10 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            Build a beautiful, designer-quality link-in-bio page in seconds. No code, just you and your creations.
          </p>
          <div 
            className="flex flex-col items-center lg:items-start gap-4 animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            <Link 
              href="/dashboard"
              className="bg-primary-coral text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl shadow-primary-coral/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create your page — it&apos;s free
            </Link>
            <span className="text-xs font-bold text-text-muted opacity-60">No credit card required. Start building for free.</span>
          </div>
        </div>
        
        <div className="relative animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="absolute -inset-4 bg-primary-coral/5 rounded-[60px] blur-3xl -z-10" />
          <img 
            src="/hero.png" 
            alt="Corner Preview" 
            className="w-full h-auto rounded-[40px] shadow-2xl border border-border-base/50"
          />
        </div>
      </header>

      {/* Example Pages */}
      <section className="w-full overflow-hidden px-6 pb-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 overflow-x-auto md:overflow-visible py-10 hide-scrollbar">
          {EXAMPLES.map((example, idx) => (
            <div 
              key={example.profile.username}
              className={`shrink-0 transition-transform duration-700 ${
                idx === 1 ? 'md:-translate-y-8' : ''
              }`}
            >
              <PhoneFrame innerWidth={320} innerHeight={640} scale={0.9}>
                <PublicPage 
                  profile={example.profile}
                  links={example.links}
                  appearance={example.appearance}
                  payments={example.payments}
                  animate={false}
                  interactive={false}
                />
              </PhoneFrame>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-24 md:py-32 px-6 border-y border-border-base">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {[
            { step: "1", title: "Build your page", body: "Add your bio, links, and photos in our intuitive live-preview editor." },
            { step: "2", title: "Sign up for free", body: "Save your work and claim your unique corner.link URL in one click." },
            { step: "3", title: "Publish when ready", body: "Go live and share your corner with your audience across all platforms." }
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <span className="font-display text-7xl text-primary-coral/20 mb-6">{item.step}</span>
              <h3 className="text-xl font-bold text-text-primary mb-3">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed text-sm md:text-base">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-24 md:gap-y-16">
          {[
            { 
              icon: HiOutlineSparkles, 
              title: "Themes worth using", 
              body: "Carefully curated color palettes and gradients that make your content pop." 
            },
            { 
              icon: HiOutlineCreditCard, 
              title: "Accept payments", 
              body: "Integrate Stripe payment links to sell products, services, or accept support." 
            },
            { 
              icon: HiOutlineGlobeAlt, 
              title: "Your own URL", 
              body: "Claim a clean, memorable corner.link/username that looks great in any bio." 
            },
            { 
              icon: HiOutlineDevicePhoneMobile, 
              title: "Beautiful on every device", 
              body: "Your page is automatically optimized for mobile, tablet, and desktop." 
            }
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="w-12 h-12 shrink-0 bg-primary-coral/10 text-primary-coral rounded-xl flex items-center justify-center">
                <feature.icon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h4>
                <p className="text-text-secondary leading-relaxed text-sm md:text-base">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 flex flex-col items-center text-center">
        <h2 className="font-display text-4xl md:text-6xl text-text-primary mb-10 max-w-2xl leading-tight">
          Ready to claim your corner?
        </h2>
        <Link 
          href="/dashboard"
          className="bg-primary-coral text-white px-10 py-5 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl shadow-primary-coral/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start building for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-base px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
        <div className="font-display text-2xl tracking-tight text-text-primary">corner</div>
        <div className="text-text-muted text-xs font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Corner Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
