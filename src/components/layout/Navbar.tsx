@@
 export function Navbar() {
@@
           {/* Desktop nav */}
           {session && (
             <div className="hidden md:flex items-center gap-1">
               <Link href="/dashboard">
                 <Button variant="ghost" size="sm" className="gap-2">
                   <LayoutDashboard className="w-4 h-4" />
                   Dashboard
                 </Button>
               </Link>
+              <Link href="/analytics">
+                <Button variant="ghost" size="sm" className="gap-2">
+                  <LayoutDashboard className="w-4 h-4" />
+                  Analytics
+                </Button>
+              </Link>
               <Link href="/history">
                 <Button variant="ghost" size="sm" className="gap-2">
                   <History className="w-4 h-4" />
                   History
                 </Button>
               </Link>
@@
             <div className="md:hidden border-t py-2 space-y-1">
               <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                 <Button variant="ghost" className="w-full justify-start gap-2">
                   <LayoutDashboard className="w-4 h-4" /> Dashboard
                 </Button>
               </Link>
+              <Link href="/analytics" onClick={() => setMobileOpen(false)}>
+                <Button variant="ghost" className="w-full justify-start gap-2">
+                  <LayoutDashboard className="w-4 h-4" /> Analytics
+                </Button>
+              </Link>
               <Link href="/history" onClick={() => setMobileOpen(false)}>
                 <Button variant="ghost" className="w-full justify-start gap-2">
                   <History className="w-4 h-4" /> History
                 </Button>
               </Link>
