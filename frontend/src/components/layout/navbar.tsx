"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, LayoutDashboard, BarChart3, Users, MessageSquare, Sparkles, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/copilot", label: "Copilot", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="glow-accent flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <Brain className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-fg">RecruitIQ</span>
            <span className="ml-1 font-light text-accent">AI</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-accent-soft text-accent ring-1 ring-inset ring-accent/25"
                  : "text-muted hover:bg-elevated hover:text-fg"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="glow-accent flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Sparkles className="h-4 w-4" />
          Get Started
        </Link>
      </div>
    </header>
  );
}
