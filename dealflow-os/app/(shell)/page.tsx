"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Briefcase,
  DollarSign,
  BarChart3,
  CheckSquare,
  CalendarDays,
  ArrowRight,
  Plus,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { cn, formatCurrency, formatRelativeDate, initials } from "@/lib/utils"

// ── Inline seed data ──────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: "Active Deals",
    value: "8",
    delta: "+2 this month",
    positive: true,
    icon: Briefcase,
    color: "text-[#0f2d5c]",
    bg: "bg-[#0f2d5c]/8",
  },
  {
    label: "Pipeline EV",
    value: "$2.4B",
    delta: "+$340M vs last qtr",
    positive: true,
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Avg EBITDA Multiple",
    value: "11.2×",
    delta: "-0.4× vs last qtr",
    positive: false,
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Closed YTD",
    value: "2",
    delta: "$680M total EV",
    positive: true,
    icon: TrendingUp,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
]

const ACTIVE_DEALS = [
  {
    id: "badia",
    company: "Badia Spices",
    sector: "Consumer / Food",
    stage: "loi",
    stageLabel: "LOI",
    ev: 950_000_000,
    ebitda: 85_000_000,
    multiple: "11.2×",
    banker: "Goldman Sachs",
    priority: "high",
    daysActive: 34,
    progress: 65,
  },
  {
    id: "meridian",
    company: "Meridian Logistics",
    sector: "Transportation",
    stage: "due_diligence",
    stageLabel: "Due Diligence",
    ev: 420_000_000,
    ebitda: 38_000_000,
    multiple: "11.1×",
    banker: "Jefferies",
    priority: "high",
    daysActive: 52,
    progress: 78,
  },
  {
    id: "nova",
    company: "Nova Health Systems",
    sector: "Healthcare",
    stage: "management_meeting",
    stageLabel: "Mgmt Meeting",
    ev: 280_000_000,
    ebitda: 24_000_000,
    multiple: "11.7×",
    banker: "William Blair",
    priority: "medium",
    daysActive: 18,
    progress: 35,
  },
  {
    id: "peak",
    company: "Peak Industrial",
    sector: "Industrials",
    stage: "initial_review",
    stageLabel: "Initial Review",
    ev: 190_000_000,
    ebitda: 19_000_000,
    multiple: "10.0×",
    banker: "Baird",
    priority: "low",
    daysActive: 7,
    progress: 15,
  },
]

const FOLLOW_UPS = [
  {
    id: "1",
    title: "Send revised LOI to Goldman",
    deal: "Badia Spices",
    due: "2026-04-23",
    overdue: false,
    priority: "urgent",
  },
  {
    id: "2",
    title: "Review Q1 financials — Meridian",
    deal: "Meridian Logistics",
    due: "2026-04-23",
    overdue: false,
    priority: "high",
  },
  {
    id: "3",
    title: "Schedule site visit with Nova mgmt",
    deal: "Nova Health Systems",
    due: "2026-04-22",
    overdue: true,
    priority: "medium",
  },
  {
    id: "4",
    title: "Follow up with Baird re: Peak teaser",
    deal: "Peak Industrial",
    due: "2026-04-21",
    overdue: true,
    priority: "low",
  },
]

const RECENT_MEETINGS = [
  {
    id: "m1",
    title: "Badia Spices — Management Presentation",
    deal: "Badia Spices",
    date: "2026-04-21",
    attendees: ["JD", "SR", "MK"],
    type: "Management Presentation",
  },
  {
    id: "m2",
    title: "Meridian — Quality of Earnings Kickoff",
    deal: "Meridian Logistics",
    date: "2026-04-19",
    attendees: ["JD", "TL"],
    type: "Diligence Call",
  },
  {
    id: "m3",
    title: "Goldman Process Update Call",
    deal: "Badia Spices",
    date: "2026-04-17",
    attendees: ["JD", "SR"],
    type: "Banker Call",
  },
]

const REENGAGE = [
  { id: "r1", company: "Apex Coatings", sector: "Industrials", lastContact: "2026-03-01", owner: "SR" },
  { id: "r2", company: "Crestwood Dental", sector: "Healthcare", lastContact: "2026-02-14", owner: "JD" },
  { id: "r3", company: "Blue Ridge Timber", sector: "Materials", lastContact: "2026-01-28", owner: "TL" },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, string> = {
  loi: "bg-violet-100 text-violet-700",
  due_diligence: "bg-sky-100 text-sky-700",
  management_meeting: "bg-amber-100 text-amber-700",
  initial_review: "bg-slate-100 text-slate-600",
  ic_approved: "bg-emerald-100 text-emerald-700",
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-slate-300",
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">{today}</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Deal
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <Card key={k.label} className="border-[#e5e7eb]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6b7280]">{k.label}</p>
                  <p className="mt-1.5 text-2xl font-semibold text-[#1a1a2e]">{k.value}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      k.positive ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {k.delta}
                  </p>
                </div>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", k.bg)}>
                  <k.icon className={cn("h-4.5 w-4.5", k.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Deals — spans 2 cols */}
        <div className="col-span-2 space-y-4">
          <Card className="border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-semibold text-[#1a1a2e]">Active Deals</CardTitle>
              <Link
                href="/deals"
                className="flex items-center gap-1 text-xs text-[#0f2d5c] hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="divide-y divide-[#f4f5f7]">
                {ACTIVE_DEALS.map((deal) => (
                  <div key={deal.id} className="flex items-center gap-4 py-3">
                    {/* Priority dot */}
                    <span
                      className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        PRIORITY_DOT[deal.priority]
                      )}
                    />

                    {/* Company + sector */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="truncate text-sm font-medium text-[#1a1a2e] hover:text-[#0f2d5c]"
                        >
                          {deal.company}
                        </Link>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            STAGE_COLORS[deal.stage]
                          )}
                        >
                          {deal.stageLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#9ca3af]">
                        {deal.sector} · {deal.banker}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={deal.progress} className="h-1 w-24" />
                        <span className="text-[10px] text-[#9ca3af]">{deal.progress}%</span>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-[#1a1a2e]">
                        {formatCurrency(deal.ev)}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9ca3af]">
                        {formatCurrency(deal.ebitda)} EBITDA · {deal.multiple}
                      </p>
                    </div>

                    {/* Days active */}
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs text-[#9ca3af]">{deal.daysActive}d active</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card className="border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-semibold text-[#1a1a2e]">Recent Meetings</CardTitle>
              <Link
                href="/meetings"
                className="flex items-center gap-1 text-xs text-[#0f2d5c] hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-3">
                {RECENT_MEETINGS.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-[#f4f5f7] bg-[#fafafa] p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0f2d5c]/8">
                      <CalendarDays className="h-4 w-4 text-[#0f2d5c]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1a1a2e]">{m.title}</p>
                      <p className="text-xs text-[#9ca3af]">
                        {m.type} · {formatRelativeDate(m.date)}
                      </p>
                    </div>
                    <div className="flex -space-x-1.5">
                      {m.attendees.map((a) => (
                        <Avatar key={a} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-[9px] bg-[#0f2d5c] text-white">
                            {a}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Follow-ups */}
          <Card className="border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-semibold text-[#1a1a2e]">
                Follow-ups
              </CardTitle>
              <Link
                href="/tasks"
                className="flex items-center gap-1 text-xs text-[#0f2d5c] hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {FOLLOW_UPS.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg p-2.5",
                      t.overdue ? "bg-red-50" : "bg-[#fafafa]"
                    )}
                  >
                    {t.overdue ? (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    ) : (
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#1a1a2e] leading-snug">
                        {t.title}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[10px]",
                          t.overdue ? "text-red-500" : "text-[#9ca3af]"
                        )}
                      >
                        {t.deal} · {t.overdue ? "Overdue" : "Today"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Re-engage list */}
          <Card className="border-[#e5e7eb]">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-semibold text-[#1a1a2e]">Re-engage</CardTitle>
              <span className="text-xs text-[#9ca3af]">gone cold</span>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {REENGAGE.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg bg-[#fafafa] p-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[10px] font-semibold text-[#6b7280]">
                      {initials(r.company)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#1a1a2e]">{r.company}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {r.sector} · last {formatRelativeDate(r.lastContact)}
                      </p>
                    </div>
                    <button className="shrink-0 text-[#0f2d5c] hover:text-[#0f2d5c]/70 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
