import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { HistoryClient } from "@/components/history/HistoryClient";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <HistoryClient />
    </div>
  );
}
