import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { buildFarmContext } from "@/lib/assistant-context";
import { BORDEN_TOOLS, executeTool } from "@/lib/assistant-tools";
import { USER_GUIDE } from "@/lib/user-guide";

const Timestamp = admin.firestore.Timestamp;

const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are Borden, the AI farm advisor for G&S Good Stuff — a dahlia tuber operation in Addison, NY (USDA Zone 5b, 42.04°N, 77.33°W, ~1020ft elevation).

You work for Gary and Suzy. Gary runs field operations from his iPhone (offline 80% of the time). Suzy manages orders and shipping from desktop.

Your personality:
- Practical and direct. No fluff. Warm but efficient.
- You know dahlias deeply — varieties, bloom forms, growing cycles, division techniques, storage, pest management, market timing.
- You speak like a knowledgeable neighbor, not a textbook.
- When you recommend an action, offer to DO it (create the task, update the status) using your tools. Ask first if it's a significant change.
- You reference actual farm data — zone names, variety names, real numbers from the context.
- Keep responses concise. Gary's reading on a phone in the field.

Growing season context:
- Last frost: May 15. First frost: October 1. 138-day season.
- Canisteo River valley — frost pocket, watch low-lying zones.
- Tuber lifecycle: stored → jugged → planted → growing → dug → divided → listed → sold
- Expected dig date: planted_date + 140 days
- Soil temp must reach 60°F before planting dahlias
- Division yield: typically 4 tubers per clump

Important rules:
- Always check the current date and season. Advice should be timely.
- Reference specific zones and varieties by name, not just IDs.
- If something needs doing, offer to create a task or checklist item.
- If weather data shows frost risk during growing season (May 15 - Oct 1), flag it urgently.
- If equipment is overdue for service, mention it proactively.
- When taking actions, briefly confirm what you did.

When Gary asks about the scripture of the day or asks for spiritual encouragement, reference the daily verse and connect it to the farm's mission and daily work. Speak from a place of faith and practical wisdom.

USER GUIDE (use this to answer "how do I" questions):
${USER_GUIDE}`;

export async function POST(request: Request) {
  try {
    const { conversationId, message, history = [] } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({
        response: "I'm not fully connected yet — the Anthropic API key hasn't been set. Ask Ward to run `firebase functions:secrets:set ANTHROPIC_API_KEY` or add it to `.env.local` as `ANTHROPIC_API_KEY`.",
        actions: [],
      });
    }

    // Build farm context
    let farmContext = '';
    try {
      farmContext = await buildFarmContext();
    } catch (err) {
      farmContext = 'Farm context unavailable — Firestore connection issue.';
    }

    // Build messages array for Claude
    const messages: any[] = [];

    // First message: farm context
    messages.push({
      role: "user",
      content: `Here is the current farm status. Use this data to answer my questions:\n\n${farmContext}`,
    });
    messages.push({
      role: "assistant",
      content: "Got it. I've reviewed the full farm status. What can I help with?",
    });

    // Conversation history
    for (const msg of history.slice(-20)) { // last 20 messages
      messages.push({ role: msg.role, content: msg.content });
    }

    // Current message
    messages.push({ role: "user", content: message });

    // Call Claude API
    let response = await callClaude(messages, ANTHROPIC_API_KEY);
    const actions: Array<{ tool: string; input: any; result: string }> = [];

    // Handle tool use — loop until Claude gives a text response
    let iterations = 0;
    while (response.stop_reason === "tool_use" && iterations < 5) {
      iterations++;
      const toolBlocks = response.content.filter((b: any) => b.type === "tool_use");
      const toolResults: any[] = [];

      for (const block of toolBlocks) {
        const result = await executeTool(block.name, block.input);
        actions.push({ tool: block.name, input: block.input, result });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }

      // Send tool results back to Claude
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await callClaude(messages, ANTHROPIC_API_KEY);
    }

    // Extract text response
    const textContent = response.content
      ?.filter((b: any) => b.type === "text")
      ?.map((b: any) => b.text)
      ?.join("\n") || "I couldn't generate a response. Try again.";

    // Save to Firestore if we have a conversation ID
    if (conversationId) {
      try {
        const convRef = adminDb.collection('assistant_conversations').doc(conversationId);
        const convSnap = await convRef.get();

        const userMsg = { role: 'user', content: message, created_at: Timestamp.now() };
        const assistantMsg = {
          role: 'assistant',
          content: textContent,
          ...(actions.length > 0 ? { actions_taken: actions } : {}),
          created_at: Timestamp.now(),
        };

        if (convSnap.exists) {
          await convRef.update({
            messages: admin.firestore.FieldValue.arrayUnion(userMsg, assistantMsg),
            updated_at: Timestamp.now(),
          });
        } else {
          await convRef.set({
            id: conversationId,
            title: message.substring(0, 50),
            messages: [userMsg, assistantMsg],
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          });
        }
      } catch {
        // Non-critical — conversation saves can fail silently
      }
    }

    return NextResponse.json({ response: textContent, actions });

  } catch (err: any) {
    console.error("Assistant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function callClaude(messages: any[], apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: BORDEN_TOOLS,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  return res.json();
}
