import Link from "next/link";
import { Timer } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Timer className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              TimeTrack
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional multi-task time tracking. Run multiple timers simultaneously with drift-free accuracy.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/history" className="hover:text-foreground transition-colors">History</Link></li>
              <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} TimeTrack. Built with Next.js & MongoDB.
        </div>
      </div>
    </footer>
  );
}
