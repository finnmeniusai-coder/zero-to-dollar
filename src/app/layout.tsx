import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { PageProvider } from "./_state/PageContext";
import { ToastProvider } from "./_components/Toast";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Corner | Your personal corner of the internet",
  description: "Create a beautiful, designer-quality link-in-bio page in seconds. Build your digital identity with Corner.",
  keywords: ["link in bio", "digital business card", "personal website", "creator tools"],
  authors: [{ name: "Corner Inc." }],
  openGraph: {
    title: "Corner | Your personal corner of the internet",
    description: "Build a stunning link-in-bio page in seconds.",
    url: "https://corner.link",
    siteName: "Corner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corner | Your personal corner of the internet",
    description: "Build a stunning link-in-bio page in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="h-full font-sans text-text-primary">
        <PageProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </PageProvider>
      </body>
    </html>
  );
}
