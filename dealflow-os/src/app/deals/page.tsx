"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  ArrowRight,
  ChevronDown,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { cn, formatCurrency, formatRelativeDate, initials } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage =
  | "sourcing"
  | "initial_review"
  | "management_meeting"
  | "loi"
  | "due_diligence"
  | "ic_approved"
  | "closed"
  | "passed"

type Status = "active" | "closed" | "passed"
type Priority = "high" | "medium" | "low"

interface Deal {
  id: string
  company: string
  sector: string
  stage: Stage
  status: Status
  priority: Priority
  ev: number
  ebitda: number
  multiple: number
  revenueGrowth: number
  banker: string
  leadPartner: string
  team: string[]
  lastActivity: string
  icDate?: string
  closeDate?: string
  progress: number
  source: string
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const DEALS: Deal[] = [
  {
    id: "badia",
    company: "Badia Spices",
    sector: "Consumer / Food",
    stage: "loi",
    status: "active",
    priority: "high",
    ev: 952_000_000,
    ebitda: 85_000_000,
    multiple: 11.2,
    revenueGrowth: 14,
    banker: "Goldman Sachs",
    leadPartner: "JD",
    team: ["JD", "SR", "MK"],
    lastActivity: "2026-04-21",
    progress: 65,
    source: "Banker",
  },
  {
    id: "meridian",
    company: "Meridian Logistics",
    sector: "Transportation",
    stage: "due_diligence",
    status: "active",
    priority: "high",
    ev: 421_800_000,
    ebitda: 38_000_000,
    multiple: 11.1,
    revenueGrowth: 9,
    banker: "Jefferies",
    leadPartner: "SR",
    team: ["SR", "TL"],
    lastActivity: "2026-04-19",
    progress: 78,
    source: "Banker",
  },
  {
    id: "nova",
    company: "Nova Health Systems",
    sector: "Healthcare",
    stage: "management_meeting",
    status: "active",
    priority: "medium",
    ev: 280_800_000,
    ebitda: 24_000_000,
    multiple: 11.7,
    revenueGrowth: 22,
    banker: "William Blair",
    leadPartner: "JD",
    team: ["JD", "MK"],
    lastActivity: "2026-04-18",
    progress: 35,
    source: "Banker",
  },
  {
    id: "clearpath",
    company: "ClearPath Analytics",
    sector: "Technology",
    stage: "ic_approved",
    status: "active",
    priority: "high",
    ev: 162_000_000,
    ebitda: 9_000_000,
    multiple: 18.0,
    revenueGrowth: 52,
    banker: "Houlihan Lokey",
    leadPartner: "TL",
    team: ["TL", "SR"],
    lastActivity: "2026-04-22",
    icDate: "2026-04-20",
    progress: 92,
    source: "Proprietary",
  },
  {
    id: "peak",
    company: "Peak Industrial",
    sector: "Industrials",
    stage: "initial_review",
    status: "active",
    priority: "low",
    ev: 190_000_000,
    ebitda: 19_000_000,
    multiple: 10.0,
    revenueGrowth: 6,
    banker: "Baird",
    leadPartner: "MK",
    team: ["MK"],
    lastActivity: "2026-04-15",
    progress: 15,
    source: "Banker",
  },
  {
    id: "bluecrest",
    company: "BlueCrest Pharma",
    sector: "Healthcare",
    stage: "closed",
    status: "closed",
    priority: "high",
    ev: 680_000_000,
    ebitda: 62_000_000,
    multiple: 11.0,
    revenueGrowth: 17,
    banker: "Lazard",
    leadPartner: "JD",
    team: ["JD", "SR", "TL"],
    lastActivity: "2026-02-14",
    closeDate: "2026-02-14",
    progress: 100,
    source: "Banker",
  },
  {
    id: "vertexmfg",
    company: "Vertex Manufacturing",
    sector: "Industrials",
    stage: "passed",
    status: "passed",
    priority: "low",
    ev: 145_000_000,
    ebitda: 14_500_000,
    multiple: 10.0,
    revenueGrowth: 2,
    banker: "Lincoln International",
    leadPartner: "MK",
    team: ["MK"],
    lastActivity: "2026-03-10",
    progress: 30,
    source: "Banker",
  },
]

// ── Config ────────────────────────────────────────────────────────────────────

const STAGE_META: Record<Stage, { label: string; color: string }> = {
  sourcing:           { label: "Sourcing",        color: "bg-slate-100 text-slate-600"    },
  initial_review:     { label: "Initial Review",  color: "bg-sky-100 text-sky-700"        },
  management_meeting: { label: "Mgmt Meeting",    color: "bg-amber-100 text-amber-700"    },
  loi:                { label: "LOI",             color: "bg-violet-100 text-violet-700"  },
  due_diligence:      { label: "Due Diligence",   color: "bg-orange-100 text-orange-700"  },
  ic_approved:        { label: "IC Approved",     color: "bg-emerald-100 text-emerald-700"},
  closed:             { label: "Closed",          color: "bg-teal-100 text-teal-700"      },
  passed:             { label: "Passed",          color: "bg-rose-100 text-rose-700"      },
}

const PRIORITY_COLOR: Record<Priority, string> = {
  high:   "text-red-500",
  medium: "text-amber-500",
  low:    "text-slate-400",
}

const STATUS_ICON: Record<Status, React.ReactNode> = {
  active: <Clock className="h-3.5 w-3.5 text-[#0f2d5c]" />,
  closed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  passed: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
}

const STATUS_FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "all",    label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "passed", label: "Passed" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const [query, setQuery]           = useState("")
  const [statusFilter, setStatus]   = useState<Status | "all">("active")
  const [sortBy, setSortBy]         = useState<"ev" | "activity" | "progress">("activity")

  const filtered = useMemo(() => {
    let list = DEALS.filter((d) => {
      const q = query.toLowerCase()
      const matchQ =
        !q ||
        d.company.toLowerCase().includes(q) ||
        d.sector.toLowerCase().includes(q) ||
        d.banker.toLowerCase().includes(q)
      const matchS = statusFilter === "all" || d.status === statusFilter
      return matchQ && matchS
    })

    if (sortBy === "ev")       list = [...list].sort((a, b) => b.ev - a.ev)
    if (sortBy === "progress") list = [...list].sort((a, b) => b.progress - a.progress)
    if (sortBy === "activity") list = [...list].sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )

    return list
  }, [query, statusFilter, sortBy])

  const activeDeals  = DEALS.filter((d) => d.status === "active")
  const pipelineEV   = activeDeals.reduce((s, d) => s + d.ev, 0)
  const avgMultiple  = (activeDeals.reduce((s, d) => s + d.multiple, 0) / activeDeals.length).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Deal Rooms</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {activeDeals.length} active · {formatCurrency(pipelineEV)} pipeline EV · {avgMultiple}× avg
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Deal Room
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals…"
            className="h-8 w-56 pl-9 text-sm"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-[#0f2d5c] text-white"
                  : "bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 appearance-none rounded-md border border-[#e5e7eb] bg-white pl-3 pr-7 text-xs text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20"
          >
            <option value="activity">Sort: Recent activity</option>
            <option value="ev">Sort: EV (high–low)</option>
            <option value="progress">Sort: Progress</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9ca3af]" />
        </div>
      </div>

      {/* Deal cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] py-16 text-sm text-[#9ca3af]">
            No deals match your filters.
          </div>
        ) : (
          filtered.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="group flex items-center gap-4 rounded-xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Status icon */}
              <div className="shrink-0">{STATUS_ICON[deal.status]}</div>

              {/* Company + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-semibold text-[#1a1a2e] group-hover:text-[#0f2d5c] transition-colors">
                    {deal.company}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                      STAGE_META[deal.stage].color
                    )}
                  >
                    {STAGE_META[deal.stage].label}
                  </span>
                  {deal.priority === "high" && (
                    <Flame className={cn("h-3.5 w-3.5", PRIORITY_COLOR[deal.priority])} />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#9ca3af]">
                  {deal.sector} · {deal.banker} · {deal.source}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={deal.progress} className="h-1 w-28" />
                  <span className="text-[10px] text-[#9ca3af]">{deal.progress}%</span>
                </div>
              </div>

              {/* Financials */}
              <div className="hidden shrink-0 grid-cols-3 gap-6 text-right sm:grid">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-[#9ca3af]">EV</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1a1a2e]">{formatCurrency(deal.ev)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-[#9ca3af]">EBITDA</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1a1a2e]">{formatCurrency(deal.ebitda)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-[#9ca3af]">Multiple</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#1a1a2e]">{deal.multiple}×</p>
                </div>
              </div>

              {/* Team + activity */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <div className="flex -space-x-1.5">
                  {deal.team.map((m) => (
                    <Avatar key={m} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="bg-[#0f2d5c] text-[9px] font-semibold text-white">
                        {m}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-[10px] text-[#9ca3af]">
                  {formatRelativeDate(deal.lastActivity)}
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-4 w-4 shrink-0 text-[#d1d5db] transition-colors group-hover:text-[#0f2d5c]" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
