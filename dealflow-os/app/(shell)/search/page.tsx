"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Search, Briefcase, Users, Building2, CalendarDays, FileText,
  ArrowRight, X,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

// ── Mock data ─────────────────────────────────────────────────────────────────

const DEALS = [
  { id: "badia",     name: "Badia Spices",        sector: "Consumer / Food",  stage: "LOI",             banker: "Goldman Sachs",   ebitda: "$85M",  ev: "$952M" },
  { id: "meridian",  name: "Meridian Logistics",   sector: "Transportation",   stage: "Due Diligence",    banker: "Jefferies",       ebitda: "$38M",  ev: "$422M" },
  { id: "nova",      name: "Nova Health Systems",  sector: "Healthcare",       stage: "Mgmt Meeting",     banker: "William Blair",   ebitda: "$24M",  ev: "$281M" },
  { id: "clearpath", name: "ClearPath Analytics",  sector: "Technology",       stage: "IC Approved",      banker: "Houlihan Lokey",  ebitda: "$9M",   ev: "$162M" },
  { id: "peak",      name: "Peak Industrial",      sector: "Industrials",      stage: "Initial Review",   banker: "Baird",           ebitda: "$19M",  ev: "$190M" },
  { id: "bluecrest", name: "BlueCrest Pharma",     sector: "Healthcare",       stage: "Closed",           banker: "Lazard",          ebitda: "$62M",  ev: "$680M" },
]

const CONTACTS = [
  { id: "c1", name: "Marcus Reinholt",  title: "Managing Director", firm: "Goldman Sachs",          type: "Banker",     deal: "Badia Spices" },
  { id: "c2", name: "Sofia Badia",      title: "CEO & Founder",     firm: "Badia Spices",           type: "Founder",    deal: "Badia Spices" },
  { id: "c3", name: "Derek Cho",        title: "VP — Coverage",     firm: "Jefferies",              type: "Banker",     deal: "Meridian Logistics" },
  { id: "c4", name: "Priya Venkatesh", title: "CFO",               firm: "Meridian Logistics",     type: "Management", deal: "Meridian Logistics" },
  { id: "c5", name: "Thomas Laurier",  title: "Director, Lev Fin", firm: "JPMorgan",               type: "Lender",     deal: "Badia Spices, Meridian" },
  { id: "c6", name: "Rachel Kim",       title: "Principal",         firm: "William Blair",          type: "Banker",     deal: "Nova Health Systems" },
  { id: "c7", name: "James Whitfield", title: "CEO",               firm: "Nova Health Systems",    type: "Founder",    deal: "Nova Health Systems" },
  { id: "c8", name: "Anne Delacroix",  title: "LP Relations",      firm: "Brookfield",             type: "LP",         deal: "" },
]

const MEETINGS = [
  { id: "m1", title: "Badia Spices — Management Presentation", deal: "Badia Spices",       date: "2026-04-21", type: "Mgmt Pres.",  summary: "Strong management team, SKU rationalisation opportunity, Walmart concentration risk, 15-20% rollover." },
  { id: "m2", title: "Goldman — Process Update Call",          deal: "Badia Spices",       date: "2026-04-17", type: "Call",        summary: "6 parties in round 2. Bid deadline May 12. 9-12x range expected. Debt market supportive at 5.5x." },
  { id: "m3", title: "Meridian Logistics — QoE Kickoff",       deal: "Meridian Logistics", date: "2026-04-19", type: "Diligence",   summary: "FTI engaged. Revenue recognition conservative. WC normalisation +$2M EBITDA. Customer concentration risk." },
  { id: "m4", title: "Nova Health Systems — Intro Call",       deal: "Nova Health",        date: "2026-04-08", type: "Intro Call",  summary: "22-location dental and primary care platform. 65% commercial payor mix. 18% same-store growth YoY." },
  { id: "m5", title: "IC Meeting — ClearPath Analytics",       deal: "ClearPath",          date: "2026-04-20", type: "IC Meeting",  summary: "IC approved at up to $165M EV. Conditions: 10% mgmt rollover, ARR ratchet, standard reps. Proceed to exclusivity." },
  { id: "m6", title: "JPMorgan — Debt Financing Discussion",   deal: "Badia Spices",       date: "2026-04-15", type: "Call",        summary: "JPM can commit $272M senior secured at L+350. 5.5x EBITDA, 7yr term. Soft-circled pending credit committee." },
]

const NOTES = [
  { id: "n1", title: "Competitive Landscape — Badia Spices",  deal: "Badia Spices",  date: "2026-04-14", content: "McCormick public comps at 12.4x NTM EBITDA. Badia moat: brand loyalty in Hispanic segment and 1,400+ SKU breadth. Private label risk real but margins have held." },
  { id: "n2", title: "IC Memo — Bear/Base/Bull Analysis",     deal: "Badia Spices",  date: "2026-04-22", content: "Base case: 11.0x exit, year 5, $118M EBITDA, 2.6x MOIC, 21% IRR. Bear: 1.9x MOIC. Bull: 3.4x MOIC at 13x exit multiple." },
  { id: "n3", title: "Meridian — Customer Concentration Note", deal: "Meridian",      date: "2026-04-19", content: "Top 3 customers = 44% of revenue. Driver cost structure under review. Fleet ownership vs lease mix important for WC normalisation." },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type ResultSection = {
  type: "deal" | "contact" | "meeting" | "note"
  label: string
  icon: React.ElementType
  color: string
  items: ResultItem[]
}

type ResultItem = {
  id: string
  title: string
  subtitle: string
  meta: string
  href: string
}

// ── Search logic ──────────────────────────────────────────────────────────────

function search(q: string): ResultSection[] {
  const term = q.toLowerCase().trim()
  if (!term) return []

  const matchStr = (...strs: (string | undefined)[]) =>
    strs.some((s) => s?.toLowerCase().includes(term))

  const dealHits: ResultItem[] = DEALS
    .filter((d) => matchStr(d.name, d.sector, d.stage, d.banker))
    .map((d) => ({
      id: d.id,
      title: d.name,
      subtitle: `${d.stage} · ${d.banker}`,
      meta: `${d.ev} EV · ${d.ebitda} EBITDA`,
      href: `/deals/${d.id}`,
    }))

  const contactHits: ResultItem[] = CONTACTS
    .filter((c) => matchStr(c.name, c.firm, c.title, c.type, c.deal))
    .map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: `${c.title} · ${c.firm}`,
      meta: c.deal ? `Deal: ${c.deal}` : c.type,
      href: `/contacts`,
    }))

  const meetingHits: ResultItem[] = MEETINGS
    .filter((m) => matchStr(m.title, m.deal, m.type, m.summary))
    .map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: `${m.type} · ${m.deal}`,
      meta: formatDate(m.date),
      href: `/meetings`,
    }))

  const noteHits: ResultItem[] = NOTES
    .filter((n) => matchStr(n.title, n.deal, n.content))
    .map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: `Note · ${n.deal}`,
      meta: formatDate(n.date),
      href: `/deals/${n.deal.toLowerCase().split(" ")[0]}`,
    }))

  const sections: ResultSection[] = [
    { type: "deal",    label: "Deals",    icon: Briefcase,    color: "text-[#0f2d5c]  bg-[#0f2d5c]/8",  items: dealHits    },
    { type: "contact", label: "Contacts", icon: Users,        color: "text-violet-600 bg-violet-50",     items: contactHits },
    { type: "meeting", label: "Meetings", icon: CalendarDays, color: "text-sky-600    bg-sky-50",        items: meetingHits },
    { type: "note",    label: "Notes",    icon: FileText,     color: "text-amber-600  bg-amber-50",      items: noteHits    },
  ]

  return sections.filter((s) => s.items.length > 0)
}

const SUGGESTIONS = [
  "Badia Spices", "Goldman", "LOI", "due diligence",
  "management presentation", "IC approved", "Meridian", "lender",
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("")

  const results = useMemo(() => search(query), [query])
  const totalHits = results.reduce((s, r) => s + r.items.length, 0)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1a1a2e]">Search</h1>
        <p className="mt-0.5 text-sm text-[#6b7280]">
          Search across deals, contacts, meetings, and notes
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search…"
          className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white pl-11 pr-10 text-sm text-[#1a1a2e] shadow-sm placeholder:text-[#9ca3af] focus:border-[#0f2d5c]/40 focus:outline-none focus:ring-2 focus:ring-[#0f2d5c]/15 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions (empty state) */}
      {!query && (
        <div>
          <p className="mb-2.5 text-xs font-medium text-[#9ca3af]">Try searching for</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs text-[#4b5563] transition-colors hover:border-[#0f2d5c]/30 hover:bg-[#0f2d5c]/5 hover:text-[#0f2d5c]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <>
          {totalHits === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] py-14 text-sm text-[#9ca3af]">
              <Search className="mb-2 h-6 w-6 text-[#d1d5db]" />
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#9ca3af]">
                {totalHits} result{totalHits !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>

              {results.map((section) => {
                const [textColor, bgColor] = section.color.split(" ")
                return (
                  <div key={section.type} className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                    {/* Section header */}
                    <div className="flex items-center gap-2 border-b border-[#f4f5f7] bg-[#fafafa] px-4 py-2.5">
                      <div className={cn("flex h-5 w-5 items-center justify-center rounded-md", bgColor)}>
                        <section.icon className={cn("h-3 w-3", textColor)} />
                      </div>
                      <span className="text-xs font-semibold text-[#1a1a2e]">{section.label}</span>
                      <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e5e7eb] text-[9px] font-semibold text-[#6b7280]">
                        {section.items.length}
                      </span>
                    </div>

                    {/* Result rows */}
                    <div className="divide-y divide-[#f9fafb]">
                      {section.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#fafafa]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#0f2d5c] transition-colors">
                              <Highlight text={item.title} query={query} />
                            </p>
                            <p className="mt-0.5 text-xs text-[#9ca3af]">
                              <Highlight text={item.subtitle} query={query} />
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-[#9ca3af]">{item.meta}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#d1d5db] transition-colors group-hover:text-[#0f2d5c]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Highlight matching text ───────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-100 px-0.5 text-amber-800 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
