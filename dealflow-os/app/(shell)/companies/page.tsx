"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MoreHorizontal, TrendingUp, Building2 } from "lucide-react"
import { cn, formatCurrency, initials } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage =
  | "sourcing"
  | "initial_review"
  | "management_meeting"
  | "loi"
  | "due_diligence"
  | "ic_approved"

interface Company {
  id: string
  name: string
  sector: string
  hq: string
  revenue?: number
  ebitda?: number
  multiple?: number
  revenueGrowth?: number
  stage: Stage
  banker?: string
  priority: "high" | "medium" | "low"
  daysInStage: number
  tags: string[]
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const COMPANIES: Company[] = [
  {
    id: "badia",
    name: "Badia Spices",
    sector: "Consumer / Food",
    hq: "Miami, FL",
    revenue: 310_000_000,
    ebitda: 85_000_000,
    multiple: 11.2,
    revenueGrowth: 14,
    stage: "loi",
    banker: "Goldman Sachs",
    priority: "high",
    daysInStage: 12,
    tags: ["consumer", "food & bev", "family-owned"],
  },
  {
    id: "meridian",
    name: "Meridian Logistics",
    sector: "Transportation",
    hq: "Chicago, IL",
    revenue: 185_000_000,
    ebitda: 38_000_000,
    multiple: 11.1,
    revenueGrowth: 9,
    stage: "due_diligence",
    banker: "Jefferies",
    priority: "high",
    daysInStage: 21,
    tags: ["logistics", "b2b"],
  },
  {
    id: "nova",
    name: "Nova Health Systems",
    sector: "Healthcare",
    hq: "Nashville, TN",
    revenue: 98_000_000,
    ebitda: 24_000_000,
    multiple: 11.7,
    revenueGrowth: 22,
    stage: "management_meeting",
    banker: "William Blair",
    priority: "medium",
    daysInStage: 8,
    tags: ["healthcare", "recurring revenue"],
  },
  {
    id: "peak",
    name: "Peak Industrial",
    sector: "Industrials",
    hq: "Dallas, TX",
    revenue: 72_000_000,
    ebitda: 19_000_000,
    multiple: 10.0,
    revenueGrowth: 6,
    stage: "initial_review",
    banker: "Baird",
    priority: "low",
    daysInStage: 7,
    tags: ["industrials", "manufacturing"],
  },
  {
    id: "skyline",
    name: "Skyline Software",
    sector: "Technology",
    hq: "Austin, TX",
    revenue: 55_000_000,
    ebitda: 18_000_000,
    multiple: 15.2,
    revenueGrowth: 35,
    stage: "sourcing",
    priority: "medium",
    daysInStage: 3,
    tags: ["saas", "b2b"],
  },
  {
    id: "crestwood",
    name: "Crestwood Dental",
    sector: "Healthcare",
    hq: "Atlanta, GA",
    revenue: 42_000_000,
    ebitda: 11_000_000,
    multiple: 10.5,
    revenueGrowth: 18,
    stage: "sourcing",
    banker: "Harris Williams",
    priority: "medium",
    daysInStage: 14,
    tags: ["healthcare", "dental", "platform"],
  },
  {
    id: "apex",
    name: "Apex Coatings",
    sector: "Industrials",
    hq: "Cleveland, OH",
    revenue: 88_000_000,
    ebitda: 21_000_000,
    multiple: 9.8,
    revenueGrowth: 4,
    stage: "sourcing",
    priority: "low",
    daysInStage: 45,
    tags: ["industrials", "specialty chemicals"],
  },
  {
    id: "clearpath",
    name: "ClearPath Analytics",
    sector: "Technology",
    hq: "New York, NY",
    revenue: 31_000_000,
    ebitda: 9_000_000,
    multiple: 18.0,
    revenueGrowth: 52,
    stage: "ic_approved",
    priority: "high",
    daysInStage: 4,
    tags: ["saas", "fintech"],
  },
]

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: { stage: Stage; label: string; color: string; dot: string }[] = [
  { stage: "sourcing",           label: "Sourcing",          color: "bg-slate-100  text-slate-600",   dot: "bg-slate-400"   },
  { stage: "initial_review",     label: "Initial Review",    color: "bg-sky-100    text-sky-700",     dot: "bg-sky-400"     },
  { stage: "management_meeting", label: "Mgmt Meeting",      color: "bg-amber-100  text-amber-700",   dot: "bg-amber-400"   },
  { stage: "loi",                label: "LOI",               color: "bg-violet-100 text-violet-700",  dot: "bg-violet-500"  },
  { stage: "due_diligence",      label: "Due Diligence",     color: "bg-orange-100 text-orange-700",  dot: "bg-orange-400"  },
  { stage: "ic_approved",        label: "IC Approved",       color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
]

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-slate-300",
}

// ── Card component ────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="group rounded-lg border border-[#e5e7eb] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0f2d5c]/8 text-[10px] font-bold text-[#0f2d5c]">
            {initials(company.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1a1a2e]">{company.name}</p>
            <p className="text-[10px] text-[#9ca3af]">{company.sector}</p>
          </div>
        </div>
        <button className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#9ca3af] hover:text-[#6b7280]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Financials */}
      {company.ebitda && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-[#f4f5f7] px-2.5 py-1.5">
            <p className="text-[9px] font-medium uppercase tracking-wide text-[#9ca3af]">EBITDA</p>
            <p className="mt-0.5 text-xs font-semibold text-[#1a1a2e]">
              {formatCurrency(company.ebitda)}
            </p>
          </div>
          <div className="rounded-md bg-[#f4f5f7] px-2.5 py-1.5">
            <p className="text-[9px] font-medium uppercase tracking-wide text-[#9ca3af]">Multiple</p>
            <p className="mt-0.5 text-xs font-semibold text-[#1a1a2e]">{company.multiple}×</p>
          </div>
        </div>
      )}

      {/* Growth + HQ */}
      <div className="mt-2.5 flex items-center gap-2">
        {company.revenueGrowth && (
          <div className="flex items-center gap-0.5 text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] font-medium">+{company.revenueGrowth}%</span>
          </div>
        )}
        <span className="text-[10px] text-[#9ca3af]">{company.hq}</span>
        {company.banker && (
          <>
            <span className="text-[10px] text-[#d1d5db]">·</span>
            <span className="text-[10px] text-[#9ca3af]">{company.banker}</span>
          </>
        )}
      </div>

      {/* Tags */}
      {company.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {company.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[9px] font-medium text-[#6b7280]"
            >
              {t}
            </span>
          ))}
          {company.tags.length > 2 && (
            <span className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[9px] font-medium text-[#9ca3af]">
              +{company.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[#f4f5f7] pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[company.priority])} />
          <span className="text-[10px] capitalize text-[#9ca3af]">{company.priority}</span>
        </div>
        <span className="text-[10px] text-[#9ca3af]">{company.daysInStage}d in stage</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query) return COMPANIES
    const q = query.toLowerCase()
    return COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [query])

  const byStage = useMemo(
    () =>
      Object.fromEntries(
        COLUMNS.map((col) => [col.stage, filtered.filter((c) => c.stage === col.stage)])
      ) as Record<Stage, Company[]>,
    [filtered]
  )

  const totalEV = COMPANIES.reduce(
    (sum, c) => sum + (c.ebitda && c.multiple ? c.ebitda * c.multiple : 0),
    0
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Pipeline</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {COMPANIES.length} companies · {formatCurrency(totalEV)} total EV
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies…"
              className="h-8 w-52 pl-9 text-sm"
            />
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = byStage[col.stage] ?? []
          const colEV = cards.reduce(
            (sum, c) => sum + (c.ebitda && c.multiple ? c.ebitda * c.multiple : 0),
            0
          )

          return (
            <div
              key={col.stage}
              className="flex w-60 shrink-0 flex-col rounded-xl border border-[#e5e7eb] bg-[#f9fafb]"
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                  <span className="text-xs font-semibold text-[#1a1a2e]">{col.label}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e5e7eb] text-[9px] font-semibold text-[#6b7280]">
                    {cards.length}
                  </span>
                </div>
                {colEV > 0 && (
                  <span className="text-[10px] text-[#9ca3af]">{formatCurrency(colEV)}</span>
                )}
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e5e7eb] py-8">
                    <Building2 className="h-5 w-5 text-[#d1d5db]" />
                    <p className="mt-1.5 text-[10px] text-[#9ca3af]">No companies</p>
                  </div>
                ) : (
                  cards.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))
                )}

                {/* Add button */}
                <button className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-[#9ca3af] transition-colors hover:bg-[#e5e7eb] hover:text-[#6b7280]">
                  <Plus className="h-3 w-3" />
                  Add company
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
