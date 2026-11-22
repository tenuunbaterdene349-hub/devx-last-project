import { NextResponse } from "next/server";

const BUG_CATEGORIES = [
  "Off-by-One",
  "Type Mismatch",
  "Null / Undefined",
  "Async / Race Condition",
  "Scope / Closure",
  "Syntax / Reference",
  "Logic Flaw",
] as const;

function toCleanText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => toCleanText(item, ""))
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2).trim();
  }
  return fallback;
}

async function pickAvailableGroqModel(apiKey: string): Promise<string> {
  const preferredOrder = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      const ids: string[] = Array.isArray(json?.data)
        ? json.data.map((m: { id?: string }) => m.id).filter((id: string | undefined): id is string => Boolean(id))
        : [];

      for (const candidate of preferredOrder) {
        if (ids.includes(candidate)) return candidate;
      }

      const fallbackChatModel = ids.find(
        (id) => !id.includes("whisper") && !id.includes("guard") && !id.includes("tts")
      );
      if (fallbackChatModel) return fallbackChatModel;
    }
  } catch {
    // Fall through to default below
  }

  return preferredOrder[0];
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing in .env.local. Add it and restart the dev server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const language = typeof body.language === "string" ? body.language.trim() : "Python";
    const brokenCode = typeof body.brokenCode === "string" ? body.brokenCode.trim() : "";
    const errorOutput = typeof body.errorOutput === "string" ? body.errorOutput.trim() : "";

    if (!brokenCode) {
      return NextResponse.json({ error: "Please paste some broken code first." }, { status: 400 });
    }

    const model = await pickAvailableGroqModel(apiKey);

    const systemPrompt = `You are an expert software engineer and coding mentor running a "Bug Autopsy Lab".
Analyze the user's broken code and optional error message, then respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Short 3-6 word name of the bug (e.g., Off-by-One Loop Bound)",
  "bug_category": "One of: ${BUG_CATEGORIES.join(", ")}",
  "diagnosis": "Clear 2-3 sentence plain-English explanation of the root cause and why it fails.",
  "fixed_code": "The complete corrected code snippet, clean and ready to run.",
  "walkthrough": "Concise bullet-style or step-by-step explanation of the exact changes made.",
  "challenge_code": "A brand-new, short 6-14 line code snippet in the SAME language containing the EXACT SAME bug pattern in a different scenario, so the student can practice spotting it later. Do NOT put comments giving away the answer.",
  "challenge_hint": "A subtle 1-sentence hint pointing toward what to inspect in challenge_code without spoiling the exact fix."
}`;

    const userPrompt = `Language: ${language}
Error Message / Traceback: ${errorOutput || "None provided — inspect the code for runtime or logic bugs."}

Broken Code:
\`\`\`
${brokenCode}
\`\`\``;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json(
        { error: `Groq API error (${groqRes.status}) using model "${model}": ${errText}` },
        { status: 502 }
      );
    }

    const completion = await groqRes.json();
    const rawContent = completion?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "AI returned an empty response." }, { status: 502 });
    }

    const parsed = JSON.parse(rawContent) as Record<string, unknown>;

    return NextResponse.json({
      title: toCleanText(parsed.title, `${language} Bug Autopsy`),
      bug_category: toCleanText(parsed.bug_category, "Logic Flaw"),
      diagnosis: toCleanText(parsed.diagnosis, "No diagnosis generated."),
      fixed_code: toCleanText(parsed.fixed_code, brokenCode),
      walkthrough: toCleanText(parsed.walkthrough, ""),
      challenge_code: toCleanText(parsed.challenge_code, ""),
      challenge_hint: toCleanText(parsed.challenge_hint, ""),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}