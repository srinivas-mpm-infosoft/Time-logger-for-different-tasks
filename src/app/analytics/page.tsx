import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      {/* Navbar is rendered in layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <AnalyticsClient />
      </main>
    </div>
  );
}
