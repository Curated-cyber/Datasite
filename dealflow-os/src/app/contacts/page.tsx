"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Linkedin,
  ChevronDown,
  Circle,
} from "lucide-react"
import { cn, formatRelativeDate, initials } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type ContactType = "banker" | "founder" | "management" | "lender" | "advisor" | "lp" | "other"
type Warmth = 1 | 2 | 3 | 4 | 5

interface Contact {
  id: string
  name: string
  title: string
  firm: string
  email: string
  phone?: string
  type: ContactType
  warmth: Warmth
  lastContact: string
  deals: string[]
  linkedin?: string
  notes?: string
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Marcus Reinholt",
    title: "Managing Director",
    firm: "Goldman Sachs",
    email: "m.reinholt@gs.com",
    phone: "+1 212 555 0142",
    type: "banker",
    warmth: 5,
    lastContact: "2026-04-21",
    deals: ["Badia Spices"],
    linkedin: "https://linkedin.com",
    notes: "Lead banker on Badia process. Good relationship — responsive and fair.",
  },
  {
    id: "c2",
    name: "Sofia Badia",
    title: "CEO & Founder",
    firm: "Badia Spices",
    email: "sofia@badiaspices.com",
    phone: "+1 305 555 0188",
    type: "founder",
    warmth: 4,
    lastContact: "2026-04-21",
    deals: ["Badia Spices"],
    notes: "Third-generation family owner. Very engaged in the process.",
  },
  {
    id: "c3",
    name: "Derek Cho",
    title: "VP — Coverage",
    firm: "Jefferies",
    email: "d.cho@jefferies.com",
    phone: "+1 212 555 0231",
    type: "banker",
    warmth: 3,
    lastContact: "2026-04-19",
    deals: ["Meridian Logistics"],
    linkedin: "https://linkedin.com",
  },
  {
    id: "c4",
    name: "Priya Venkatesh",
    title: "CFO",
    firm: "Meridian Logistics",
    email: "p.venkatesh@meridianlogistics.com",
    type: "management",
    warmth: 4,
    lastContact: "2026-04-19",
    deals: ["Meridian Logistics"],
    notes: "Strong operator. Very data-driven on the QoE process.",
  },
  {
    id: "c5",
    name: "Thomas Laurier",
    title: "Director, Leveraged Finance",
    firm: "JPMorgan",
    email: "t.laurier@jpmorgan.com",
    phone: "+1 212 555 0377",
    type: "lender",
    warmth: 3,
    lastContact: "2026-03-15",
    deals: ["Badia Spices", "Meridian Logistics"],
    linkedin: "https://linkedin.com",
  },
  {
    id: "c6",
    name: "Rachel Kim",
    title: "Principal",
    firm: "William Blair",
    email: "r.kim@williamblair.com",
    type: "banker",
    warmth: 2,
    lastContact: "2026-04-10",
    deals: ["Nova Health Systems"],
  },
  {
    id: "c7",
    name: "James Whitfield",
    title: "CEO",
    firm: "Nova Health Systems",
    email: "j.whitfield@novahealth.com",
    phone: "+1 615 555 0094",
    type: "founder",
    warmth: 3,
    lastContact: "2026-04-08",
    deals: ["Nova Health Systems"],
  },
  {
    id: "c8",
    name: "Anne Delacroix",
    title: "LP Relations",
    firm: "Brookfield Asset Management",
    email: "a.delacroix@brookfield.com",
    type: "lp",
    warmth: 4,
    lastContact: "2026-03-28",
    deals: [],
    notes: "Co-invest appetite up to $150M per deal.",
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ContactType, string> = {
  banker: "Banker",
  founder: "Founder",
  management: "Management",
  lender: "Lender",
  advisor: "Advisor",
  lp: "LP",
  other: "Other",
}

const TYPE_STYLES: Record<ContactType, string> = {
  banker:     "bg-violet-100 text-violet-700",
  founder:    "bg-amber-100  text-amber-700",
  management: "bg-sky-100    text-sky-700",
  lender:     "bg-emerald-100 text-emerald-700",
  advisor:    "bg-orange-100 text-orange-700",
  lp:         "bg-pink-100   text-pink-700",
  other:      "bg-slate-100  text-slate-600",
}

const WARMTH_COLORS = ["", "bg-slate-300", "bg-blue-300", "bg-amber-300", "bg-orange-400", "bg-red-500"]

function WarmthDots({ score }: { score: Warmth }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            i <= score ? WARMTH_COLORS[score] : "bg-[#e5e7eb]"
          )}
        />
      ))}
    </div>
  )
}

const ALL_TYPES: (ContactType | "all")[] = [
  "all", "banker", "founder", "management", "lender", "advisor", "lp",
]

const WARMTH_OPTIONS = [
  { value: "all", label: "Any warmth" },
  { value: "5",   label: "🔥 Hot (5)" },
  { value: "4",   label: "Warm (4)" },
  { value: "3",   label: "Neutral (3)" },
  { value: "1",   label: "Cold (1–2)" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ContactType | "all">("all")
  const [warmthFilter, setWarmthFilter] = useState("all")

  const filtered = useMemo(() => {
    return CONTACTS.filter((c) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.firm.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.deals.some((d) => d.toLowerCase().includes(q))

      const matchesType = typeFilter === "all" || c.type === typeFilter

      const matchesWarmth =
        warmthFilter === "all" ||
        (warmthFilter === "1" ? c.warmth <= 2 : c.warmth === Number(warmthFilter))

      return matchesQuery && matchesType && matchesWarmth
    })
  }, [query, typeFilter, warmthFilter])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a2e]">Contacts</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {CONTACTS.length} contacts · {filtered.length} shown
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Contact
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, firm, deal…"
            className="pl-9 h-8 text-sm"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-1">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === t
                  ? "bg-[#0f2d5c] text-white"
                  : "bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb]"
              )}
            >
              {t === "all" ? "All" : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Warmth dropdown */}
        <div className="relative ml-auto">
          <select
            value={warmthFilter}
            onChange={(e) => setWarmthFilter(e.target.value)}
            className="h-8 appearance-none rounded-md border border-[#e5e7eb] bg-white pl-3 pr-7 text-xs text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/20"
          >
            {WARMTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9ca3af]" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Warmth</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Deals</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Last Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#6b7280]">Reach out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f5f7]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#9ca3af]">
                  No contacts match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="group transition-colors hover:bg-[#fafafa]"
                >
                  {/* Name + firm */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-[#0f2d5c]/10 text-[#0f2d5c] text-xs font-semibold">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#1a1a2e]">{c.name}</p>
                        <p className="text-xs text-[#9ca3af]">
                          {c.title} · {c.firm}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                        TYPE_STYLES[c.type]
                      )}
                    >
                      {TYPE_LABELS[c.type]}
                    </span>
                  </td>

                  {/* Warmth */}
                  <td className="px-4 py-3">
                    <WarmthDots score={c.warmth} />
                  </td>

                  {/* Deals */}
                  <td className="px-4 py-3">
                    {c.deals.length === 0 ? (
                      <span className="text-xs text-[#9ca3af]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {c.deals.map((d) => (
                          <span
                            key={d}
                            className="rounded-full bg-[#f4f5f7] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Last contact */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs",
                        new Date(c.lastContact) < new Date(Date.now() - 30 * 86400000)
                          ? "text-red-500"
                          : "text-[#6b7280]"
                      )}
                    >
                      {formatRelativeDate(c.lastContact)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <a
                        href={`mailto:${c.email}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#e5e7eb] hover:text-[#1a1a2e]"
                        title={c.email}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#e5e7eb] hover:text-[#1a1a2e]"
                          title={c.phone}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {c.linkedin && (
                        <a
                          href={c.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#e5e7eb] hover:text-[#1a1a2e]"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
