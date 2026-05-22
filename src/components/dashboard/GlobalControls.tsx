"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, Loader2 } from "lucide-react";

interface Props {
  onBulkAction: (action: "pause-all" | "resume-all" | "stop-all") => Promise<void>;
  runningCount: number;
}

export function GlobalControls({ onBulkAction, runningCount }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: "pause-all" | "resume-all" | "stop-all") => {
    setLoading(action);
    try {
      await onBulkAction(action);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground mr-1">All timers:</span>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={() => handle("pause-all")}
        disabled={loading !== null || runningCount === 0}
      >
        {loading === "pause-all" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
        Pause all
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={() => handle("resume-all")}
        disabled={loading !== null}
      >
        {loading === "resume-all" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        Resume all
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs text-destructive hover:text-destructive"
        onClick={() => handle("stop-all")}
        disabled={loading !== null}
      >
        {loading === "stop-all" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
        Stop all
      </Button>
    </div>
  );
}
