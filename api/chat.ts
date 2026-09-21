import type { IncomingMessage, ServerResponse } from "node:http";

type ChatRole = "user" | "model";
type ChatMessage = { role: ChatRole; content: string };
type RequestBody = { message?: unknown; history?: unknown };

type VercelRequest = IncomingMessage & { body?: unknown };

type JsonResponse = Record<string, unknown>;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_HISTORY_ITEMS = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 2_000;

const SYSTEM_INSTRUCTION = `You are the portfolio assistant for Josh Raven R. Velasco.
Answer questions about Josh's background, services, certificates, skills, and contact details using only the context below. Be concise, friendly, and professional. When asked about certificates or recognitions, include the complete list of all five items from the context. Always finish complete sentences and list items; never stop mid-word, mid-year, or mid-sentence. If a question is unrelated or the answer is not in the context, say that you do not have that information and suggest contacting Josh directly.

Portfolio context:
- Josh Raven R. Velasco is an Information Technology student based in Manila, Philippines.
- He studies BS Information Technology at Philippine Christian University Manila.
- His focus includes frontend systems, visual design, prototyping, IT foundations, troubleshooting, documentation, and digital workflows.
- His toolkit includes HTML, CSS, JavaScript, Figma, UI systems, Git, and GitHub.
- His certificates and recognitions include: Gold Awardee — Exemplary Academic Performance, PCU College of Informatics (Academic Year 2025–2026); Academic Excellence with Honors, Grade 11, PCU Senior High School (School Year 2022–2023); Academic Excellence Award with High Honors, Grade 12, PCU Senior High School (School Year 2023–2024); recognition for presenting “Learning Engagement and E-Learning Application toward Program Development Plan” at the PCU Basic Education Research Festival (April 2024); and 1st Year Outstanding Dean's Lister in BS Information Technology with a GWA of 1.31 (2025).
- Contact email: josh.velasco.coi@pcu.edu.ph.
- Phone: +63 994 867 0215.
- Location: Sta. Ana, Manila.
- Never invent a resume detail, credential, phone number, email, or link.`;

function getOrigin(): string {
  return process.env.ALLOWED_ORIGIN || "*";
}

function sendJson(res: ServerResponse, status: number, payload: JsonResponse): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", getOrigin());
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(payload));
}

async function readBody(req: VercelRequest): Promise<RequestBody> {
  if (req.body && typeof req.body === "object") {
    return req.body as RequestBody;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw) as RequestBody;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function cleanHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is { role?: unknown; content?: unknown } => Boolean(item) && typeof item === "object")
    .map((item): ChatMessage => ({
      role: item.role === "model" ? "model" : "user",
      content: typeof item.content === "string" ? item.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH) : "",
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY_ITEMS);
}

function makeContents(message: string, history: ChatMessage[]) {
  return [
    ...history.map((item) => ({ role: item.role, parts: [{ text: item.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];
}

function extractReply(data: any): string | null {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const reply = parts
    .filter((part: any) => typeof part?.text === "string")
    .map((part: any) => part.text)
    .join("\n")
    .trim();
  return reply || null;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST /api/chat." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, { error: "The chatbot is not configured yet. Add GEMINI_API_KEY to the Vercel environment variables." });
    return;
  }

  try {
    const body = await readBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      sendJson(res, 400, { error: "Please provide a message." });
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      sendJson(res, 413, { error: `Message is too long. Keep it under ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: makeContents(message, cleanHistory(body.history)),
            generationConfig: { temperature: 0.25, maxOutputTokens: 900 },
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await geminiResponse.json().catch(() => ({}));
    if (!geminiResponse.ok) {
      console.error("Gemini API error", geminiResponse.status, data);
      sendJson(res, 502, { error: "Gemini could not answer right now. Please try again shortly." });
      return;
    }

    const reply = extractReply(data);
    if (!reply) {
      sendJson(res, 502, { error: "Gemini returned an empty response. Please try again." });
      return;
    }

    sendJson(res, 200, { reply, model: MODEL });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      sendJson(res, 504, { error: "The chatbot took too long to respond. Please try again." });
      return;
    }

    console.error("Chat handler error", error);
    sendJson(res, 500, { error: "Unable to process the chat request." });
  }
}
