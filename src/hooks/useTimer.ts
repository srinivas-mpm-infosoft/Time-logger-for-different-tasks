"use client";

import { useState, useEffect, useRef } from "react";
import { getCurrentElapsed } from "@/lib/utils";
import { Task } from "@/types";

export function useTimer(task: Task) {
  const [elapsed, setElapsed] = useState(() => getCurrentElapsed(task));
  const animRef = useRef<number | null>(null);
  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    setElapsed(getCurrentElapsed(taskRef.current));

    if (!task.isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const tick = () => {
      setElapsed(getCurrentElapsed(taskRef.current));
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [task.isRunning, task.startedAt, task.accumulatedTime, task._id]);

  return elapsed;
}
