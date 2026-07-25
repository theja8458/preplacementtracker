import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";

const StudyBuddyWidget = dynamic(
  () => import("@/components/StudyBuddyWidget"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: {
    default: "PlacementPrep — SVCE MCA",
    template: "%s | PlacementPrep",
  },
  description:
    "Track DSA progress, compete on leaderboards, and discuss problems — built for SVCE MCA students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0D0F1A] text-white antialiased">
        <SessionProvider>
          {children}
          <StudyBuddyWidget />
        </SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1D2E",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
