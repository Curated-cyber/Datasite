"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft, Flame, MoreHorizontal, Plus, CheckSquare2,
  FileText, FolderOpen, CalendarDays, GitBranch, BookOpen,
  Circle, CheckCircle2, AlertTriangle, Clock, TrendingUp,
  Building2, Users, DollarSign, BarChart3, Mail, Download,
  Flag, ChevronRight,
} from "lucide-react"
import { cn, formatCurrency, formatDate, formatRelativeDate, initials } from "@/lib/utils"

// ── Seed data (Badia Spices fallback for any id) ──────────────────────────────

const DEAL = {
  id: "badia",
  company: "Badia Spices",
  sector: "Consumer / Food",
  hq: "Miami, FL",
  founded: 1967,
  employees: 420,
  website: "badiaspices.com",
  stage: "loi",
  stageLabel: "LOI",
  status: "active",
  priority: "high",
  ev: 952_000_000,
  equity: 680_000_000,
  debt: 272_000_000,
  ebitda: 85_000_000,
  revenue: 310_000_000,
  ebitdaMargin: 27.4,
  revenueGrowth: 14,
  multiple: 11.2,
  banker: "Goldman Sachs",
  bankerContact: "Marcus Reinholt",
  leadPartner: "James Dixon",
  team: [
    { initials: "JD", name: "James Dixon",   role: "Lead Partner" },
    { initials: "SR", name: "Sarah Reynolds", role: "VP" },
    { initials: "MK", name: "Mike Kantor",    role: "Analyst" },
  ],
  source: "Banker",
  processDeadline: "2026-05-12",
  icDate: "2026-05-20",
  description:
    "Badia Spices is a leading manufacturer and distributor of spices, herbs, and seasonings with a 55-year operating history. The company sells through all major US grocery chains and has a growing international presence across Latin America and the Caribbean. Family-owned and operated, Badia is pursuing a minority recapitalization to fund continued growth.",
  progress: 65,
  daysActive: 34,
}

const NOTES = [
  {
    id: "n1",
    type: "meeting",
    title: "Management Presentation — Full Team",
    date: "2026-04-21",
    author: "James Dixon",
    content:
      "Strong management team led by third-generation family ownership. Sofia Badia presented a compelling organic growth story with margin expansion opportunity through SKU rationalization. Key risks: customer concentration (Walmart ~28% of revenue) and raw material inflation. Action items: (1) request 5-yr historical P&L, (2) follow up on private label dynamics, (3) schedule plant tour.",
    tags: ["management", "key meeting"],
  },
  {
    id: "n2",
    type: "meeting",
    title: "Goldman Process Update Call",
    date: "2026-04-17",
    author: "Sarah Reynolds",
    content:
      "Marcus confirmed 6 parties in round 2. Bid deadline May 12. Expects 9–12× range from strategics. Goldman pushing hard on management rollover — Sofia willing to roll 15–20%. Debt market supportive at 5.5× leverage per JPM.",
    tags: ["process", "banker"],
  },
  {
    id: "n3",
    type: "note",
    title: "Competitive Landscape — Initial Notes",
    date: "2026-04-14",
    author: "Mike Kantor",
    content:
      "Primary competitors: McCormick (public, ~$6B revenue), Goya Foods (private), and regional players. Badia's competitive moat is brand loyalty within Hispanic/Latin American households and SKU breadth (1,400+ SKUs). Private label risk is real but margins have held.",
    tags: ["diligence", "market"],
  },
]

const FILES = [
  { id: "f1", name: "Badia Spices — CIM.pdf",                category: "market",      size: "8.2 MB",  date: "2026-04-10", uploader: "MK" },
  { id: "f2", name: "FY2023 Audited Financials.pdf",          category: "financials",  size: "3.4 MB",  date: "2026-04-12", uploader: "SR" },
  { id: "f3", name: "FY2024 Management Accounts.xlsx",        category: "financials",  size: "1.1 MB",  date: "2026-04-12", uploader: "SR" },
  { id: "f4", name: "5-Year Financial Model (Draft).xlsx",    category: "financials",  size: "2.8 MB",  date: "2026-04-18", uploader: "SR" },
  { id: "f5", name: "Management Presentation Deck.pdf",       category: "management",  size: "12.6 MB", date: "2026-04-21", uploader: "JD" },
  { id: "f6", name: "Org Chart & Bios.pdf",                   category: "management",  size: "0.9 MB",  date: "2026-04-21", uploader: "MK" },
  { id: "f7", name: "LOI Draft v1.docx",                      category: "legal",       size: "0.2 MB",  date: "2026-04-22", uploader: "JD" },
  { id: "f8", name: "NDA — Executed.pdf",                     category: "legal",       size: "0.1 MB",  date: "2026-04-08", uploader: "JD" },
]

const TASKS = [
  { id: "t1", title: "Send revised LOI to Goldman",            assignee: "JD", due: "2026-04-23", priority: "urgent", status: "todo"        },
  { id: "t2", title: "Complete 5-year financial model",        assignee: "SR", due: "2026-04-25", priority: "high",   status: "in_progress" },
  { id: "t3", title: "Schedule QoE kickoff with FTI",          assignee: "JD", due: "2026-04-26", priority: "high",   status: "todo"        },
  { id: "t4", title: "Management reference checks (×3)",       assignee: "MK", due: "2026-04-28", priority: "medium", status: "todo"        },
  { id: "t5", title: "Legal — review NDA carve-outs",          assignee: "JD", due: "2026-04-24", priority: "medium", status: "done"        },
  { id: "t6", title: "Request 5-yr historical P&L from mgmt",  assignee: "MK", due: "2026-04-22", priority: "high",   status: "done"        },
  { id: "t7", title: "Debt financing outreach — JPM, BofA, GS", assignee: "SR", due: "2026-05-01", priority: "medium", status: "todo"       },
]

const DILIGENCE = [
  {
    id: "d1", name: "Financial Due Diligence",  owner: "SR", status: "in_progress", progress: 45,
    due: "2026-05-05",
    items: [
      { id: "i1", title: "Quality of Earnings",          status: "in_progress" },
      { id: "i2", title: "Working Capital Analysis",     status: "not_started"  },
      { id: "i3", title: "Debt & Cap Table Review",      status: "not_started"  },
      { id: "i4", title: "5-Year Model Build",           status: "in_progress"  },
    ],
  },
  {
    id: "d2", name: "Commercial Due Diligence", owner: "JD", status: "in_progress", progress: 30,
    due: "2026-05-08",
    items: [
      { id: "i5", title: "Market Sizing & TAM",          status: "complete"     },
      { id: "i6", title: "Customer Reference Calls",     status: "in_progress"  },
      { id: "i7", title: "Competitive Analysis",         status: "in_progress"  },
      { id: "i8", title: "Channel & Distribution",       status: "not_started"  },
    ],
  },
  {
    id: "d3", name: "Legal & Compliance",       owner: "JD", status: "not_started", progress: 10,
    due: "2026-05-10",
    items: [
      { id: "i9",  title: "Corporate Structure Review",  status: "in_progress"  },
      { id: "i10", title: "IP & Trademark Audit",        status: "not_started"  },
      { id: "i11", title: "Litigation Check",            status: "not_started"  },
    ],
  },
  {
    id: "d4", name: "Management & HR",          owner: "MK", status: "not_started", progress: 0,
    due: "2026-05-12",
    items: [
      { id: "i12", title: "Key Person Assessment",       status: "not_started"  },
      { id: "i13", title: "Comp & Benefits Review",      status: "not_started"  },
    ],
  },
  {
    id: "d5", name: "IT & Systems",             owner: "MK", status: "not_started", progress: 0,
    due: "2026-05-12",
    items: [
      { id: "i14", title: "ERP & Tech Stack Review",     status: "not_started"  },
      { id: "i15", title: "Cybersecurity Assessment",    status: "not_started"  },
    ],
  },
]

const TIMELINE = [
  { id: "e1", date: "2026-04-22", type: "task",    text: "LOI Draft v1 uploaded by James Dixon" },
  { id: "e2", date: "2026-04-21", type: "meeting", text: "Management Presentation held — 3 attendees" },
  { id: "e3", date: "2026-04-21", type: "file",    text: "Management Presentation Deck uploaded" },
  { id: "e4", date: "2026-04-18", type: "file",    text: "5-Year Financial Model (Draft) uploaded by SR" },
  { id: "e5", date: "2026-04-17", type: "meeting", text: "Goldman Process Update Call — notes added" },
  { id: "e6", date: "2026-04-14", type: "note",    text: "Competitive landscape notes added by Mike Kantor" },
  { id: "e7", date: "2026-04-12", type: "file",    text: "FY2023 Audited Financials & FY2024 Mgmt Accounts uploaded" },
  { id: "e8", date: "2026-04-10", type: "file",    text: "CIM received from Goldman Sachs" },
  { id: "e9", date: "2026-04-08", type: "task",    text: "Deal room created · NDA executed" },
]

const IC_MEMO = `## Investment Thesis

Badia Spices represents a compelling opportunity to partner with a category-leading spices and seasonings platform benefiting from durable secular tailwinds in the Hispanic food segment. The business has compounded revenue at ~14% over the last three years driven by distribution gains, new product launches, and pricing power.

**Key strengths:**
- #1 brand in the Hispanic spices segment with 55 years of operating history
- 1,400+ SKU breadth with strong private label resistance to date
- 27% EBITDA margin with a clear pathway to 30%+ through SKU rationalization
- Loyal family management team willing to roll 15–20% of equity

## Entry Valuation

At $952M EV / $85M EBITDA, we are paying 11.2× — a modest premium to the public comps basket (McCormick trades at 12.4× NTM EBITDA) given the private company discount and process dynamics. Our base case underwrites a 13% IRR at 11× exit in year 5 with 2.6× MOIC.

## Key Risks

1. **Customer concentration** — Walmart represents ~28% of revenue; loss of shelf space would be material
2. **Raw material inflation** — Commodity exposure to peppers, garlic, cumin; partially mitigated by annual pricing adjustments
3. **Family succession** — Sofia Badia (CEO, age 54) is key person; management depth below her is thin
4. **Competitive pressure** — McCormick and Goya have meaningfully larger marketing budgets

## Return Analysis

| Scenario | Exit Multiple | Exit Year | EBITDA | EV | Equity | MOIC | IRR |
|---|---|---|---|---|---|---|---|
| Bear | 9.5× | 6 | $105M | $998M | $726M | 1.9× | 11% |
| Base | 11.0× | 5 | $118M | $1.30B | $1.03B | 2.6× | 21% |
| Bull | 13.0× | 5 | $128M | $1.66B | $1.39B | 3.4× | 28% |

## Recommendation

**Proceed to LOI.** We recommend submitting a non-binding LOI at $950–970M EV by the May 12 process deadline. Subject to satisfactory completion of due diligence and IC approval.`

// ── Helpers ────────────────────────────────────────────────────────────────────

const STAGE_COLOR: Record<string, string> = {
  loi:                "bg-violet-100 text-violet-700",
  due_diligence:      "bg-orange-100 text-orange-700",
  management_meeting: "bg-amber-100 text-amber-700",
  ic_approved:        "bg-emerald-100 text-emerald-700",
}

const FILE_CAT_COLOR: Record<string, string> = {
  financials: "bg-emerald-100 text-emerald-700",
  legal:      "bg-violet-100 text-violet-700",
  management: "bg-sky-100 text-sky-700",
  market:     "bg-amber-100 text-amber-700",
  other:      "bg-slate-100 text-slate-600",
}

const TASK_PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-red-500",
  high:   "text-orange-400",
  medium: "text-amber-400",
  low:    "text-slate-400",
}

const DD_STATUS_ICON: Record<string, React.ReactNode> = {
  not_started: <Circle    className="h-3.5 w-3.5 text-[#d1d5db]" />,
  in_progress: <Clock     className="h-3.5 w-3.5 text-amber-500" />,
  complete:    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  flagged:     <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
}

const TIMELINE_COLORS: Record<string, string> = {
  task:    "bg-violet-100 text-violet-600",
  meeting: "bg-sky-100 text-sky-600",
  file:    "bg-amber-100 text-amber-600",
  note:    "bg-slate-100 text-slate-600",
}

const TABS = [
  { id: "overview",   label: "Overview",    icon: BarChart3   },
  { id: "notes",      label: "Notes",       icon: BookOpen    },
  { id: "files",      label: "Files",       icon: FolderOpen  },
  { id: "tasks",      label: "Tasks",       icon: CheckSquare2 },
  { id: "diligence",  label: "Diligence",   icon: GitBranch   },
  { id: "timeline",   label: "Timeline",    icon: Clock       },
  { id: "ic_memo",    label: "IC Memo",     icon: FileText    },
]

// ── Tab panels ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left — description + metrics */}
      <div className="col-span-2 space-y-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Description</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{DEAL.description}</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Enterprise Value", value: formatCurrency(DEAL.ev),     icon: DollarSign,  color: "text-[#0f2d5c]", bg: "bg-[#0f2d5c]/8" },
            { label: "EBITDA",           value: formatCurrency(DEAL.ebitda), icon: BarChart3,   color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Revenue",          value: formatCurrency(DEAL.revenue),icon: TrendingUp,  color: "text-sky-600",    bg: "bg-sky-50"     },
            { label: "EV / EBITDA",      value: `${DEAL.multiple}×`,        icon: Building2,   color: "text-amber-600",  bg: "bg-amber-50"   },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", m.bg)}>
                <m.icon className={cn("h-4 w-4", m.color)} />
              </div>
              <p className="mt-2 text-xl font-semibold text-[#1a1a2e]">{m.value}</p>
              <p className="mt-0.5 text-xs text-[#9ca3af]">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Key Metrics</h3>
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              ["EBITDA Margin",     `${DEAL.ebitdaMargin}%`],
              ["Revenue Growth",    `+${DEAL.revenueGrowth}% YoY`],
              ["Entry Equity",      formatCurrency(DEAL.equity)],
              ["Debt",              formatCurrency(DEAL.debt)],
              ["Employees",         DEAL.employees.toLocaleString()],
              ["Founded",           DEAL.founded.toString()],
              ["HQ",                DEAL.hq],
              ["Website",           DEAL.website],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-[#f4f5f7] pb-2">
                <span className="text-xs text-[#9ca3af]">{k}</span>
                <span className="text-xs font-medium text-[#1a1a2e]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — team + process */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Deal Team</h3>
          <div className="mt-3 space-y-3">
            {DEAL.team.map((m) => (
              <div key={m.initials} className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#0f2d5c] text-[10px] font-semibold text-white">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">{m.name}</p>
                  <p className="text-xs text-[#9ca3af]">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Process</h3>
          <div className="mt-3 space-y-2.5">
            {[
              ["Banker",           DEAL.banker],
              ["Banker Contact",   DEAL.bankerContact],
              ["Source",           DEAL.source],
              ["Bid Deadline",     formatDate(DEAL.processDeadline)],
              ["IC Date",          formatDate(DEAL.icDate)],
              ["Days Active",      `${DEAL.daysActive}d`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-xs text-[#9ca3af]">{k}</span>
                <span className="text-xs font-medium text-[#1a1a2e]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Progress</h3>
            <span className="text-sm font-semibold text-[#0f2d5c]">{DEAL.progress}%</span>
          </div>
          <Progress value={DEAL.progress} className="mt-2" />
          <p className="mt-1.5 text-[10px] text-[#9ca3af]">LOI stage · {DEAL.daysActive} days active</p>
        </div>
      </div>
    </div>
  )
}

function NotesTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Note
        </Button>
      </div>
      {NOTES.map((n) => (
        <div key={n.id} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                n.type === "meeting" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
              )}>
                {n.type === "meeting" ? "Meeting" : "Note"}
              </span>
              <h3 className="text-sm font-semibold text-[#1a1a2e]">{n.title}</h3>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-[#9ca3af]">{formatDate(n.date)}</p>
              <p className="text-[10px] text-[#9ca3af]">{n.author}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">{n.content}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {n.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FilesTab() {
  const byCategory = FILES.reduce<Record<string, typeof FILES>>((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Upload File
        </Button>
      </div>
      {Object.entries(byCategory).map(([cat, files]) => (
        <div key={cat} className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
          <div className="border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-2.5 flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize", FILE_CAT_COLOR[cat])}>
              {cat}
            </span>
            <span className="text-xs text-[#9ca3af]">{files.length} file{files.length > 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-[#f4f5f7]">
            {files.map((f) => (
              <div key={f.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]">
                <FileText className="h-4 w-4 shrink-0 text-[#9ca3af]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1a1a2e]">{f.name}</p>
                  <p className="text-[10px] text-[#9ca3af]">{f.size} · Uploaded by {f.uploader} · {formatDate(f.date)}</p>
                </div>
                <button className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#9ca3af] hover:text-[#0f2d5c]">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TasksTab() {
  const open = TASKS.filter((t) => t.status !== "done")
  const done = TASKS.filter((t) => t.status === "done")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Task
        </Button>
      </div>

      <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
        <div className="border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-2.5">
          <span className="text-xs font-semibold text-[#1a1a2e]">Open · {open.length}</span>
        </div>
        <div className="divide-y divide-[#f4f5f7]">
          {open.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]">
              <Circle className="h-4 w-4 shrink-0 text-[#d1d5db]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1a1a2e]">{t.title}</p>
                <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                  Due {formatDate(t.due)} · {t.assignee}
                </p>
              </div>
              <Flag className={cn("h-3.5 w-3.5 shrink-0", TASK_PRIORITY_COLOR[t.priority])} />
            </div>
          ))}
        </div>
      </div>

      {done.length > 0 && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
          <div className="border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-2.5">
            <span className="text-xs font-semibold text-[#9ca3af]">Completed · {done.length}</span>
          </div>
          <div className="divide-y divide-[#f4f5f7]">
            {done.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 opacity-50">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-sm line-through text-[#6b7280]">{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DiligenceTab() {
  const overall = Math.round(
    DILIGENCE.reduce((s, w) => s + w.progress, 0) / DILIGENCE.length
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">Overall Diligence Progress</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{DILIGENCE.length} workstreams · IC target {formatDate(DEAL.icDate)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={overall} className="w-32" />
          <span className="text-sm font-semibold text-[#0f2d5c]">{overall}%</span>
        </div>
      </div>

      {DILIGENCE.map((ws) => (
        <div key={ws.id} className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-3">
            <div className="flex items-center gap-2.5">
              {DD_STATUS_ICON[ws.status]}
              <span className="text-sm font-semibold text-[#1a1a2e]">{ws.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#9ca3af]">Owner: {ws.owner}</span>
              <span className="text-xs text-[#9ca3af]">Due {formatDate(ws.due)}</span>
              <div className="flex items-center gap-2">
                <Progress value={ws.progress} className="w-20" />
                <span className="text-xs font-medium text-[#6b7280]">{ws.progress}%</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-[#f4f5f7]">
            {ws.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa]">
                {DD_STATUS_ICON[item.status]}
                <span className={cn(
                  "text-sm",
                  item.status === "complete" ? "text-[#9ca3af] line-through" : "text-[#4b5563]"
                )}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineTab() {
  return (
    <div className="space-y-0">
      {TIMELINE.map((e, i) => (
        <div key={e.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs", TIMELINE_COLORS[e.type])}>
              {e.type === "meeting" ? <CalendarDays className="h-3.5 w-3.5" /> :
               e.type === "file"    ? <FolderOpen   className="h-3.5 w-3.5" /> :
               e.type === "task"    ? <CheckSquare2 className="h-3.5 w-3.5" /> :
                                      <BookOpen      className="h-3.5 w-3.5" />}
            </div>
            {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-[#e5e7eb] my-1" />}
          </div>
          <div className="pb-4 pt-0.5">
            <p className="text-sm text-[#1a1a2e]">{e.text}</p>
            <p className="mt-0.5 text-xs text-[#9ca3af]">{formatRelativeDate(e.date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ICMemoTab() {
  const sections = IC_MEMO.split("\n\n").filter(Boolean)
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
        <div>
          <h2 className="text-base font-semibold text-[#1a1a2e]">IC Memorandum — {DEAL.company}</h2>
          <p className="mt-0.5 text-xs text-[#9ca3af]">Draft · {formatDate("2026-04-22")} · Lead: {DEAL.leadPartner}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Download className="h-3 w-3" /> Export PDF
        </Button>
      </div>
      <div className="prose prose-sm max-w-none">
        {sections.map((block, i) => {
          if (block.startsWith("## ")) {
            return <h2 key={i} className="text-sm font-semibold text-[#1a1a2e] mt-5 mb-2">{block.replace("## ", "")}</h2>
          }
          if (block.startsWith("**")) {
            return <p key={i} className="text-sm text-[#4b5563] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n- /g, "<br/>• ") }}
            />
          }
          if (block.startsWith("| ")) {
            const rows = block.split("\n").filter((r) => !r.match(/^[\| -]+$/))
            return (
              <div key={i} className="overflow-x-auto my-3">
                <table className="w-full text-xs border-collapse">
                  {rows.map((row, ri) => {
                    const cells = row.split("|").filter(Boolean).map((c) => c.trim())
                    return ri === 0
                      ? <thead key={ri}><tr>{cells.map((c, ci) => <th key={ci} className="border border-[#e5e7eb] bg-[#f4f5f7] px-3 py-1.5 text-left font-semibold text-[#6b7280]">{c}</th>)}</tr></thead>
                      : <tbody key={ri}><tr>{cells.map((c, ci) => <td key={ci} className="border border-[#e5e7eb] px-3 py-1.5 text-[#4b5563]">{c}</td>)}</tr></tbody>
                  })}
                </table>
              </div>
            )
          }
          return <p key={i} className="text-sm text-[#4b5563] leading-relaxed">{block}</p>
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DealRoomPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
        <Link href="/deals" className="hover:text-[#0f2d5c] transition-colors">Deal Rooms</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#1a1a2e] font-medium">{DEAL.company}</span>
      </div>

      {/* Deal header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f2d5c] text-sm font-bold text-white">
            {initials(DEAL.company)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#1a1a2e]">{DEAL.company}</h1>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STAGE_COLOR[DEAL.stage])}>
                {DEAL.stageLabel}
              </span>
              <Flame className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              {DEAL.sector} · {DEAL.banker} · {DEAL.hq}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5" /> Email Banker
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Log Activity
          </Button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-[#9ca3af] hover:bg-[#f4f5f7] hover:text-[#1a1a2e] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e5e7eb]">
        <nav className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === t.id
                  ? "border-[#0f2d5c] text-[#0f2d5c]"
                  : "border-transparent text-[#6b7280] hover:text-[#1a1a2e]"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview"  && <OverviewTab />}
        {activeTab === "notes"     && <NotesTab />}
        {activeTab === "files"     && <FilesTab />}
        {activeTab === "tasks"     && <TasksTab />}
        {activeTab === "diligence" && <DiligenceTab />}
        {activeTab === "timeline"  && <TimelineTab />}
        {activeTab === "ic_memo"   && <ICMemoTab />}
      </div>
    </div>
  )
}
