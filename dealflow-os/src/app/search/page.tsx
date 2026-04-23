"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sparkles, Search, ArrowRight, Building2, Users, Briefcase,
  CalendarDays, Loader2, CornerDownLeft, X, Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
}

interface Citation {
  type: "deal" | "contact" | "company" | "meeting"
  label: string
  href: string
}

// ── Suggested queries ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What's the status of the Badia Spices deal?",
  "Which deals are at LOI stage?",
  "Show me all overdue tasks",
  "Summarise the Goldman process update",
  "Who is the banker on Meridian Logistics?",
  "What are the key risks for Badia?",
  "Which contacts haven't been reached in 30+ days?",
  "What did we discuss in the ClearPath IC meeting?",
]

// ── Context snapshot sent with every query ────────────────────────────────────

const CONTEXT = `
You are DealFlow OS, an AI assistant embedded in a private equity CRM platform.
You have access to the following deal and contact data:

DEALS:
- Badia Spices | Stage: LOI | EV: $952M | EBITDA: $85M | Multiple: 11.2x | Banker: Goldman Sachs (Marcus Reinholt) | Lead: James Dixon | Team: JD, SR, MK | Status: Active | Priority: High | Process deadline: May 12 2026 | IC: May 20 2026 | Description: Leading spices & seasonings manufacturer, 55yr history, Miami FL, family-owned, 1400+ SKUs, 27% EBITDA margin, Walmart ~28% customer concentration, management willing to roll 15-20%.
- Meridian Logistics | Stage: Due Diligence | EV: $422M | EBITDA: $38M | Multiple: 11.1x | Banker: Jefferies (Derek Cho) | Lead: Sarah Reynolds | Status: Active | QoE underway with FTI.
- Nova Health Systems | Stage: Management Meeting | EV: $281M | EBITDA: $24M | Multiple: 11.7x | Banker: William Blair (Rachel Kim) | Lead: James Dixon | Status: Active | 22-location dental/primary care platform, Tennessee & Kentucky.
- ClearPath Analytics | Stage: IC Approved | EV: $162M | EBITDA: $9M | Multiple: 18x | Banker: Houlihan Lokey | Lead: Thomas Laurier | Status: Active | 52% ARR growth, insurance analytics SaaS.
- Peak Industrial | Stage: Initial Review | EV: $190M | EBITDA: $19M | Banker: Baird | Status: Active | Low priority.

CONTACTS:
- Marcus Reinholt | MD, Goldman Sachs | Banker | Warmth: 5/5 | Deal: Badia Spices
- Sofia Badia | CEO & Founder, Badia Spices | Founder | Warmth: 4/5
- Derek Cho | VP, Jefferies | Banker | Warmth: 3/5 | Deal: Meridian Logistics
- Priya Venkatesh | CFO, Meridian Logistics | Management | Warmth: 4/5
- Thomas Laurier | Director Lev Fin, JPMorgan | Lender | Warmth: 3/5 | Deals: Badia, Meridian
- Rachel Kim | Principal, William Blair | Banker | Warmth: 2/5 | Deal: Nova
- James Whitfield | CEO, Nova Health Systems | Founder | Warmth: 3/5
- Anne Delacroix | LP Relations, Brookfield | LP | Warmth: 4/5 | Co-invest appetite up to $150M

RECENT MEETINGS:
- Apr 21: Badia Spices Management Presentation (JD, SR, MK, Sofia Badia, Marcus Reinholt). Summary: Strong mgmt team, SKU rationalisation opportunity, Walmart concentration risk, management to roll 15-20%.
- Apr 20: ClearPath IC Meeting — APPROVED at up to $165M EV. Conditions: mgmt rollover min 10%, ARR ratchet, standard reps.
- Apr 19: Meridian QoE Kickoff with FTI. Revenue recognition conservative. WC normalisation +$2M EBITDA.
- Apr 17: Goldman Process Update — 6 parties in round 2, bid deadline May 12, 9-12x range expected.

OPEN TASKS (OVERDUE):
- Send revised LOI to Goldman [JD, overdue]
- Request 5-yr historical P&L [MK, overdue]
- Schedule Badia plant visit [JD, overdue]
- Obtain Meridian fleet schedule [SR, overdue]

Answer questions concisely and accurately based on this data. Format key figures in bold. Use bullet points for lists. If something isn't in the data, say so clearly.
`.trim()

// ── Streaming fetch ────────────────────────────────────────────────────────────

async function streamQuery(
  query: string,
  history: Message[],
  onChunk: (chunk: string) => void,
  onCitations: (c: Citation[]) => void
): Promise<void> {
  const res = await fetch("/api/ai-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, history, context: CONTEXT }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "API error")
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim()
        if (data === "[DONE]") return
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === "text")       onChunk(parsed.text)
          if (parsed.type === "citations")  onCitations(parsed.citations)
        } catch {}
      }
    }
  }
}

// ── Citation pill ─────────────────────────────────────────────────────────────

const CITATION_ICON: Record<string, React.ReactNode> = {
  deal:    <Briefcase   className="h-3 w-3" />,
  contact: <Users       className="h-3 w-3" />,
  company: <Building2   className="h-3 w-3" />,
  meeting: <CalendarDays className="h-3 w-3" />,
}

function CitationPill({ c }: { c: Citation }) {
  return (
    <a
      href={c.href}
      className="inline-flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-[#f4f5f7] px-2.5 py-1 text-[11px] font-medium text-[#4b5563] transition-colors hover:border-[#0f2d5c]/30 hover:bg-[#0f2d5c]/5 hover:text-[#0f2d5c]"
    >
      {CITATION_ICON[c.type]}
      {c.label}
    </a>
  )
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-lg rounded-2xl rounded-tr-sm bg-[#0f2d5c] px-4 py-2.5 text-sm text-white">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f2d5c]/10 mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-[#0f2d5c]" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div
          className="prose prose-sm max-w-none text-[#1a1a2e] leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/^- (.+)$/gm, "<li>$1</li>")
              .replace(/(<li>.*<\/li>)/s, "<ul class='pl-4 space-y-1 my-1'>$1</ul>")
              .replace(/\n/g, "<br/>"),
          }}
        />
        {msg.citations && msg.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.citations.map((c, i) => (
              <CitationPill key={i} c={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [history, setHistory]     = useState<{ date: string; query: string }[]>([])
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function submit(query: string) {
    if (!query.trim() || loading) return

    const userMsg: Message = { role: "user", content: query }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setError(null)
    setHistory((prev) => [{ date: new Date().toLocaleTimeString(), query }, ...prev.slice(0, 9)])

    const assistantMsg: Message = { role: "assistant", content: "", citations: [] }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      await streamQuery(
        query,
        messages,
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: next[next.length - 1].content + chunk,
            }
            return next
          })
        },
        (citations) => {
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { ...next[next.length - 1], citations }
            return next
          })
        }
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong"
      setError(msg)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function clear() {
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] gap-5">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f2d5c]/10">
              <Sparkles className="h-3.5 w-3.5 text-[#0f2d5c]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">AI Search</p>
              <p className="text-[10px] text-[#9ca3af]">claude-sonnet-4-6 · DealFlow context</p>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={clear}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9ca3af] transition-colors hover:bg-[#f4f5f7] hover:text-[#6b7280]"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Messages / empty state */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f2d5c]/8">
                <Sparkles className="h-7 w-7 text-[#0f2d5c]" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-[#1a1a2e]">Ask anything about your deals</h2>
              <p className="mt-1.5 max-w-xs text-center text-sm text-[#9ca3af]">
                Search across deals, contacts, meetings, and tasks using natural language.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fafafa] px-3.5 py-2.5 text-left text-xs text-[#4b5563] transition-colors hover:border-[#0f2d5c]/30 hover:bg-[#0f2d5c]/5 hover:text-[#0f2d5c]"
                  >
                    <ArrowRight className="h-3 w-3 shrink-0 text-[#9ca3af]" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f2d5c]/10">
                    <Sparkles className="h-3.5 w-3.5 text-[#0f2d5c]" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0f2d5c]/40 [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0f2d5c]/40 [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0f2d5c]/40" />
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#e5e7eb] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#fafafa] px-4 py-2.5 focus-within:border-[#0f2d5c]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0f2d5c]/10 transition-all">
            <Search className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input) } }}
              placeholder="Ask about deals, contacts, tasks, or meetings…"
              className="flex-1 bg-transparent text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={() => submit(input)}
              disabled={!input.trim() || loading}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                input.trim() && !loading
                  ? "bg-[#0f2d5c] text-white hover:bg-[#0f2d5c]/90"
                  : "bg-[#e5e7eb] text-[#9ca3af]"
              )}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CornerDownLeft className="h-3.5 w-3.5" />
              }
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-[#9ca3af]">
            Answers grounded in your live deal data · claude-sonnet-4-6
          </p>
        </div>
      </div>

      {/* Sidebar — suggestions + history */}
      <div className="flex w-56 shrink-0 flex-col gap-4">
        {/* Suggested */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
            Suggested
          </p>
          <div className="space-y-1">
            {SUGGESTIONS.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                disabled={loading}
                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#4b5563] transition-colors hover:bg-[#f4f5f7] hover:text-[#0f2d5c]"
              >
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#9ca3af]" />
                <span className="leading-snug">{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent */}
        {history.length > 0 && (
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
              Recent
            </p>
            <div className="space-y-1">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => submit(h.query)}
                  disabled={loading}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#4b5563] transition-colors hover:bg-[#f4f5f7]"
                >
                  <Clock className="mt-0.5 h-3 w-3 shrink-0 text-[#9ca3af]" />
                  <span className="truncate leading-snug">{h.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
