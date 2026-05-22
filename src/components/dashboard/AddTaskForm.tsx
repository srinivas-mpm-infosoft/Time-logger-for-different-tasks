"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

const schema = z.object({
  taskName: z.string().min(1, "Task name is required").max(200),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onCreate: (name: string, startImmediately?: boolean) => Promise<unknown>;
}

export function AddTaskForm({ onCreate }: Props) {
  const [startImmediately, setStartImmediately] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await onCreate(data.taskName, startImmediately);
    reset();
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        New Task
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <Input
            placeholder="What are you working on?"
            {...register("taskName")}
            className={`text-sm ${errors.taskName ? "border-destructive" : ""}`}
          />
          {errors.taskName && (
            <p className="text-xs text-destructive">{errors.taskName.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">Auto-start</span>
          </label>
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Add task
          </Button>
        </div>
      </form>
    </div>
  );
}
