"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart3, History, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              TimeTrack
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>

            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>

            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
            </Link>
          </nav>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-muted"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-2 space-y-1">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Button>
            </Link>

            <Link href="/analytics" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <BarChart3 className="w-4 h-4" /> Analytics
              </Button>
            </Link>

            <Link href="/history" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <History className="w-4 h-4" /> History
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
