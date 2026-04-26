"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search, Plus, CalendarDays, Clock, Users, ChevronDown,
  Sparkles, ChevronRight, FileText, CheckSquare2, Tag,
} from "lucide-react"
import { cn, formatDate, initials } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type MeetingType = "intro" | "management_presentation" | "site_visit" | "ic" | "call" | "diligence" | "other"

interface Meeting {
  id: string
  title: string
  deal: string
  dealId: string
  date: string
  time: string
  durationMin: number
  type: MeetingType
  attendees: { initials: string; name: string }[]
  summary: string
  actionItems: string[]
  tags: string[]
  aiSummarized: boolean
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const MEETINGS: Meeting[] = [
  {
    id: "m1",
    title: "Badia Spices — Management Presentation",
    deal: "Badia Spices",
    dealId: "badia",
    date: "2026-04-21",
    time: "10:00 AM",
    durationMin: 150,
    type: "management_presentation",
    attendees: [
      { initials: "JD", name: "James Dixon" },
      { initials: "SR", name: "Sarah Reynolds" },
      { initials: "MK", name: "Mike Kantor" },
      { initials: "SB", name: "Sofia Badia" },
      { initials: "MR", name: "Marcus Reinholt" },
    ],
    summary:
      "Strong management team led by third-generation family ownership. Sofia presented organic growth story with margin expansion opportunity through SKU rationalization. Key risks: customer concentration (Walmart ~28%) and raw material inflation. Management willing to roll 15–20% equity. Plant tour to be scheduled for early May.",
    actionItems: [
      "Request 5-yr historical P&L from Goldman",
      "Schedule plant tour — Miami facility",
      "Follow up on private label dynamics with Sofia",
      "Prepare LOI draft for partner review",
    ],
    tags: ["key meeting", "management", "badia"],
    aiSummarized: true,
  },
  {
    id: "m2",
    title: "Goldman — Process Update Call",
    deal: "Badia Spices",
    dealId: "badia",
    date: "2026-04-17",
    time: "2:00 PM",
    durationMin: 30,
    type: "call",
    attendees: [
      { initials: "JD", name: "James Dixon" },
      { initials: "SR", name: "Sarah Reynolds" },
      { initials: "MR", name: "Marcus Reinholt" },
    ],
    summary:
      "Marcus confirmed 6 parties in round 2. Bid deadline May 12. Expects 9–12× range from strategics. Debt market supportive at 5.5× leverage per JPM. Management rollover of 15–20% strongly encouraged by Goldman.",
    actionItems: [
      "Confirm bid participation by April 22",
      "Align debt package with JPM — Thomas Laurier",
    ],
    tags: ["process", "banker"],
    aiSummarized: true,
  },
  {
    id: "m3",
    title: "Meridian Logistics — QoE Kickoff",
    deal: "Meridian Logistics",
    dealId: "meridian",
    date: "2026-04-19",
    time: "9:00 AM",
    durationMin: 60,
    type: "diligence",
    attendees: [
      { initials: "SR", name: "Sarah Reynolds" },
      { initials: "TL", name: "Thomas Laurier" },
      { initials: "PV", name: "Priya Venkatesh" },
    ],
    summary:
      "FTI engaged for Quality of Earnings. Priya walked through the management accounts — revenue recognition policy is conservative and consistent. Working capital normalisation expected to add ~$2M to adjusted EBITDA. Key diligence focus: customer concentration (top 3 = 44% of revenue) and driver cost structure.",
    actionItems: [
      "Share data room access with FTI",
      "Request 3-yr customer revenue bridge",
      "Obtain fleet ownership schedule",
    ],
    tags: ["diligence", "QoE", "meridian"],
    aiSummarized: false,
  },
  {
    id: "m4",
    title: "Nova Health Systems — Intro Call",
    deal: "Nova Health Systems",
    dealId: "nova",
    date: "2026-04-08",
    time: "11:00 AM",
    durationMin: 45,
    type: "intro",
    attendees: [
      { initials: "JD", name: "James Dixon" },
      { initials: "MK", name: "Mike Kantor" },
      { initials: "JW", name: "James Whitfield" },
      { initials: "RK", name: "Rachel Kim" },
    ],
    summary:
      "James Whitfield gave a high-level overview of Nova's multi-site dental and primary care platform. 22 locations across Tennessee and Kentucky. Payor mix ~65% commercial. Strong same-store growth of 18% YoY. Considering a growth equity round or full exit — hasn't decided. William Blair engaged as advisor.",
    actionItems: [
      "Request CIM from William Blair",
      "Research Tennessee dental platform M&A comps",
      "Schedule follow-up management meeting",
    ],
    tags: ["intro", "healthcare", "nova"],
    aiSummarized: false,
  },
  {
    id: "m5",
    title: "IC Meeting — ClearPath Analytics",
    deal: "ClearPath Analytics",
    dealId: "clearpath",
    date: "2026-04-20",
    time: "1:00 PM",
    durationMin: 120,
    type: "ic",
    attendees: [
      { initials: "JD", name: "James Dixon" },
      { initials: "SR", name: "Sarah Reynolds" },
      { initials: "TL", name: "Thomas Laurier" },
    ],
    summary:
      "IC approved ClearPath at up to $165M EV. Key conditions: (1) management rollover min 10%, (2) ratchet mechanism tied to ARR milestones, (3) customary legal reps. Strong consensus on the thesis — 52% ARR growth and dominant position in insurance analytics is compelling. Proceed to exclusivity.",
    actionItems: [
      "Issue exclusivity letter to Houlihan Lokey",
      "Engage Simpson Thacher for legal",
      "Draft management incentive plan term sheet",
    ],
    tags: ["IC", "approved", "clearpath"],
    aiSummarized: true,
  },
  {
    id: "m6",
    title: "JPMorgan — Debt Financing Discussion",
    deal: "Badia Spices",
    dealId: "badia",
    date: "2026-04-15",
    time: "3:30 PM",
    durationMin: 45,
    type: "call",
    attendees: [
      { initials: "SR", name: "Sarah Reynolds" },
      { initials: "TL", name: "Thomas Laurier" },
    ],
    summary:
      "Thomas confirmed JPM can commit up to $272M in senior secured at L+350. Leverage at 5.5× EBITDA. 7-year term loan. Expects strong syndication demand given Badia's brand and cash flow profile. Soft-circled — subject to credit committee.",
    actionItems: [
      "Send JPM preliminary model for credit sizing",
      "Explore second-lien options to reduce equity check",
    ],
    tags: ["debt", "financing", "badia"],
    aiSummarized: false,
  },
]

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_META: Record<MeetingType, { label: string; color: string }> = {
  intro:                   { label: "Intro Call",      color: "bg-sky-100 text-sky-700"      },
  management_presentation: { label: "Mgmt Pres.",      color: "bg-violet-100 text-violet-700"},
  site_visit:              { label: "Site Visit",      color: "bg-amber-100 text-amber-700"  },
  ic:                      { label: "IC Meeting",      color: "bg-emerald-100 text-emerald-700"},
  call:                    { label: "Call",            color: "bg-slate-100 text-slate-600"  },
  diligence:               { label: "Diligence",       color: "bg-orange-100 text-orange-700"},
  other:                   { label: "Other",           color: "bg-slate-100 text-slate-600"  },
}

const ALL_TYPES: (MeetingType | "all")[] = [
  "all", "call", "intro", "management_presentation", "diligence", "ic",
]

// ── Log Meeting modal ──────────────────────────────────────────────────────────

function LogMeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Meeting / Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Title</label>
            <Input placeholder="e.g. Badia Spices — Management Presentation" className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Deal</label>
              <select className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20">
                <option>Badia Spices</option>
                <option>Meridian Logistics</option>
                <option>Nova Health Systems</option>
                <option>ClearPath Analytics</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Type</label>
              <select className="h-8 w-full rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20">
                <option>Call</option>
                <option>Intro Call</option>
                <option>Management Presentation</option>
                <option>Diligence</option>
                <option>IC Meeting</option>
                <option>Site Visit</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Date</label>
              <Input type="date" className="h-8 text-sm" defaultValue="2026-04-23" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6b7280]">Duration (min)</label>
              <Input type="number" placeholder="60" className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Notes / Summary</label>
            <Textarea placeholder="Key discussion points, decisions made…" className="text-sm" rows={4} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">Action Items</label>
            <Textarea placeholder="One action item per line…" className="text-sm" rows={3} />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#0f2d5c]/5 px-3 py-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0f2d5c]" />
            <span className="text-xs text-[#0f2d5c]">AI will auto-summarize and extract action items on save</span>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={onClose}>Save Meeting</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Meeting card ──────────────────────────────────────────────────────────────

function MeetingCard({
  meeting,
  expanded,
  onToggle,
}: {
  meeting: Meeting
  expanded: boolean
  onToggle: () => void
}) {
  const meta = TYPE_META[meeting.type]

  return (
    <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      {/* Header — always visible */}
      <button
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
        onClick={onToggle}
      >
        {/* Date block */}
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0f2d5c]/8">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0f2d5c]">
            {new Date(meeting.date).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-lg font-bold leading-none text-[#0f2d5c]">
            {new Date(meeting.date).getDate()}
          </span>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1a1a2e]">{meeting.title}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-medium", meta.color)}>
              {meta.label}
            </span>
            {meeting.aiSummarized && (
              <span className="flex items-center gap-1 rounded-full bg-[#0f2d5c]/8 px-2 py-0.5 text-[10px] font-medium text-[#0f2d5c]">
                <Sparkles className="h-2.5 w-2.5" /> AI Summary
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-[#9ca3af]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {meeting.time} · {meeting.durationMin}m
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {meeting.attendees.length} attendees
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {meeting.deal}
            </span>
          </div>
        </div>

        {/* Attendee avatars */}
        <div className="hidden shrink-0 items-center sm:flex">
          <div className="flex -space-x-1.5">
            {meeting.attendees.slice(0, 4).map((a) => (
              <Avatar key={a.initials} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-[#0f2d5c] text-[9px] font-semibold text-white">
                  {a.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {meeting.attendees.length > 4 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#e5e7eb] text-[9px] font-semibold text-[#6b7280]">
                +{meeting.attendees.length - 4}
              </div>
            )}
          </div>
        </div>

        <ChevronRight
          className={cn("h-4 w-4 shrink-0 text-[#9ca3af] transition-transform", expanded && "rotate-90")}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-[#f4f5f7] px-5 py-4 space-y-4">
          {/* Summary */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-[#9ca3af]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-[#4b5563]">{meeting.summary}</p>
          </div>

          {/* Action items */}
          {meeting.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckSquare2 className="h-3.5 w-3.5 text-[#9ca3af]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                  Action Items
                </span>
              </div>
              <ul className="space-y-1.5">
                {meeting.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f2d5c]" />
                    <span className="text-sm text-[#4b5563]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attendees + tags row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap gap-1">
              {meeting.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
              {meeting.attendees.map((a) => a.name).join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [query, setQuery]       = useState("")
  const [typeFilter, setType]   = useState<MeetingType | "all">("all")
  const [expandedId, setExpanded] = useState<string | null>("m1")
  const [showModal, setModal]   = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return MEETINGS.filter((m) => {
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.deal.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      const matchT = typeFilter === "all" || m.type === typeFilter
      return matchQ && matchT
    })
  }, [query, typeFilter])

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, Meeting[]>()
    filtered.forEach((m) => {
      const key = new Date(m.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    })
    return map
  }, [filtered])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Meetings & Calls</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {MEETINGS.length} logged · {MEETINGS.filter((m) => m.aiSummarized).length} AI-summarized
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal(true)}>
          <Plus className="h-3.5 w-3.5" /> Log Meeting
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings…"
            className="h-8 w-56 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === t
                  ? "bg-[#0f2d5c] text-white"
                  : "bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb]"
              )}
            >
              {t === "all" ? "All" : TYPE_META[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] py-16 text-sm text-[#9ca3af]">
          No meetings match your filters.
        </div>
      ) : (
        Array.from(grouped.entries()).map(([month, meetings]) => (
          <div key={month} className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">{month}</h2>
            {meetings.map((m) => (
              <MeetingCard
                key={m.id}
                meeting={m}
                expanded={expandedId === m.id}
                onToggle={() => setExpanded(expandedId === m.id ? null : m.id)}
              />
            ))}
          </div>
        ))
      )}

      <LogMeetingModal open={showModal} onClose={() => setModal(false)} />
    </div>
  )
}
