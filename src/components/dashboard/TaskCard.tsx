"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { useTimer } from "@/hooks/useTimer";
import { formatDuration, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  task: Task;
  onAction: (id: string, action: "start" | "pause" | "resume" | "stop" | "complete") => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const statusConfig = {
  running: { label: "Running", class: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  paused: { label: "Paused", class: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  stopped: { label: "Stopped", class: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Completed", class: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
};

export function TaskCard({ task, onAction, onEdit, onDelete }: Props) {
  const elapsed = useTimer(task);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.taskName);
  const [isActing, setIsActing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleAction = async (action: "start" | "pause" | "resume" | "stop" | "complete") => {
    if (isActing) return;
    setIsActing(true);
    try {
      await onAction(task._id, action);
    } finally {
      setIsActing(false);
    }
  };

  const handleEdit = async () => {
    if (!editName.trim() || editName === task.taskName) {
      setIsEditing(false);
      setEditName(task.taskName);
      return;
    }
    await onEdit(task._id, editName.trim());
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    await onDelete(task._id);
  };

  const status = statusConfig[task.status];
  const isRunning = task.status === "running";
  const isPaused = task.status === "paused";
  const isStopped = task.status === "stopped" || task.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`rounded-xl border bg-card p-4 transition-shadow hover:shadow-md ${isRunning ? "border-green-500/30" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: name + status */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${status.class}`}>
              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />}
              {status.label}
            </Badge>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                  if (e.key === "Escape") { setIsEditing(false); setEditName(task.taskName); }
                }}
                className="h-8 text-sm font-medium"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleEdit}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => { setIsEditing(false); setEditName(task.taskName); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <h3 className="font-semibold text-base truncate">{task.taskName}</h3>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started {task.createdAt ? formatTime(task.createdAt) : "--"}
            </span>
            {task.updatedAt && (
              <span>Updated {formatTime(task.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Center: timer */}
        <div className="flex items-center gap-3">
          <div className={`text-center ${isRunning ? "timer-running" : ""}`}>
            <div className="font-mono text-2xl font-bold tabular-nums tracking-tight">
              {formatDuration(elapsed)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">elapsed</div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5">
          {/* Play/Pause/Resume */}
          {isRunning && (
            <Button
              size="icon"
              variant="outline"
              className="w-9 h-9"
              onClick={() => handleAction("pause")}
              disabled={isActing}
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </Button>
          )}
          {isPaused && (
            <Button
              size="icon"
              variant="outline"
              className="w-9 h-9"
              onClick={() => handleAction("resume")}
              disabled={isActing}
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          {(isRunning || isPaused) && (
            <Button
              size="icon"
              variant="outline"
              className="w-9 h-9"
              onClick={() => handleAction("stop")}
              disabled={isActing}
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </Button>
          )}
          {isStopped && task.status !== "completed" && (
            <Button
              size="icon"
              variant="outline"
              className="w-9 h-9"
              onClick={() => handleAction("start")}
              disabled={isActing}
              title="Restart"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          {(isRunning || isPaused) && (
            <Button
              size="icon"
              variant="outline"
              className="w-9 h-9 text-blue-500 hover:text-blue-600"
              onClick={() => handleAction("complete")}
              disabled={isActing}
              title="Mark complete"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}

          {/* Edit */}
          {!isEditing && (
            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9"
              onClick={() => setIsEditing(true)}
              title="Edit name"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Delete */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-9 h-9 text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete task?</DialogTitle>
                <DialogDescription>
                  This will permanently delete &quot;{task.taskName}&quot; and all its time data. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar for running tasks */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 h-0.5 bg-muted rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3600, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
