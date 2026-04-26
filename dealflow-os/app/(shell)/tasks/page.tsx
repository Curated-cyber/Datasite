"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus, Search, Flag, Circle, CheckCircle2, ChevronDown,
  CalendarDays, Tag, AlertCircle, Clock, Minus,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "urgent" | "high" | "medium" | "low"
type Status   = "todo" | "in_progress" | "done"

interface Task {
  id: string
  title: string
  deal?: string
  dealId?: string
  assignee: string
  dueDate: string
  priority: Priority
  status: Status
  notes?: string
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  // Overdue
  { id: "t01", title: "Follow up with Goldman re: LOI markup",     deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-21", priority: "urgent", status: "todo" },
  { id: "t02", title: "Request 5-yr historical P&L from Goldman",  deal: "Badia Spices",       dealId: "badia",     assignee: "MK", dueDate: "2026-04-20", priority: "high",   status: "todo" },
  { id: "t03", title: "Schedule site visit — Miami plant",         deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-19", priority: "high",   status: "todo" },
  { id: "t04", title: "Obtain Meridian fleet ownership schedule",  deal: "Meridian Logistics", dealId: "meridian",  assignee: "SR", dueDate: "2026-04-22", priority: "medium", status: "todo" },

  // Today
  { id: "t05", title: "Send revised LOI draft to partner review",  deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-23", priority: "urgent", status: "in_progress" },
  { id: "t06", title: "Share data room access with FTI",           deal: "Meridian Logistics", dealId: "meridian",  assignee: "SR", dueDate: "2026-04-23", priority: "high",   status: "todo" },
  { id: "t07", title: "Research TN dental platform M&A comps",     deal: "Nova Health Systems",dealId: "nova",      assignee: "MK", dueDate: "2026-04-23", priority: "medium", status: "todo" },

  // This week
  { id: "t08", title: "Complete 5-year financial model",           deal: "Badia Spices",       dealId: "badia",     assignee: "SR", dueDate: "2026-04-25", priority: "high",   status: "in_progress" },
  { id: "t09", title: "Schedule QoE kickoff with FTI",             deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-26", priority: "high",   status: "todo" },
  { id: "t10", title: "Management reference checks (×3)",          deal: "Badia Spices",       dealId: "badia",     assignee: "MK", dueDate: "2026-04-28", priority: "medium", status: "todo" },
  { id: "t11", title: "Issue exclusivity letter to Houlihan",      deal: "ClearPath Analytics",dealId: "clearpath", assignee: "JD", dueDate: "2026-04-24", priority: "urgent", status: "todo" },
  { id: "t12", title: "Debt financing outreach — JPM, BofA",       deal: "Badia Spices",       dealId: "badia",     assignee: "SR", dueDate: "2026-05-01", priority: "medium", status: "todo" },
  { id: "t13", title: "Send preliminary model to JPM credit",      deal: "Badia Spices",       dealId: "badia",     assignee: "SR", dueDate: "2026-04-27", priority: "medium", status: "todo" },

  // Done
  { id: "t14", title: "Review NDA carve-outs with legal",          deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-22", priority: "medium", status: "done" },
  { id: "t15", title: "Engage Simpson Thacher for ClearPath legal",deal: "ClearPath Analytics",dealId: "clearpath", assignee: "JD", dueDate: "2026-04-22", priority: "high",   status: "done" },
  { id: "t16", title: "Confirm bid participation with Goldman",     deal: "Badia Spices",       dealId: "badia",     assignee: "JD", dueDate: "2026-04-22", priority: "urgent", status: "done" },
]

const TODAY      = "2026-04-23"
const END_WEEK   = "2026-04-29"

// ── Config ────────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<Priority, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "text-red-500",    dot: "bg-red-500"    },
  high:   { label: "High",   color: "text-orange-500", dot: "bg-orange-400" },
  medium: { label: "Medium", color: "text-amber-500",  dot: "bg-amber-400"  },
  low:    { label: "Low",    color: "text-slate-400",  dot: "bg-slate-300"  },
}

const ASSIGNEE_COLOR: Record<string, string> = {
  JD: "bg-[#0f2d5c]",
  SR: "bg-violet-600",
  MK: "bg-emerald-600",
  TL: "bg-amber-600",
}

const VIEWS = ["Today", "This Week", "Overdue", "All Open", "Done"] as const
type View = (typeof VIEWS)[number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string) {
  return dueDate < TODAY
}

function isToday(dueDate: string) {
  return dueDate === TODAY
}

function isThisWeek(dueDate: string) {
  return dueDate >= TODAY && dueDate <= END_WEEK
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggle,
}: {
  task: Task
  onToggle: (id: string) => void
}) {
  const done     = task.status === "done"
  const overdue  = !done && isOverdue(task.dueDate)
  const pm       = PRIORITY_META[task.priority]

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#f4f5f7]",
        done && "opacity-50"
      )}
    >
      {/* Complete toggle */}
      <button
        onClick={() => onToggle(task.id)}
        className="shrink-0 text-[#d1d5db] hover:text-emerald-500 transition-colors"
      >
        {done
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          : <Circle className="h-4 w-4" />
        }
      </button>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <span className={cn("text-sm text-[#1a1a2e]", done && "line-through text-[#9ca3af]")}>
          {task.title}
        </span>
        {task.deal && (
          <span className="ml-2 rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">
            {task.deal}
          </span>
        )}
      </div>

      {/* Assignee */}
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarFallback className={cn("text-[8px] font-bold text-white", ASSIGNEE_COLOR[task.assignee] ?? "bg-slate-500")}>
          {task.assignee}
        </AvatarFallback>
      </Avatar>

      {/* Due date */}
      <span
        className={cn(
          "shrink-0 text-xs",
          overdue    ? "font-medium text-red-500"
          : isToday(task.dueDate) ? "font-medium text-[#0f2d5c]"
          : "text-[#9ca3af]"
        )}
      >
        {overdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
      </span>

      {/* Priority flag */}
      <Flag className={cn("h-3.5 w-3.5 shrink-0", pm.color)} />
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  tasks,
  icon,
  accent,
  onToggle,
}: {
  title: string
  tasks: Task[]
  icon: React.ReactNode
  accent?: string
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  if (tasks.length === 0) return null

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
      <button
        className="flex w-full items-center gap-2 border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-2.5 text-left hover:bg-[#f4f5f7] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={cn("flex items-center gap-1.5 text-xs font-semibold", accent ?? "text-[#1a1a2e]")}>
          {icon}
          {title}
        </span>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e5e7eb] text-[9px] font-semibold text-[#6b7280]">
          {tasks.length}
        </span>
        <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-[#9ca3af] transition-transform", !open && "-rotate-90")} />
      </button>
      {open && (
        <div className="divide-y divide-[#f9fafb] px-1 py-1">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Add Task modal ────────────────────────────────────────────────────────────

function AddTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Task</label>
            <Input placeholder="What needs to be done?" className="h-8 text-sm" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Deal</label>
              <select className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20">
                <option value="">No deal</option>
                <option>Badia Spices</option>
                <option>Meridian Logistics</option>
                <option>Nova Health Systems</option>
                <option>ClearPath Analytics</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Assignee</label>
              <select className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20">
                <option>JD</option>
                <option>SR</option>
                <option>MK</option>
                <option>TL</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Due Date</label>
              <Input type="date" className="h-8 text-sm" defaultValue={TODAY} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Priority</label>
              <select className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20">
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={onClose}>Add Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [view, setView]         = useState<View>("Today")
  const [query, setQuery]       = useState("")
  const [showModal, setModal]   = useState(false)
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(TASKS.map((t) => [t.id, t.status]))
  )

  const tasks = useMemo(
    () => TASKS.map((t) => ({ ...t, status: statuses[t.id] ?? t.status })),
    [statuses]
  )

  function toggle(id: string) {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "done" ? "todo" : "done",
    }))
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.deal?.toLowerCase().includes(q)) return false
      const done = t.status === "done"
      if (view === "Today")     return !done && isToday(t.dueDate)
      if (view === "This Week") return !done && isThisWeek(t.dueDate) && !isOverdue(t.dueDate)
      if (view === "Overdue")   return !done && isOverdue(t.dueDate)
      if (view === "All Open")  return !done
      if (view === "Done")      return done
      return true
    })
  }, [tasks, view, query])

  // Stats
  const overdueCt  = tasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate)).length
  const todayCt    = tasks.filter((t) => t.status !== "done" && isToday(t.dueDate)).length
  const openCt     = tasks.filter((t) => t.status !== "done").length
  const doneCt     = tasks.filter((t) => t.status === "done").length

  // Group for "All Open" and "This Week" by deal; flat otherwise
  const sections = useMemo(() => {
    if (view === "Done" || view === "Today" || view === "Overdue") {
      return [{ title: view, tasks: filtered, icon: null }]
    }
    if (view === "This Week") {
      const byDeal = new Map<string, Task[]>()
      filtered.forEach((t) => {
        const key = t.deal ?? "No Deal"
        if (!byDeal.has(key)) byDeal.set(key, [])
        byDeal.get(key)!.push(t)
      })
      return Array.from(byDeal.entries()).map(([deal, ts]) => ({ title: deal, tasks: ts, icon: null }))
    }
    // All Open — group by priority
    const groups: { priority: Priority; tasks: Task[] }[] = [
      { priority: "urgent", tasks: filtered.filter((t) => t.priority === "urgent") },
      { priority: "high",   tasks: filtered.filter((t) => t.priority === "high")   },
      { priority: "medium", tasks: filtered.filter((t) => t.priority === "medium") },
      { priority: "low",    tasks: filtered.filter((t) => t.priority === "low")    },
    ]
    return groups
      .filter((g) => g.tasks.length > 0)
      .map((g) => ({ title: PRIORITY_META[g.priority].label, tasks: g.tasks, icon: null }))
  }, [filtered, view])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Tasks</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {openCt} open · {doneCt} done
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal(true)}>
          <Plus className="h-3.5 w-3.5" /> New Task
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Overdue",   value: overdueCt, color: "text-red-500",    bg: "bg-red-50",    icon: <AlertCircle className="h-4 w-4" /> },
          { label: "Due Today", value: todayCt,   color: "text-[#0f2d5c]",  bg: "bg-[#0f2d5c]/8", icon: <Clock className="h-4 w-4" /> },
          { label: "Open",      value: openCt,    color: "text-amber-600",  bg: "bg-amber-50",  icon: <Circle className="h-4 w-4" /> },
          { label: "Done",      value: doneCt,    color: "text-emerald-600",bg: "bg-emerald-50",icon: <CheckCircle2 className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg, s.color)}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-semibold text-[#1a1a2e]">{s.value}</p>
              <p className="text-xs text-[#9ca3af]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View tabs + search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                view === v
                  ? "bg-[#0f2d5c] text-white"
                  : "bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb]"
              )}
            >
              {v}
              {v === "Overdue" && overdueCt > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {overdueCt}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tasks…"
            className="h-8 w-48 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] py-16 text-sm text-[#9ca3af]">
          <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-300" />
          {view === "Today" ? "Nothing due today — nice work." : "No tasks in this view."}
        </div>
      ) : view === "Today" || view === "Overdue" || view === "Done" ? (
        <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
          <div className="divide-y divide-[#f9fafb] px-1 py-1">
            {filtered.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggle} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => (
            <Section
              key={s.title}
              title={s.title}
              tasks={s.tasks}
              icon={<Tag className="h-3 w-3" />}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      <AddTaskModal open={showModal} onClose={() => setModal(false)} />
    </div>
  )
}
