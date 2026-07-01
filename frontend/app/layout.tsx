import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "./print.css";

export const metadata: Metadata = {
  title: "ExamIQ — AI Exam Survival & PYQ Deduplication Engine",
  description: "Transform disorganized class notes and 10 years of PYQs into mark-scaled exam study shortlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans bg-[#090d16] text-[#f3f4f6] antialiased min-h-screen flex flex-col selection:bg-[#6366f1]/30 selection:text-white relative overflow-x-hidden"
      >
        {/* Subtle Ambient Architectural Grid & Glowing Orbs Backdrop */}
        <div className="fixed inset-0 pointer-events-none z-0 no-print">
          {/* Top Center Indigo Spotlight Glow */}
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.14)_0%,transparent_70%)] blur-3xl"></div>
          {/* Bottom Cyan Accent Glow */}
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] blur-3xl"></div>
          {/* Architectural Subtle Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
              backgroundSize: "4rem 4rem",
            }}
          ></div>
        </div>

        {/* Interactive Main Application Container */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

        {/* Real-time Agent Notifications Toaster */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#f3f4f6",
              border: "1px solid #1e293b",
              borderRadius: "1rem",
              padding: "0.85rem 1.25rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#111827",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
