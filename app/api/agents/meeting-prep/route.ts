import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // ── API key check ────────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Meeting prep error: ANTHROPIC_API_KEY is not set");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Meeting prep error: failed to parse request body", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    userName = "John Moffa",
    meetingType = "Introductory Call",
    company = "Unknown",
    industry = "Technology",
    companyDescription,
    prior = "First meeting",
    participants = 3,
    stakeholders,
  } = body;

  try {
    const stakeholderList = Array.isArray(stakeholders)
      ? stakeholders.join(", ")
      : (stakeholders as string) || "None specified";

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const systemPrompt = `You are a meeting intelligence AI preparing ${userName} for customer meetings. Your job is to create structured, actionable briefs tailored specifically to ${userName}.

IMPORTANT: Do not use em dashes (the long dash character) anywhere in your output. Use commas, colons, or periods instead.

You must return ONLY a valid JSON object. No markdown, no code fences, no explanation. The JSON must have exactly these keys:
{
  "date": "string: today's formatted date",
  "title": "string: a sharp meeting title (e.g. 'Enterprise Onboarding Review, Q3 Kickoff')",
  "summary": "string: DETAILED 4-5 sentence meeting overview. Must cover all five of these in order: (1) who is attending and why their presence signals strategic importance, (2) what the specific meeting objective is, (3) what the key challenges or opportunities are for this specific company and industry. Use real context about the company, not generic filler. (4) what tone to set and why, (5) what a successful outcome looks like in concrete terms (e.g. pilot agreed, follow-up scheduled, decision made). Do NOT write generic boilerplate. Every sentence must be specific to the company, meeting type, and stakeholders provided.",
  "sentiment": "string: one of: Positive, Neutral, Cautious, At Risk",
  "readiness": "string: one of: High, Medium, Low",
  "transcript": "string: a plausible 4-6 exchange prior meeting transcript if prior meetings > 0, otherwise empty string",
  "nextSteps": ["array of EXACTLY 3-5 next steps. Each must follow this exact format: '[Owner]: [Action]' where Owner is one of: You, Account Exec, Solutions Engineer, Both. Choose based on who should actually own this action. Action must be a single concrete task, maximum 12 words, specific to this meeting. No vague items like 'follow up' or 'circle back'. Order by stakeholder priority: Founder/CEO actions first, then Exec Team, then Sales VP, then others. No duplicate or near-duplicate actions."],
  "recommendation": "string: 1-2 sentence strategic recommendation from ${userName}'s POV",
  "email": "string: a complete professional follow-up email signed by ${userName}, plain text, with subject line on first line"
}

Stakeholder priority weighting: Founder/CEO > Exec Team > Sales VP > HR > IT/Security Team > Account Exec.`;

    const userPrompt = `Generate a meeting brief for:
- Your Name: ${userName}
- Meeting Type: ${meetingType}
- Customer Company: ${company}
- ${userName}'s Industry: ${industry}${companyDescription ? `\n- About ${userName}'s Company: ${companyDescription}` : ""}
- Prior Meetings: ${prior === "First meeting" ? "0 (first meeting)" : prior}
- Number of Participants: ${participants}
- Key Stakeholders Present: ${stakeholderList}
- Today's Date: ${today}

Return ONLY the raw JSON object.`;

    // ── Call Anthropic ───────────────────────────────────────────────────────────
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      const isAuthError = response.status === 401;
      const isRateLimit = response.status === 429;
      return NextResponse.json(
        {
          error: isAuthError
            ? "Invalid API key. Check your Anthropic credentials."
            : isRateLimit
            ? "Rate limited. Please wait a moment and try again."
            : `Anthropic API error ${response.status}`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text ?? "";

    // ── Parse JSON — strip markdown fences if present ────────────────────────
    let brief: unknown;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      brief = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("Meeting prep error: JSON parse failed. Raw response:", text);
      console.error("Parse error:", parseErr);
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(brief);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("timed out");
    console.error("Meeting prep error:", err);
    return NextResponse.json(
      {
        error: isTimeout
          ? "Request timed out. Please try again."
          : "Something went wrong generating your brief",
      },
      { status: 500 }
    );
  }
}
