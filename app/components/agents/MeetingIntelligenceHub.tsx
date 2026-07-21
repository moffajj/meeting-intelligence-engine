"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import ActionItemTracker, { ActionItem } from "./ActionItemTracker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Participant {
  name: string;
  role: string;
  company: string;
  isYou?: boolean;
}

export interface Meeting {
  id: string;
  date: string;
  title: string;
  type: string;
  duration: string;
  participants: Participant[];
  summary: string;
  actions: string[];
  transcript: Array<{ speaker: string; text: string }>;
}

export interface MeetingIntelligenceHubProps {
  company: string;
  currentMeeting: Meeting;
  allMeetings: Meeting[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#0a0a0a",
  card: "#111",
  surface: "#1a1a1a",
  border: "#1e1e1e",
  borderSubtle: "rgba(255,255,255,0.06)",
  amber: "#c9a84c",
  amberBg: "rgba(201,168,76,0.08)",
  amberBorder: "rgba(201,168,76,0.25)",
  head: "#f0ede8",
  body: "#aaa",
  muted: "#555",
  green: "#1D9E75",
  greenBg: "rgba(29,158,117,0.08)",
  blue: "#378ADD",
  blueBg: "rgba(55,138,221,0.12)",
  blueBorder: "rgba(55,138,221,0.25)",
} as const;

// ─── Historical meetings generator ───────────────────────────────────────────

function generateHistoricalMeetings(company: string): Meeting[] {
  return [
    {
      id: "prev-1",
      date: "2024-11-12",
      title: `${company} Initial Discovery Call`,
      type: "Discovery",
      duration: "45 min",
      participants: [
        { name: "Sarah Chen", role: "VP of Sales", company },
        { name: "Marcus Webb", role: "Head of Ops", company },
        { name: "John Moffa", role: "Account Executive", company: "Your Company", isYou: true },
      ],
      summary: `Initial discovery call with ${company}. Discussed current pain points around workflow automation and cross-team coordination. Sarah shared that their current tooling creates friction between sales and ops.`,
      actions: [
        "Send product overview deck to Sarah Chen",
        "Schedule technical demo for ops team",
        "Follow up with ROI calculator",
      ],
      transcript: [
        { speaker: "John Moffa", text: `Thanks for making time today. I'd love to learn more about what's driving your interest in exploring solutions like ours.` },
        { speaker: "Sarah Chen", text: `Of course. We've been struggling with our current tooling — the team is spending too much time on manual coordination between departments.` },
        { speaker: "Marcus Webb", text: `Exactly. Our ops team alone loses about 6 hours a week just reconciling data across systems. It's become a real bottleneck.` },
        { speaker: "John Moffa", text: `That's a significant cost. Can you walk me through what your current workflow looks like? I want to make sure we're solving the right problem.` },
        { speaker: "Sarah Chen", text: `Sure. Right now everything flows through email and spreadsheets. It works until it doesn't — and lately it hasn't been working.` },
        { speaker: "Marcus Webb", text: `And the reporting is a nightmare. Every Monday we manually pull numbers from four different systems before we can even build a summary.` },
        { speaker: "John Moffa", text: `How many people are involved in that process each week?` },
        { speaker: "Sarah Chen", text: `At minimum four or five people touch it before the data is in a shape leadership can use. It's embarrassing how manual it is.` },
        { speaker: "John Moffa", text: `What does success look like for you in year one if this gets solved?` },
        { speaker: "Marcus Webb", text: `Honestly? Cutting that manual reconciliation work in half would be transformative. Our team would get 3 hours back per week each.` },
        { speaker: "Sarah Chen", text: `And giving leadership real-time visibility instead of waiting for the Monday report. We make decisions on stale data constantly.` },
        { speaker: "John Moffa", text: `That's exactly what we've built for. Let me share a couple of customer examples from companies at similar stages — I think you'll see yourself in them.` },
      ],
    },
    {
      id: "prev-2",
      date: "2024-12-03",
      title: `${company} Technical Deep Dive`,
      type: "Technical Review",
      duration: "60 min",
      participants: [
        { name: "Daniel Park", role: "CTO", company },
        { name: "Sarah Chen", role: "VP of Sales", company },
        { name: "John Moffa", role: "Account Executive", company: "Your Company", isYou: true },
        { name: "Alex Torres", role: "Solutions Engineer", company: "Your Company" },
      ],
      summary: `Technical review session with ${company}'s engineering leadership. Daniel raised questions about data security, API rate limits, and migration timeline. Alex presented the integration architecture.`,
      actions: [
        "Send security whitepaper and SOC 2 documentation",
        "Schedule sandbox environment access for Daniel's team",
        "Draft migration timeline proposal",
      ],
      transcript: [
        { speaker: "Daniel Park", text: `Before we go further, I need to understand your security posture. We handle a lot of sensitive customer data and that's non-negotiable for us.` },
        { speaker: "Alex Torres", text: `Totally fair. We're SOC 2 Type II certified, all data is encrypted at rest and in transit, and we have a dedicated security review process for enterprise customers.` },
        { speaker: "Daniel Park", text: `Good. What about the migration path? We have 3 years of data in our current system. That's a real concern.` },
        { speaker: "John Moffa", text: `We have a dedicated migration team and we've handled similar migrations with companies your size. Typically 4 to 6 weeks with zero downtime.` },
        { speaker: "Sarah Chen", text: `That timeline works for us. We were worried it would take months.` },
        { speaker: "Daniel Park", text: `What does the API rate limiting look like? Our ops team builds a lot of internal tooling and they'll be hitting the API frequently.` },
        { speaker: "Alex Torres", text: `Enterprise tier gets 10,000 API calls per minute with burst capacity built in. We can increase that if you need more headroom.` },
        { speaker: "Daniel Park", text: `That should be sufficient for now. What's your uptime SLA?` },
        { speaker: "Alex Torres", text: `We offer 99.9% uptime SLA for enterprise. In practice we've been at 99.97% over the past 18 months. I can send you the incident history.` },
        { speaker: "Daniel Park", text: `Okay. Can we get access to a sandbox environment before we make a final decision?` },
        { speaker: "John Moffa", text: `Absolutely. We can spin that up today — you'll have credentials by end of week and your team can poke around with real-like data.` },
        { speaker: "Sarah Chen", text: `Daniel, does this address the concerns that came out of your IT review last week?` },
        { speaker: "Daniel Park", text: `Mostly yes. I still want to review the data residency options. We have some EU customers and that could be a compliance issue.` },
        { speaker: "Alex Torres", text: `We support US and EU data residency on enterprise plans. I'll include the full data handling documentation in the follow-up we send today.` },
      ],
    },
    {
      id: "prev-3",
      date: "2025-01-15",
      title: `${company} Proposal Review`,
      type: "Proposal Review",
      duration: "30 min",
      participants: [
        { name: "James Holloway", role: "CFO", company },
        { name: "Sarah Chen", role: "VP of Sales", company },
        { name: "John Moffa", role: "Account Executive", company: "Your Company", isYou: true },
      ],
      summary: `Proposal review with ${company}'s finance team. James requested a 10% discount and extended payment terms. Sarah confirmed internal buy-in from her team. Deal is close to signing.`,
      actions: [
        "Send revised proposal with adjusted pricing",
        "Get legal to review contract terms",
        "Follow up with James on signature timeline",
      ],
      transcript: [
        { speaker: "James Holloway", text: `We've reviewed the proposal. The pricing is higher than we anticipated. Is there room to negotiate, especially given the contract length we're committing to?` },
        { speaker: "John Moffa", text: `I appreciate you being direct about that. For a 24-month commitment, I can bring this back to my team and likely get you something meaningful on price.` },
        { speaker: "Sarah Chen", text: `We're serious buyers here. This is the top priority for our ops transformation and we want to move quickly.` },
        { speaker: "James Holloway", text: `If you can come back with a revised number, I think we can get this signed by end of quarter.` },
        { speaker: "John Moffa", text: `Let me get back to you within 48 hours. I'm confident we can make this work.` },
        { speaker: "James Holloway", text: `While we have you — what does implementation support look like? Is that included in the price, or is it a separate line item?` },
        { speaker: "John Moffa", text: `Implementation is fully included for the first 90 days. You get a dedicated customer success manager, weekly check-ins, and we train your entire team at no additional cost.` },
        { speaker: "Sarah Chen", text: `That's important to us. Our last vendor handed us a login and disappeared. We ended up doing a partial rollout because nobody knew how to use it.` },
        { speaker: "James Holloway", text: `What's the minimum commitment term on the contract?` },
        { speaker: "John Moffa", text: `Standard is 12 months, but 24 months unlocks a significantly better per-seat rate, which is what I'll factor into the revised proposal I send you.` },
        { speaker: "James Holloway", text: `And what happens at renewal? Is the pricing locked or can it change?` },
        { speaker: "John Moffa", text: `Pricing is locked for the full initial term. At renewal it's CPI plus a maximum of two percent — we put that in writing in the contract.` },
        { speaker: "Sarah Chen", text: `That's actually better than our current vendor. They hit us with a 15% increase at renewal last year and we had no protection.` },
      ],
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(name: string): string {
  const colors = ["#c9a84c", "#378ADD", "#1D9E75", "#a855f7", "#f97316", "#ef4444"];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function typeBadgeColor(type: string): { bg: string; color: string } {
  switch (type.toLowerCase()) {
    case "discovery": return { bg: "rgba(55,138,221,0.12)", color: "#378ADD" };
    case "technical review": return { bg: "rgba(168,85,247,0.12)", color: "#a855f7" };
    case "proposal review": return { bg: "rgba(201,168,76,0.12)", color: "#c9a84c" };
    case "onboarding": return { bg: "rgba(29,158,117,0.12)", color: "#1D9E75" };
    default: return { bg: "rgba(255,255,255,0.06)", color: "#aaa" };
  }
}

// ─── Mock Q&A responses ───────────────────────────────────────────────────────

function generateMockResponse(question: string, meetings: Meeting[], company: string): string {
  const q = question.toLowerCase();

  if (/action|next step|todo|follow.?up/i.test(q)) {
    const allActions = meetings.flatMap((m) => m.actions);
    const unique = [...new Set(allActions)].slice(0, 5);
    return `Across your ${meetings.length} meetings with ${company}, here are the open action items:\n\n${unique.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nThe most recent items from the ${meetings[meetings.length - 1]?.title || "latest meeting"} should be your top priority.`;
  }

  if (/concern|risk|blocker|issue|problem/i.test(q)) {
    return `From your meeting history with ${company}, two concerns have come up consistently: (1) data security and compliance requirements raised by their CTO, and (2) migration complexity from their existing system. Both were addressed in the Technical Review but may resurface. Pricing sensitivity also emerged in the Proposal Review with their CFO.`;
  }

  if (/who|participant|stakeholder|contact|attend/i.test(q)) {
    const allPeople = meetings
      .flatMap((m) => m.participants)
      .filter((p) => !p.isYou)
      .reduce<Record<string, Participant>>((acc, p) => {
        if (!acc[p.name]) acc[p.name] = p;
        return acc;
      }, {});
    const people = Object.values(allPeople);
    return `You have engaged with ${people.length} contacts at ${company} across these meetings:\n\n${people.map((p) => `${p.name} (${p.role})`).join(", ")}.\n\nSarah Chen has been the most consistent champion throughout the process.`;
  }

  if (/sentiment|feeling|vibe|progress|status|deal/i.test(q)) {
    return `The overall sentiment with ${company} is positive and trending toward close. Discovery revealed strong pain with their current tools, the technical review went well once security questions were answered, and the Proposal Review ended with CFO James Holloway indicating they can sign by end of quarter with revised pricing. Momentum is strong.`;
  }

  if (/price|cost|budget|discount|money/i.test(q)) {
    return `Pricing was a topic in the most recent Proposal Review. James Holloway (CFO) asked for a discount and extended payment terms. The meeting ended with an agreement to send a revised proposal. A 24-month commitment is expected, which should unlock a meaningful price reduction.`;
  }

  if (/summary|recap|overview|catch up/i.test(q)) {
    return `Here's a summary of your engagement with ${company} across ${meetings.length} meetings:\n\n1. Discovery Call (Nov 12): Identified workflow automation gaps and manual coordination issues.\n2. Technical Deep Dive (Dec 3): Addressed security, API, and migration concerns.\n3. Proposal Review (Jan 15): CFO requested revised pricing. Deal close expected by end of quarter.\n\nYou are in a strong position heading into today's meeting.`;
  }

  return `Based on your ${meetings.length} meetings with ${company}, the engagement has been strong with clear progression from discovery through to negotiation. Key contacts include Sarah Chen (VP Sales), Daniel Park (CTO), and James Holloway (CFO). The deal appears well-positioned. Is there a specific aspect you would like to dig into?`;
}

// ─── Chat message ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
}

const SUGGESTION_CHIPS = [
  "What are all the open action items?",
  "What concerns have they raised?",
  "Who have I spoken with at this company?",
  "What's the overall deal sentiment?",
];

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "Ask" | "Participants" | "Action Items" | "Transcripts";
const TABS: Tab[] = ["Ask", "Participants", "Action Items", "Transcripts"];

// ─── Transcript helpers ───────────────────────────────────────────────────────

function toVTTTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.000`;
}

function buildVTT(meeting: Meeting): string {
  let vtt = `WEBVTT\n\nNOTE Meeting: ${meeting.title}\nNOTE Date: ${meeting.date}\n\n`;
  let cursor = 0;
  meeting.transcript.forEach((line, i) => {
    const duration = 15 + Math.round(line.text.length * 0.045);
    const start = toVTTTime(cursor);
    cursor += duration;
    const end = toVTTTime(cursor);
    cursor += 5;
    vtt += `${i + 1}\n${start} --> ${end}\n${line.speaker}: ${line.text}\n\n`;
  });
  return vtt;
}

function downloadVTT(meeting: Meeting) {
  const vtt = buildVTT(meeting);
  const blob = new Blob([vtt], { type: "text/vtt" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = meeting.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  a.download = `${slug}-${meeting.date}-transcript.vtt`;
  a.click();
  URL.revokeObjectURL(url);
}

function highlightKeywords(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(
    new RegExp(escaped, "gi"),
    (m) => `<mark style="background:rgba(201,168,76,0.35);color:#f0ede8;border-radius:2px;padding:0 2px;">${m}</mark>`
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function countMatches(meeting: Meeting, query: string): number {
  if (!query.trim()) return 0;
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return meeting.transcript.reduce((sum, line) => {
    return sum + (line.text.match(re)?.length ?? 0) + (line.speaker.match(re)?.length ?? 0);
  }, 0);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MeetingIntelligenceHub({ company, currentMeeting, allMeetings: externalMeetings }: MeetingIntelligenceHubProps) {
  const historicalMeetings = generateHistoricalMeetings(company);
  const allMeetings: Meeting[] = [...historicalMeetings, ...(externalMeetings || []), currentMeeting].filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(allMeetings.map((m) => m.id)));
  const [activeTab, setActiveTab] = useState<Tab>("Ask");
  const [activeMeetingId, setActiveMeetingId] = useState<string>(currentMeeting.id);
  const [scopeView, setScopeView] = useState<"All" | "Selected">("All");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "ai",
      text: `Welcome! I have access to your full meeting history with ${company} — ${allMeetings.length} meetings total. Ask me anything about your engagements, action items, contacts, or deal status.`,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Transcript state
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);
  const [globalTranscriptSearch, setGlobalTranscriptSearch] = useState("");
  const [perCardSearch, setPerCardSearch] = useState<Record<string, string>>({});

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const scopedMeetings = scopeView === "All"
    ? allMeetings
    : allMeetings.filter((m) => selectedIds.has(m.id));

  function toggleMeetingSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiText = generateMockResponse(trimmed, scopedMeetings, company);
      const aiMsg: ChatMessage = { id: Date.now() + 1, role: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  }

  // All action items from scoped meetings
  const allActionItems: ActionItem[] = scopedMeetings.flatMap((mtg) =>
    mtg.actions.map((text, i) => ({
      id: `${mtg.id}-action-${i}`,
      text,
      owner: "John Moffa",
      done: false,
      autoDone: false,
      autoType: null as null,
      due: null,
    }))
  );

  // Participants across scoped meetings
  const allParticipants = scopedMeetings
    .flatMap((m) => m.participants)
    .reduce<Record<string, Participant & { meetings: string[] }>>((acc, p) => {
      if (!acc[p.name]) {
        acc[p.name] = { ...p, meetings: [] };
      }
      return acc;
    }, {});

  scopedMeetings.forEach((m) => {
    m.participants.forEach((p) => {
      if (allParticipants[p.name]) {
        if (!allParticipants[p.name].meetings.includes(m.title)) {
          allParticipants[p.name].meetings.push(m.title);
        }
      }
    });
  });

  const yourTeam = Object.values(allParticipants).filter((p) => p.isYou || p.company === "Your Company");
  const theirTeam = Object.values(allParticipants).filter((p) => !p.isYou && p.company !== "Your Company");

  return (
    <LazyMotion features={domAnimation}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden",
          marginTop: 24,
        }}
      >
        {/* Section header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: C.head, letterSpacing: "-0.01em", margin: 0 }}>
                Meeting Intelligence Hub
              </h4>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>
                Ask questions across your full meeting history with this company.
              </p>
            </div>
            <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" as const }}>
              {allMeetings.length} meetings
            </span>
          </div>
        </div>

        {/* Body: sidebar + main */}
        <div style={{ display: "flex", minHeight: 480 }}>
          {/* Left sidebar */}
          <div
            style={{
              width: 240,
              flexShrink: 0,
              borderRight: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column" as const,
              overflow: "hidden",
            }}
          >
            {/* Scope toggle */}
            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 4 }}>
              {(["All", "Selected"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setScopeView(v)}
                  style={{
                    flex: 1,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 0",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    background: scopeView === v ? C.amberBg : "transparent",
                    color: scopeView === v ? C.amber : C.muted,
                    transition: "all 0.15s ease",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Meeting list */}
            <div style={{ flex: 1, overflowY: "auto" as const, padding: "8px 0" }}>
              {allMeetings.map((mtg) => {
                const isActive = mtg.id === activeMeetingId;
                const isSelected = selectedIds.has(mtg.id);
                const badge = typeBadgeColor(mtg.type);
                return (
                  <div
                    key={mtg.id}
                    onClick={() => setActiveMeetingId(mtg.id)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      borderLeft: isSelected ? `3px solid ${C.amber}` : "3px solid transparent",
                      background: isActive ? "rgba(201,168,76,0.04)" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); toggleMeetingSelection(mtg.id); }}
                        style={{ marginTop: 2, accentColor: C.amber, flexShrink: 0, cursor: "pointer" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{mtg.date}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.amber : C.body, marginBottom: 4, lineHeight: 1.4, wordBreak: "break-word" as const }}>
                          {mtg.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, ...badge, fontWeight: 600 }}>
                            {mtg.type}
                          </span>
                          <span style={{ fontSize: 10, color: C.muted }}>{mtg.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 16px" }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontSize: 13,
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? C.amber : C.muted,
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab ? `2px solid ${C.amber}` : "2px solid transparent",
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {tab}
                  {tab === "Participants" && (
                    <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 8, background: C.amberBg, color: C.amber }}>
                      {theirTeam.length + yourTeam.length}
                    </span>
                  )}
                  {tab === "Action Items" && (
                    <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 8, background: C.amberBg, color: C.amber }}>
                      {allActionItems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <AnimatePresence mode="wait">
                <m.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ height: "100%", overflow: "auto" as const }}
                >
                  {/* ── Ask Tab ── */}
                  {activeTab === "Ask" && (
                    <div style={{ display: "flex", flexDirection: "column" as const, height: "100%", padding: 16 }}>
                      {/* Scope indicator */}
                      <div style={{ marginBottom: 12, fontSize: 11, color: C.muted }}>
                        Querying: <span style={{ color: C.amber, fontWeight: 600 }}>{scopedMeetings.length} meetings</span>
                        {scopeView === "Selected" && scopedMeetings.length < allMeetings.length && (
                          <span> (filtered by selection)</span>
                        )}
                      </div>

                      {/* Suggestion chips */}
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 14 }}>
                        {SUGGESTION_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => setInputText(chip)}
                            style={{
                              fontSize: 11,
                              padding: "5px 10px",
                              borderRadius: 16,
                              border: `1px solid ${C.amberBorder}`,
                              background: C.amberBg,
                              color: C.amber,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.14)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.amberBg; }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Chat thread */}
                      <div
                        ref={chatContainerRef}
                        style={{
                          flex: 1,
                          overflowY: "auto" as const,
                          maxHeight: 320,
                          marginBottom: 12,
                          display: "flex",
                          flexDirection: "column" as const,
                          gap: 10,
                        }}
                      >
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              flexDirection: msg.role === "user" ? "row-reverse" : "row" as const,
                            }}
                          >
                            {/* Avatar */}
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                background: msg.role === "ai" ? C.amberBg : C.blueBg,
                                color: msg.role === "ai" ? C.amber : C.blue,
                                border: `1px solid ${msg.role === "ai" ? C.amberBorder : C.blueBorder}`,
                              }}
                            >
                              {msg.role === "ai" ? "AI" : "JM"}
                            </div>
                            {/* Bubble */}
                            <div
                              style={{
                                maxWidth: "80%",
                                background: msg.role === "user" ? C.blueBg : C.surface,
                                border: `1px solid ${msg.role === "user" ? C.blueBorder : C.border}`,
                                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                padding: "8px 12px",
                                fontSize: 12,
                                color: C.body,
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap" as const,
                              }}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <div
                              style={{
                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 700,
                                background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBorder}`,
                              }}
                            >
                              AI
                            </div>
                            <div
                              style={{
                                background: C.surface, border: `1px solid ${C.border}`,
                                borderRadius: "12px 12px 12px 2px", padding: "10px 14px",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: C.amber,
                                    display: "inline-block",
                                    animation: `mih-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(inputText); }}
                          placeholder="Ask about your meetings..."
                          style={{
                            flex: 1,
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            color: C.head,
                            fontSize: 13,
                            padding: "9px 12px",
                            outline: "none",
                          }}
                        />
                        <m.button
                          onClick={() => sendMessage(inputText)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={!inputText.trim() || isTyping}
                          style={{
                            background: C.amber,
                            color: "#000",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: inputText.trim() && !isTyping ? "pointer" : "default",
                            opacity: inputText.trim() && !isTyping ? 1 : 0.5,
                          }}
                        >
                          Send
                        </m.button>
                      </div>
                    </div>
                  )}

                  {/* ── Participants Tab ── */}
                  {activeTab === "Participants" && (
                    <div style={{ padding: 16 }}>
                      {/* Their team */}
                      <div style={{ marginBottom: 20 }}>
                        <h5 style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: "0 0 12px" }}>
                          {company} Contacts
                        </h5>
                        {theirTeam.length === 0 && (
                          <p style={{ fontSize: 13, color: C.muted }}>No contacts from {company} in scoped meetings.</p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                          {theirTeam.map((p) => (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 12, fontWeight: 700,
                                  background: `${avatarColor(p.name)}22`,
                                  color: avatarColor(p.name),
                                  border: `1px solid ${avatarColor(p.name)}44`,
                                }}
                              >
                                {initials(p.name)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{p.role}</div>
                                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 4 }}>
                                  {p.meetings.map((m) => (
                                    <span key={m} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: C.amberBg, color: C.amber }}>
                                      {m.length > 30 ? m.slice(0, 28) + "..." : m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <a
                                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name + " " + company)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 11, color: C.amber, background: C.surface,
                                  border: `1px solid #2a2a2a`, borderRadius: 20, padding: "4px 10px",
                                  textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0,
                                }}
                              >
                                LinkedIn ↗
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Your team */}
                      <div>
                        <h5 style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: "0 0 12px" }}>
                          Your Team
                        </h5>
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                          {yourTeam.map((p) => (
                            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 12, fontWeight: 700,
                                  background: C.blueBg,
                                  color: C.blue,
                                  border: `1px solid ${C.blueBorder}`,
                                }}
                              >
                                {initials(p.name)}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{p.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Action Items Tab ── */}
                  {activeTab === "Action Items" && (
                    <div style={{ padding: 16 }}>
                      <ActionItemTracker
                        meetingTitle={`All meetings with ${company}`}
                        meetingDate={`${scopedMeetings.length} meetings`}
                        meetingId={`hub-${company}`}
                        items={allActionItems}
                      />
                    </div>
                  )}

                  {/* ── Transcripts Tab ── */}
                  {activeTab === "Transcripts" && (
                    <div style={{ padding: 16 }}>
                      {/* Global search bar */}
                      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, position: "relative" as const }}>
                          <input
                            type="text"
                            value={globalTranscriptSearch}
                            onChange={(e) => setGlobalTranscriptSearch(e.target.value)}
                            placeholder="Search all transcripts…"
                            style={{
                              width: "100%",
                              background: C.surface,
                              border: `1px solid ${globalTranscriptSearch ? C.amberBorder : C.border}`,
                              borderRadius: 8,
                              color: C.head,
                              fontSize: 12,
                              padding: "7px 10px",
                              outline: "none",
                              boxSizing: "border-box" as const,
                              transition: "border-color 0.15s ease",
                            }}
                          />
                        </div>
                        {globalTranscriptSearch && (
                          <span style={{ fontSize: 11, color: C.amber, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                            {scopedMeetings.reduce((n, m) => n + countMatches(m, globalTranscriptSearch), 0)} matches
                          </span>
                        )}
                        {globalTranscriptSearch && (
                          <button
                            onClick={() => setGlobalTranscriptSearch("")}
                            style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Meeting cards */}
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                        {scopedMeetings.map((mtg) => {
                          const isOpen = expandedTranscriptId === mtg.id;
                          const cardQuery = perCardSearch[mtg.id] ?? "";
                          const activeQuery = isOpen ? (cardQuery || globalTranscriptSearch) : globalTranscriptSearch;
                          const matchCount = countMatches(mtg, activeQuery);
                          const badge = typeBadgeColor(mtg.type);
                          const hasGlobalHit = globalTranscriptSearch ? matchCount > 0 : true;

                          return (
                            <div
                              key={mtg.id}
                              style={{
                                background: C.surface,
                                border: `1px solid ${isOpen ? C.amberBorder : hasGlobalHit ? C.border : "#1a1a1a"}`,
                                borderRadius: 10,
                                overflow: "hidden",
                                opacity: globalTranscriptSearch && !hasGlobalHit ? 0.4 : 1,
                                transition: "border-color 0.2s ease, opacity 0.2s ease",
                              }}
                            >
                              {/* Card header (always visible) */}
                              <div
                                style={{
                                  padding: "12px 14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  cursor: "pointer",
                                }}
                                onClick={() => setExpandedTranscriptId(isOpen ? null : mtg.id)}
                              >
                                {/* Chevron */}
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: C.muted,
                                    flexShrink: 0,
                                    transition: "transform 0.2s ease",
                                    display: "inline-block",
                                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                                  }}
                                >
                                  ▶
                                </span>

                                {/* Meta */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{mtg.title}</span>
                                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, ...badge, fontWeight: 600, flexShrink: 0 }}>{mtg.type}</span>
                                    {globalTranscriptSearch && matchCount > 0 && (
                                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: C.amberBg, color: C.amber, fontWeight: 600, flexShrink: 0 }}>
                                        {matchCount} match{matchCount !== 1 ? "es" : ""}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                    {mtg.date} · {mtg.duration} · {mtg.transcript.length} exchanges
                                  </div>
                                </div>

                                {/* Download VTT */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); downloadVTT(mtg); }}
                                  style={{
                                    fontSize: 11, color: C.muted, background: "transparent",
                                    border: `1px solid #2a2a2a`, borderRadius: 20, padding: "4px 10px",
                                    cursor: "pointer", flexShrink: 0, transition: "all 0.15s ease",
                                    whiteSpace: "nowrap" as const,
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.color = C.amber; e.currentTarget.style.borderColor = C.amberBorder; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "#2a2a2a"; }}
                                >
                                  ↓ .vtt
                                </button>
                              </div>

                              {/* Expandable transcript body */}
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <m.div
                                    key="transcript-body"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: "easeInOut" }}
                                    style={{ overflow: "hidden" }}
                                  >
                                    {/* Per-card search */}
                                    <div style={{ padding: "0 14px 10px", display: "flex", alignItems: "center", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                                      <input
                                        type="text"
                                        value={cardQuery}
                                        onChange={(e) => setPerCardSearch((prev) => ({ ...prev, [mtg.id]: e.target.value }))}
                                        placeholder="Search this transcript…"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          flex: 1,
                                          background: C.card,
                                          border: `1px solid ${cardQuery ? C.amberBorder : C.border}`,
                                          borderRadius: 6,
                                          color: C.head,
                                          fontSize: 11,
                                          padding: "5px 9px",
                                          outline: "none",
                                          transition: "border-color 0.15s ease",
                                        }}
                                      />
                                      {(cardQuery || globalTranscriptSearch) && (
                                        <span style={{ fontSize: 11, color: C.amber, flexShrink: 0 }}>
                                          {matchCount} match{matchCount !== 1 ? "es" : ""}
                                        </span>
                                      )}
                                      {cardQuery && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setPerCardSearch((prev) => ({ ...prev, [mtg.id]: "" })); }}
                                          style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>

                                    {/* Lines */}
                                    <div style={{ padding: "0 14px 14px", maxHeight: 320, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 12 }}>
                                      {mtg.transcript.map((line, i) => (
                                        <div key={i} style={{ display: "flex", gap: 8 }}>
                                          <div
                                            style={{
                                              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                              display: "flex", alignItems: "center", justifyContent: "center",
                                              fontSize: 9, fontWeight: 700,
                                              background: `${avatarColor(line.speaker)}22`,
                                              color: avatarColor(line.speaker),
                                              border: `1px solid ${avatarColor(line.speaker)}44`,
                                            }}
                                          >
                                            {initials(line.speaker)}
                                          </div>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: C.head, marginBottom: 2 }}>
                                              {line.speaker}
                                            </div>
                                            <div
                                              style={{ fontSize: 12, color: C.body, lineHeight: 1.65 }}
                                              dangerouslySetInnerHTML={{ __html: highlightKeywords(line.text, activeQuery) }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </m.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mih-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </LazyMotion>
  );
}
