import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AgentAtlas — Interactive Agentic Architectures",
  description: "17 agentic architecture patterns explained with interactive flow diagrams, real code, and step-by-step walkthroughs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-slate-900 text-lg tracking-tight">
              Agent<span className="text-indigo-600">Atlas</span>
            </Link>
            <div className="flex items-center gap-1">
              <NavLink href="/architectures">Gallery</NavLink>
              <NavLink href="/compare">Compare</NavLink>
              <NavLink href="/beyond-llms">Beyond LLMs ⚡</NavLink>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      {children}
    </Link>
  );
}
