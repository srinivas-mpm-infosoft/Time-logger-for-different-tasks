import { create } from "zustand";
import { Task } from "@/types";
import { getCurrentElapsed } from "@/lib/utils";

interface TimerState {
  tasks: Task[];
  isLoading: boolean;
  searchQuery: string;
  filterStatus: "all" | "running" | "paused" | "stopped" | "completed";
  sortBy: "createdAt" | "totalTime" | "taskName";

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: TimerState["filterStatus"]) => void;
  setSortBy: (sort: TimerState["sortBy"]) => void;

  getElapsed: (taskId: string) => number;
  getFilteredTasks: () => Task[];
  getRunningCount: () => number;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  tasks: [],
  isLoading: true,
  searchQuery: "",
  filterStatus: "all",
  sortBy: "createdAt",

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === taskId ? { ...t, ...updates } : t)),
    })),
  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSortBy: (sort) => set({ sortBy: sort }),

  getElapsed: (taskId) => {
    const task = get().tasks.find((t) => t._id === taskId);
    if (!task) return 0;
    return getCurrentElapsed(task);
  },

  getFilteredTasks: () => {
    const { tasks, searchQuery, filterStatus, sortBy } = get();
    let filtered = tasks;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.taskName.toLowerCase().includes(q));
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "totalTime") return getCurrentElapsed(b) - getCurrentElapsed(a);
      if (sortBy === "taskName") return a.taskName.localeCompare(b.taskName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  getRunningCount: () => get().tasks.filter((t) => t.isRunning).length,
}));
