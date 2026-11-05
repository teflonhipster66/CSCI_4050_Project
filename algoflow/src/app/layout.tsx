import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./index.css";
import { Icon } from "@/components/study-ui";
import { StudyHeader, StudyNavigation } from "@/components/study-navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoFlow",
  description: "Study algorithms with visual, step-by-step practice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-sketch"><span /><span /><span /></div><span>AlgoFlow</span></div>
        <StudyNavigation />
        <div className="chapter-list"><p>In this drill</p><div className="chapter done"><span>✓</span><div><strong>Learn the shape</strong><small>Complete</small></div></div><div className="chapter current"><span>2</span><div><strong>Make the choice</strong><small>You are here</small></div></div><div className="chapter"><span>3</span><div><strong>Spot the pattern</strong><small>Up next</small></div></div></div>
        <div className="sidebar-note"><span>Remember</span><p>Understand the move.<br />Don’t memorize it.</p><svg viewBox="0 0 120 18" aria-hidden="true"><path d="M2 11c18-6 38 4 58-1s40 3 58-2" /></svg></div>
        <button className="nav-item settings"><Icon name="settings" />Settings</button>
      </aside>

          <main className="main">
            <StudyHeader />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
