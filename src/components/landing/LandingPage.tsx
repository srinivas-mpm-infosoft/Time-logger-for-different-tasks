"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Timer,
  Play,
  Pause,
  BarChart3,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: <Timer className="w-5 h-5" />,
    title: "Multi-task timers",
    description: "Run multiple timers simultaneously. Switch between tasks instantly without losing a second.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Drift-free accuracy",
    description: "Timestamp-based calculations ensure perfect accuracy even after page refresh or tab switching.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Daily summaries",
    description: "Automatic daily logs with total hours, task breakdowns, and productivity insights.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Private & secure",
    description: "Your data is isolated to your account. Google OAuth and email/password login supported.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Historical records",
    description: "Browse your complete time history by day, week, or month. Filter and search easily.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Global controls",
    description: "Pause or resume all active timers at once. Stop everything with a single click.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-24 sm:py-36">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1 text-xs font-medium">
              <Play className="w-3 h-3" />
              Multi-task time tracking
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Track every minute,
            <br />
            <span className="text-muted-foreground">across every task</span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            Run multiple timers simultaneously, pause and resume with precision, and get complete
            daily breakdowns — all with drift-free timestamp accuracy.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-6">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-6">
                Sign in
              </Button>
            </Link>
          </motion.div>

          {/* Demo timer preview */}
          <motion.div
            className="mt-16 relative max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
              <div className="border-b px-4 py-3 flex items-center gap-2 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">timetrack — dashboard</span>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { name: "Design review", time: "1:24:38", running: true, color: "bg-green-500" },
                  { name: "Backend API", time: "0:47:12", running: true, color: "bg-green-500" },
                  { name: "Client call", time: "0:32:05", running: false, color: "bg-yellow-500" },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.color} ${task.running ? "animate-pulse" : ""}`} />
                      <span className="text-sm font-medium">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold tabular-nums">{task.time}</span>
                      <div className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted cursor-pointer">
                        {task.running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Designed for professionals who need to track time accurately across multiple tasks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Start tracking today</h2>
          <p className="text-muted-foreground">
            Free to use. No credit card required. Sign in with Google or create an account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-6">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-6">
                Sign in with Google
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
