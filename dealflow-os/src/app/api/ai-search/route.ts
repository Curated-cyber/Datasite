import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"

export const runtime = "nodejs"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface HistoryMessage {
  role: "user" | "assistant"
  content: string
}

// Detect deal/contact/company/meeting references in the response text
// and surface them as citation pills on the client.
function extractCitations(text: string) {
  const citations: { type: string; label: string; href: string }[] = []
  const seen = new Set<string>()

  const DEAL_MAP: Record<string, string> = {
    "badia spices":        "/deals/badia",
    "meridian logistics":  "/deals/meridian",
    "nova health":         "/deals/nova",
    "clearpath analytics": "/deals/clearpath",
    "peak industrial":     "/deals/peak",
  }

  const CONTACT_MAP: Record<string, string> = {
    "marcus reinholt":   "/contacts",
    "sofia badia":       "/contacts",
    "derek cho":         "/contacts",
    "priya venkatesh":   "/contacts",
    "thomas laurier":    "/contacts",
    "rachel kim":        "/contacts",
    "james whitfield":   "/contacts",
    "anne delacroix":    "/contacts",
  }

  const lower = text.toLowerCase()

  for (const [name, href] of Object.entries(DEAL_MAP)) {
    if (lower.includes(name) && !seen.has(href)) {
      seen.add(href)
      citations.push({
        type: "deal",
        label: name.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
        href,
      })
    }
  }

  for (const [name, href] of Object.entries(CONTACT_MAP)) {
    const key = name + href
    if (lower.includes(name) && !seen.has(key)) {
      seen.add(key)
      citations.push({
        type: "contact",
        label: name.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
        href,
      })
    }
  }

  return citations
}

export async function POST(req: NextRequest) {
  try {
    const { query, history, context } = (await req.json()) as {
      query: string
      history: HistoryMessage[]
      context: string
    }

    if (!query?.trim()) {
      return new Response("Missing query", { status: 400 })
    }

    // Build message history for multi-turn conversation
    const messages: Anthropic.MessageParam[] = [
      // Previous turns
      ...((history ?? []) as HistoryMessage[]).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      // Current user message
      { role: "user" as const, content: query },
    ]

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        function send(data: object) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        }

        try {
          let fullText = ""

          const anthropicStream = await client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: context,
            messages,
          })

          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullText += event.delta.text
              send({ type: "text", text: event.delta.text })
            }
          }

          // After full response, emit any citations we detected
          const citations = extractCitations(fullText)
          if (citations.length > 0) {
            send({ type: "citations", citations })
          }

          send("[DONE]")
        } catch (err) {
          const message = err instanceof Error ? err.message : "Anthropic API error"
          send({ type: "error", message })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return new Response(message, { status: 500 })
  }
}
