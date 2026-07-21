"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ActionItemTracker from "./ActionItemTracker";
import MeetingIntelligenceHub from "./MeetingIntelligenceHub";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Brief {
  date: string;
  title: string;
  summary: string;
  sentiment: string;
  readiness: string;
  transcript: string;
  nextSteps: string[];
  recommendation: string;
  email: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const MEETING_TYPES = [
  "Introductory Call/Demo",
  "Support",
  "Technical Review",
  "Onboarding",
  "Touch Base",
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Financial Services", "Retail & E-Commerce",
  "Energy & Utilities", "Manufacturing", "Media & Entertainment",
  "Telecommunications", "Aerospace & Defense", "Automotive", "Consumer Goods",
  "Pharmaceuticals", "Insurance", "Real Estate", "Food & Beverage",
  "Logistics & Supply Chain", "Education", "Government & Public Sector",
  "Professional Services", "Banking", "Other",
];

const COMPANIES = [
  // Big Tech
  "Apple", "Amazon", "Microsoft", "Alphabet", "Meta", "Netflix", "Salesforce",
  "Oracle", "IBM", "Cisco", "Intel", "NVIDIA", "Adobe", "Uber", "Airbnb",
  // Finance & Insurance
  "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Bank of America",
  "Visa", "Mastercard", "American Express", "BlackRock", "Fidelity", "Berkshire Hathaway",
  // Healthcare & Pharma
  "UnitedHealth Group", "Johnson & Johnson", "AbbVie", "Pfizer", "CVS Health",
  // Retail & Consumer
  "Walmart", "Amazon", "Costco", "Home Depot", "Nike", "Target", "Starbucks",
  "Procter & Gamble", "Coca-Cola", "PepsiCo",
  // Enterprise & Industrial
  "ExxonMobil", "Chevron", "General Electric", "Boeing", "Lockheed Martin",
  "Deloitte", "Accenture", "McKinsey & Company",
  // Media & Telecom
  "Disney", "Comcast", "AT&T", "Verizon", "Spotify",
  // SaaS & Scale-ups
  "HubSpot", "Zendesk", "Asana", "Notion", "Figma", "Slack", "Dropbox",
  "Zoom", "Twilio", "Datadog", "Snowflake", "Workday", "ServiceNow",
  "Atlassian", "Monday.com", "Intercom", "Klaviyo", "Rippling",
].filter((v, i, a) => a.indexOf(v) === i).sort();

const PRIOR_OPTIONS = ["First meeting", "1", "2", "3", "4", "5"];

const STAKEHOLDER_OPTIONS = [
  "Founder/CEO", "Exec Team", "Sales VP", "HR", "IT/Security Team", "Account Exec",
];

// Known executives for Fortune 500 companies
const KNOWN_EXECUTIVES: Record<string, { name: string; role: string; linkedin: string }[]> = {
  Apple: [
    { name: "Tim Cook", role: "CEO", linkedin: "https://www.linkedin.com/in/timcook" },
    { name: "Deirdre O'Brien", role: "SVP People & Retail", linkedin: "https://www.linkedin.com/in/deirdreobrien" },
    { name: "Luca Maestri", role: "CFO", linkedin: "https://www.linkedin.com/in/luca-maestri" },
  ],
  Amazon: [
    { name: "Andy Jassy", role: "CEO", linkedin: "https://www.linkedin.com/in/andy-jassy-8b1615" },
    { name: "Beth Galetti", role: "SVP People Experience", linkedin: "https://www.linkedin.com/in/bethgaletti" },
    { name: "Matt Garman", role: "CEO, AWS", linkedin: "https://www.linkedin.com/in/matt-garman" },
  ],
  Microsoft: [
    { name: "Satya Nadella", role: "CEO", linkedin: "https://www.linkedin.com/in/satyanadella" },
    { name: "Kathleen Hogan", role: "Chief People Officer", linkedin: "https://www.linkedin.com/in/kathleen-hogan-microsoft" },
    { name: "Judson Althoff", role: "EVP & Chief Commercial Officer", linkedin: "https://www.linkedin.com/in/judsonalthoff" },
    { name: "Amy Hood", role: "CFO", linkedin: "https://www.linkedin.com/in/amy-hood-microsoft" },
  ],
  Alphabet: [
    { name: "Sundar Pichai", role: "CEO", linkedin: "https://www.linkedin.com/in/sundarpichai" },
    { name: "Ruth Porat", role: "SVP & CFO", linkedin: "https://www.linkedin.com/in/ruth-porat" },
    { name: "Prabhakar Raghavan", role: "SVP Search & Ads", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Prabhakar+Raghavan+Google" },
  ],
  Meta: [
    { name: "Mark Zuckerberg", role: "CEO & Founder", linkedin: "https://www.linkedin.com/in/zuck" },
    { name: "Sheryl Sandberg", role: "Former COO", linkedin: "https://www.linkedin.com/in/sheryl-sandberg" },
    { name: "Javier Olivan", role: "COO", linkedin: "https://www.linkedin.com/in/javiolivan" },
  ],
  Salesforce: [
    { name: "Marc Benioff", role: "CEO & Co-Founder", linkedin: "https://www.linkedin.com/in/marcbenioff" },
    { name: "Brian Millham", role: "COO", linkedin: "https://www.linkedin.com/in/brianmillham" },
    { name: "Amy Weaver", role: "President & CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Amy+Weaver+Salesforce" },
  ],
  Netflix: [
    { name: "Ted Sarandos", role: "Co-CEO", linkedin: "https://www.linkedin.com/in/ted-sarandos" },
    { name: "Greg Peters", role: "Co-CEO", linkedin: "https://www.linkedin.com/in/gregpeters" },
    { name: "Spencer Wang", role: "CFO", linkedin: "https://www.linkedin.com/in/spencerwang" },
  ],
  Walmart: [
    { name: "Doug McMillon", role: "CEO", linkedin: "https://www.linkedin.com/in/dougmcmillon" },
    { name: "John Furner", role: "CEO, Walmart U.S.", linkedin: "https://www.linkedin.com/in/john-furner" },
  ],
  "JPMorgan Chase": [
    { name: "Jamie Dimon", role: "CEO", linkedin: "https://www.linkedin.com/in/jamie-dimon" },
    { name: "Mary Callahan Erdoes", role: "CEO, Asset & Wealth Management", linkedin: "https://www.linkedin.com/in/mary-callahan-erdoes" },
  ],
  Visa: [
    { name: "Ryan McInerney", role: "CEO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Ryan+McInerney+Visa" },
    { name: "Chris Suh", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Chris+Suh+Visa" },
  ],
  "Berkshire Hathaway": [
    { name: "Warren Buffett", role: "CEO & Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Warren+Buffett+Berkshire+Hathaway" },
    { name: "Greg Abel", role: "Vice Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Greg+Abel+Berkshire+Hathaway" },
  ],
  "UnitedHealth Group": [
    { name: "Andrew Witty", role: "CEO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Andrew+Witty+UnitedHealth" },
    { name: "John Rex", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=John+Rex+UnitedHealth" },
  ],
  ExxonMobil: [
    { name: "Darren Woods", role: "CEO & Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Darren+Woods+ExxonMobil" },
    { name: "Kathryn Mikells", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Kathryn+Mikells+ExxonMobil" },
  ],
  "Johnson & Johnson": [
    { name: "Joaquin Duato", role: "CEO & Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Joaquin+Duato+Johnson+Johnson" },
    { name: "Joseph Wolk", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Joseph+Wolk+Johnson+Johnson" },
  ],
  "Procter & Gamble": [
    { name: "Jon Moeller", role: "CEO & Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Jon+Moeller+Procter+Gamble" },
    { name: "Andre Schulten", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Andre+Schulten+Procter+Gamble" },
  ],
  Mastercard: [
    { name: "Michael Miebach", role: "CEO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Michael+Miebach+Mastercard" },
    { name: "Sachin Mehra", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Sachin+Mehra+Mastercard" },
  ],
  Chevron: [
    { name: "Mike Wirth", role: "CEO & Chairman", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Mike+Wirth+Chevron" },
    { name: "Eimear Bonner", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Eimear+Bonner+Chevron" },
  ],
  "Home Depot": [
    { name: "Ted Decker", role: "CEO & President", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Ted+Decker+Home+Depot" },
    { name: "Richard McPhail", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Richard+McPhail+Home+Depot" },
  ],
  AbbVie: [
    { name: "Robert Michael", role: "CEO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Robert+Michael+AbbVie" },
    { name: "Scott Reents", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Scott+Reents+AbbVie" },
  ],
  Costco: [
    { name: "Ron Vachris", role: "CEO & President", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Ron+Vachris+Costco" },
    { name: "Gary Millerchip", role: "CFO", linkedin: "https://www.linkedin.com/search/results/people/?keywords=Gary+Millerchip+Costco" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function readinessBadge(r: string) {
  if (r === "High") return { bg: "rgba(52,211,153,0.15)", color: "#34d399", border: "rgba(52,211,153,0.3)" };
  if (r === "Medium") return { bg: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "rgba(201,168,76,0.3)" };
  return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" };
}

function sentimentColor(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("positive")) return "#34d399";
  if (lower.includes("neutral")) return "#c9a84c";
  return "#ef4444"; // cautious, negative, at risk
}

function sentimentBg(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("positive")) return "rgba(52,211,153,0.08)";
  if (lower.includes("neutral")) return "rgba(201,168,76,0.08)";
  return "rgba(239,68,68,0.08)";
}

function readinessColor(r: string): string {
  if (r === "High") return "#34d399";
  if (r === "Medium") return "#c9a84c";
  return "#ef4444";
}

function readinessBg(r: string): string {
  if (r === "High") return "rgba(52,211,153,0.08)";
  if (r === "Medium") return "rgba(201,168,76,0.08)";
  return "rgba(239,68,68,0.08)";
}

function stripStakeholderPrefix(step: string): string {
  // Remove prefixes like "Founder/CEO:", "Exec Team:", "Account Exec:", etc.
  return step.replace(/^[A-Za-z\/& ]{2,20}:\s*/, "");
}

const S = {
  bg: "#0a0a0a",
  card: "#141414",
  border: "rgba(255,255,255,0.08)",
  amber: "#c9a84c",
  amberBg: "rgba(201,168,76,0.1)",
  amberBorder: "rgba(201,168,76,0.2)",
  head: "#f0ede8",
  body: "#888888",
  muted: "#444444",
  blue: "#0071e3",
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "#1a1a1a",
  border: `1px solid ${S.border}`,
  borderRadius: 8,
  color: S.head,
  fontSize: 14,
  outline: "none",
  appearance: "none",
};

// ─── Dismissible banner ───────────────────────────────────────────────────────

function IntroBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("mie-banner-dismissed");
      setVisible(!dismissed);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("mie-banner-dismissed", "1");
    }
  }

  return (
    <div
      style={{
        maxHeight: visible ? 60 : 0,
        opacity: visible ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.3s ease, opacity 0.3s ease",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          borderRadius: "0 0 8px 8px",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
          💡 Pick your meeting details, hit Generate, and get a full pre-call brief in seconds.
        </span>
        <button
          onClick={dismiss}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            fontSize: 16,
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
            flexShrink: 0,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ede8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEPS = ["Setup", "Participants", "Review", "Output"];

function StepPills({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={
              i === current
                ? { background: S.amber, color: "#000" }
                : i < current
                ? { background: "rgba(201,168,76,0.2)", color: S.amber, border: `1px solid ${S.amberBorder}` }
                : { background: "#1a1a1a", color: S.muted, border: `1px solid ${S.border}` }
            }
          >
            {i + 1}. {label}
          </span>
          {i < STEPS.length - 1 && (
            <span style={{ color: S.muted, fontSize: 10 }}>›</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MeetingPrepAgent() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // HubSpot Private App state
  const [hubspotStatus, setHubspotStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [hubspotError, setHubspotError] = useState("");

  // Form state
  const [userName, setUserName] = useState("");
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [company, setCompany] = useState(COMPANIES[0]);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [companyDescription, setCompanyDescription] = useState("");
  const [prior, setPrior] = useState(PRIOR_OPTIONS[0]);
  const [participants, setParticipants] = useState(3);
  const [stakeholders, setStakeholders] = useState<string[]>([]);

  function toggleStakeholder(s: string) {
    setStakeholders((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/agents/meeting-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userName.trim() || "John Moffa", meetingType, company, industry, companyDescription, prior, participants, stakeholders }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Something went wrong generating your brief");
      setBrief(data);
      const execData = KNOWN_EXECUTIVES[company];
      if (execData) {
        console.log(`[MIE] Stakeholder data found for ${company}:`, execData);
      } else {
        console.warn(`[MIE] No known executives for "${company}". Falling back to stakeholder roles:`, stakeholders);
      }
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function buildFullText(b: Brief) {
    const lines = [
      `MEETING BRIEF: ${b.title}`,
      `Date: ${b.date}`,
      `Readiness: ${b.readiness}  |  Sentiment: ${b.sentiment}  |  Participants: ${participants}`,
      "",
      "SUMMARY",
      b.summary,
      "",
    ];
    if (b.transcript) {
      lines.push("PRIOR MEETING TRANSCRIPT", b.transcript, "");
    }
    lines.push(
      "NEXT STEPS",
      ...b.nextSteps.map((s, i) => `${i + 1}. ${s}`),
      "",
      "RECOMMENDATION",
      b.recommendation,
      "",
      "FOLLOW-UP EMAIL",
      b.email,
      "",
      "---",
      "Powered by Claude · Built by John Moffa",
    );
    return lines.join("\n");
  }

  function copyOutput() {
    if (!brief) return;
    navigator.clipboard.writeText(buildFullText(brief));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadOutput() {
    if (!brief) return;
    const blob = new Blob([buildFullText(brief)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-brief-${brief.title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setBrief(null);
    setStep(0);
    setError("");
    setHubspotStatus("idle");
    setHubspotError("");
  }

  async function pushToHubspot() {
    if (!brief) return;
    setHubspotStatus("loading");
    setHubspotError("");
    try {
      const res = await fetch("/api/integrations/hubspot/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          stakeholders,
          summary: brief.summary,
          nextSteps: brief.nextSteps,
          recommendation: brief.recommendation,
          meetingDate: brief.date,
          meetingType,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setHubspotStatus("error");
        setHubspotError("Token invalid — check HUBSPOT_ACCESS_TOKEN");
        return;
      }
      if (!res.ok || data.error) throw new Error(data.error ?? "Push failed");
      setHubspotStatus("success");
    } catch (err) {
      setHubspotStatus("error");
      setHubspotError("Save failed — please try again");
      console.error("HubSpot push error:", err);
    }
  }

  const execs = KNOWN_EXECUTIVES[company];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: S.bg, border: `1px solid ${S.amberBorder}`, borderLeft: `3px solid ${S.amber}` }}
    >
      {/* Card header */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-6" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg sm:text-xl font-bold" style={{ letterSpacing: "-0.02em" }}>
            <span style={{ color: S.head }}>Meeting Intelligence Engine</span>
            <span style={{ color: S.amber }}> — Live Demo</span>
          </h3>
          <span
            className="shrink-0 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
          >
            ● Live
          </span>
        </div>
        <div className="mb-3">
          <p className="agent-description" style={{ color: "#aaa", fontSize: 15, lineHeight: 1.7 }}>
            I built this to show what&apos;s possible when you apply AI to real business problems. This meeting prep tool is one example, but the same approach works for any workflow: onboarding, support triage, client reporting, internal ops, you name it. Select from real Fortune 500 companies and get back a complete pre-call brief with actual stakeholder data, ranked next steps, and a follow-up email ready to send. If your team has a repetitive, high-context process, it can probably be automated or augmented like this. Built with Claude. Fully functional. Try it below.
          </p>
        </div>
      </div>

      {/* Intro banner */}
      <IntroBanner />

      {/* Wizard body */}
      <div className="px-8 py-8">
        <StepPills current={step} />

        {/* ── Step 0: Setup ── */}
        {step === 0 && (
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: S.amber }}>
              Meeting Setup
            </h4>
            <div className="mb-5">
              <label className="block text-xs mb-2" style={{ color: S.body }}>
                Your Name <span style={{ color: S.muted }}>(optional)</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Moffa"
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs mb-2" style={{ color: S.body }}>Meeting Type</label>
                <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)} style={inputStyle}>
                  {MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-2" style={{ color: S.body }}>Customer Company</label>
                <select value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle}>
                  {COMPANIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-2" style={{ color: S.body }}>Your Industry</label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle}>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-2" style={{ color: S.body }}>Prior Meetings</label>
                <select value={prior} onChange={(e) => setPrior(e.target.value)} style={inputStyle}>
                  {PRIOR_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {/* Optional company description — full width below the grid */}
            <div className="mt-5">
              <label className="block text-xs mb-2" style={{ color: S.body }}>
                What does your company do?{" "}
                <span style={{ color: S.muted }}>(optional)</span>
              </label>
              <textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="e.g. We provide AI-powered onboarding software for mid-market SaaS companies..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(1)}
                className="rounded-full transition-all duration-200 hover:bg-white hover:text-black"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: S.blue, color: "#fff" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Participants ── */}
        {step === 1 && (
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: S.amber }}>
              Participants
            </h4>
            <div className="mb-6">
              <label className="block text-xs mb-2" style={{ color: S.body }}>Number of Participants</label>
              <input
                type="number"
                min={1}
                max={10}
                value={participants}
                onChange={(e) => setParticipants(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{ ...inputStyle, maxWidth: 120 }}
              />
            </div>
            <div>
              <label className="block text-xs mb-3" style={{ color: S.body }}>Key Stakeholders attending from {company}</label>
              <div className="flex flex-wrap gap-2">
                {STAKEHOLDER_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStakeholder(s)}
                    className="rounded-full transition-all duration-150"
                    style={{
                      height: 32, paddingLeft: 14, paddingRight: 14, fontSize: 13, fontWeight: 400,
                      ...(stakeholders.includes(s)
                        ? { background: S.amberBg, color: S.amber, border: `1px solid ${S.amber}` }
                        : { background: "#1a1a1a", color: S.body, border: `1px solid ${S.border}` })
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button onClick={() => setStep(0)} className="rounded-full" style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, fontWeight: 400, background: "#1a1a1a", color: S.body, border: `1px solid ${S.border}` }}>
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="rounded-full transition-all duration-200 hover:bg-white hover:text-black"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: S.blue, color: "#fff" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <div>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-widest" style={{ color: S.amber }}>
              Review & Generate
            </h4>
            <div className="rounded-xl p-6 mb-6 space-y-3" style={{ background: "#111", border: `1px solid ${S.border}` }}>
              {[
                ["Meeting Type", meetingType],
                ["Company", company],
                ["Your Industry", industry],
                ...(companyDescription ? [["About Your Company", companyDescription]] : []),
                ["Prior Meetings", prior],
                ["Participants", String(participants)],
                ["Stakeholders", stakeholders.length ? stakeholders.join(", ") : "None selected"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-xs" style={{ color: S.muted }}>{label}</span>
                  <span className="text-sm font-medium text-right" style={{ color: S.head }}>{val}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-sm mb-2" style={{ color: "#ef4444" }}>{error}</p>
                <button
                  onClick={generate}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  Try again ↺
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: S.amber,
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold" style={{ color: S.head }}>Generating your brief…</p>
                <p className="text-xs" style={{ color: S.muted }}>Analyzing company · Drafting transcript · Building recommendations</p>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep(1)} className="rounded-full" style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, fontWeight: 400, background: "#1a1a1a", color: S.body, border: `1px solid ${S.border}` }}>
                  ← Back
                </button>
                <button
                  onClick={generate}
                  className="rounded-full transition-all duration-200 hover:opacity-90"
                  style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: S.amber, color: "#000" }}
                >
                  Generate Brief ✦
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Output ── */}
        {step === 3 && brief && (
          <div>
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs mb-1" style={{ color: S.muted }}>{brief.date}</p>
                <h4 className="text-lg font-bold" style={{ color: S.head, letterSpacing: "-0.01em" }}>{brief.title}</h4>
              </div>
              <span
                className="shrink-0 px-3 py-1 rounded-full text-xs font-bold"
                style={readinessBadge(brief.readiness)}
              >
                {brief.readiness} Readiness
              </span>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl p-4 text-center" style={{ background: sentimentBg(brief.sentiment), border: `1px solid ${S.border}` }}>
                <div className="text-xs mb-1" style={{ color: S.muted }}>Sentiment</div>
                <div className="text-sm font-bold" style={{ color: sentimentColor(brief.sentiment) }}>{brief.sentiment}</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: readinessBg(brief.readiness), border: `1px solid ${S.border}` }}>
                <div className="text-xs mb-1" style={{ color: S.muted }}>Readiness</div>
                <div className="text-sm font-bold" style={{ color: readinessColor(brief.readiness) }}>{brief.readiness}</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: "#111", border: `1px solid ${S.border}` }}>
                <div className="text-xs mb-1" style={{ color: S.muted }}>Participants</div>
                <div className="text-sm font-bold" style={{ color: S.head }}>{participants}</div>
              </div>
            </div>

            {/* Summary */}
            <Section title="Meeting Summary">
              <p className="text-sm leading-relaxed" style={{ color: S.body }}>{brief.summary}</p>
            </Section>

            {/* Transcript */}
            {brief.transcript && (
              <Section title="Prior Meeting Transcript">
                <div
                  className="text-xs leading-relaxed font-mono overflow-y-auto"
                  style={{ color: S.body, maxHeight: 200, background: "#0d0d0d", padding: "12px 14px", borderRadius: 8, border: `1px solid ${S.border}`, whiteSpace: "pre-wrap" }}
                >
                  {brief.transcript}
                </div>
              </Section>
            )}

            {/* Next Steps */}
            <Section title="Next Steps">
              <ol className="space-y-3">
                {brief.nextSteps.map((step, i) => {
                  // Parse "Owner: Action" format; fall back gracefully
                  const colonIdx = step.indexOf(": ");
                  const owner = colonIdx > -1 ? step.slice(0, colonIdx).trim() : null;
                  const action = colonIdx > -1 ? step.slice(colonIdx + 2).trim() : stripStakeholderPrefix(step);
                  return (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 font-mono text-xs mt-1" style={{ color: S.amber }}>{String(i + 1).padStart(2, "0")}.</span>
                      <span>
                        {owner && (
                          <>
                            <span className="font-bold" style={{ color: S.amber }}>{owner}</span>
                            <span style={{ color: S.muted }}>: </span>
                          </>
                        )}
                        <span style={{ fontSize: 15, color: S.body }}>{action}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Section>

            {/* Connect with people from this meeting — always rendered */}
            {(() => {
              const linkedInBtn = (href: string) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: "#c9a84c", background: "#1a1a1a",
                    border: "1px solid #2a2a2a", borderRadius: 20, padding: "6px 12px",
                    textDecoration: "none", whiteSpace: "nowrap" as const,
                    transition: "border-color 0.15s ease, background 0.15s ease", flexShrink: 0,
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.background = "#222"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.background = "#1a1a1a"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" style={{ flexShrink: 0 }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn ↗
                </a>
              );

              const rows = execs && execs.length > 0
                ? execs.slice(0, 3).map((e) => ({
                    name: e.name,
                    sub: e.role,
                    href: e.linkedin || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(e.name + " " + company)}`,
                  }))
                : (stakeholders.length > 0 ? stakeholders : ["Decision Maker", "Champion", "Technical Contact"]).slice(0, 3).map((role) => ({
                    name: role,
                    sub: `${company} · Search LinkedIn`,
                    href: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(role + " " + company)}`,
                  }));

              return (
                <Section title="Connect with People from This Meeting">
                  <div className="space-y-3">
                    {rows.map((row) => (
                      <div key={row.name} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                          style={{ background: S.amberBg, color: S.amber, border: `1px solid ${S.amberBorder}` }}
                        >
                          {initials(row.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: S.head }}>{row.name}</div>
                          <div className="text-xs truncate" style={{ color: S.muted }}>{row.sub}</div>
                        </div>
                        {linkedInBtn(row.href)}
                      </div>
                    ))}
                  </div>
                </Section>
              );
            })()}

            {/* Recommendation */}
            <Section title="Recommendation">
              <p className="text-sm leading-relaxed" style={{ color: S.body }}>{brief.recommendation}</p>
            </Section>

            {/* Follow-up email */}
            <Section title="Follow-up Email Template">
              <div
                className="text-xs leading-relaxed font-mono overflow-x-auto"
                style={{ color: "#a8c4a2", background: "#0d0d0d", padding: "16px", borderRadius: 8, border: `1px solid ${S.border}`, whiteSpace: "pre-wrap" }}
              >
                {brief.email}
              </div>
            </Section>

            {/* Action Item Tracker */}
            <ActionItemTracker
              meetingTitle={brief.title || `${company} Meeting`}
              meetingDate={brief.date}
              meetingId={`meeting-${company}-${brief.date}`}
              items={(brief.nextSteps || []).map((step, i) => ({
                id: `item-${i}`,
                text: step.replace(/^[A-Za-z\/& ]{2,20}:\s*/, ""),
                owner: "John Moffa",
                done: false,
                autoDone: false,
                autoType: null,
                due: null,
              }))}
            />

            {/* Meeting Intelligence Hub */}
            <MeetingIntelligenceHub
              company={company}
              currentMeeting={{
                id: `meeting-${company}-${brief.date}`,
                date: brief.date,
                title: brief.title || `${company} Meeting`,
                type: meetingType,
                duration: "30 min",
                participants: (() => {
                  const execs = KNOWN_EXECUTIVES[company];
                  if (execs && execs.length > 0) {
                    return execs.slice(0, 3).map((e) => ({ name: e.name, role: e.role, company }));
                  }
                  return stakeholders.slice(0, 3).map((role) => ({ name: role, role, company }));
                })(),
                summary: brief.summary || "",
                actions: brief.nextSteps || [],
                transcript: [],
              }}
              allMeetings={[]}
            />

            {/* Action row */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={copyOutput}
                className="btn-amber rounded-full"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: "#c9a84c", color: "#0a0a0a", transition: "all 0.2s ease" }}
              >
                {copied ? "Copied ✓" : "Copy Output"}
              </button>
              <button
                onClick={downloadOutput}
                className="btn-ghost rounded-full"
                style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, fontWeight: 400, background: "#1a1a1a", color: S.body, border: `1px solid ${S.border}`, transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.background = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = String(S.border); e.currentTarget.style.color = S.body; e.currentTarget.style.background = "#1a1a1a"; }}
              >
                Download .txt
              </button>
              <button
                onClick={reset}
                className="btn-ghost rounded-full"
                style={{ height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14, fontWeight: 400, background: "#1a1a1a", color: S.muted, border: `1px solid ${S.border}`, transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.color = "#f0ede8"; e.currentTarget.style.background = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = String(S.border); e.currentTarget.style.color = S.muted; e.currentTarget.style.background = "#1a1a1a"; }}
              >
                Start Over
              </button>
            </div>

            {/* CRM sync */}
            <div className="mt-6">
              <p style={{ fontSize: 11, color: S.amber, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
                Sync to your CRM
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 140px)", gap: 12 }} className="crm-grid">

                {/* HubSpot — active */}
                <button
                  onClick={hubspotStatus === "idle" || hubspotStatus === "error" ? pushToHubspot : undefined}
                  disabled={hubspotStatus === "loading" || hubspotStatus === "success"}
                  style={{
                    width: 140, height: 60,
                    background: hubspotStatus === "success" ? "rgba(52,211,153,0.08)" : "#111",
                    border: hubspotStatus === "success"
                      ? "1px solid rgba(52,211,153,0.4)"
                      : `1px solid ${S.amber}`,
                    borderRadius: 10,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                    cursor: hubspotStatus === "loading" || hubspotStatus === "success" ? "default" : "pointer",
                    opacity: hubspotStatus === "loading" ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (hubspotStatus === "idle" || hubspotStatus === "error") {
                      e.currentTarget.style.background = "#1a1a1a";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,168,76,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hubspotStatus === "idle" || hubspotStatus === "error") {
                      e.currentTarget.style.background = "#111";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                  onMouseDown={(e) => {
                    if (hubspotStatus === "idle" || hubspotStatus === "error")
                      e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    if (hubspotStatus === "idle" || hubspotStatus === "error")
                      e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {/* HubSpot sprocket logo */}
                  <svg width="22" height="22" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35.5 17.3V13.2c1.1-.5 1.8-1.6 1.8-2.8V10c0-1.9-1.5-3.4-3.4-3.4h-.4C31.6 6.6 30 8.2 30 10v.4c0 1.2.7 2.3 1.8 2.8v4.1c-1.9.3-3.7 1.1-5.2 2.3L15.1 12c.1-.3.1-.6.1-.9 0-2.2-1.8-4-4-4s-4 1.8-4 4 1.8 4 4 4c.8 0 1.5-.2 2.2-.6l11.2 7.4c-1.1 1.7-1.7 3.6-1.7 5.7 0 2.2.7 4.3 1.9 6l-3.3 3.3c-.3-.1-.6-.1-.9-.1-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3c0-.3 0-.6-.1-.9l3.2-3.2c1.8 1.4 4 2.2 6.4 2.2 5.8 0 10.6-4.7 10.6-10.6 0-5.2-3.7-9.5-8.6-10.4zm-2 16.8c-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2 6.2 2.8 6.2 6.2-2.8 6.2-6.2 6.2z" fill="#FF7A59"/>
                  </svg>
                  <span style={{
                    fontSize: 11,
                    color: hubspotStatus === "success" ? "#34d399" : S.amber,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}>
                    {hubspotStatus === "loading"
                      ? "Saving…"
                      : hubspotStatus === "success"
                      ? "✓ Saved to HubSpot"
                      : "Save to HubSpot"}
                  </span>
                </button>

                {/* Salesforce */}
                <div title="Coming soon" style={{
                  width: 140, height: 60,
                  background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                  opacity: 0.4, cursor: "not-allowed", transition: "border-color 0.2s ease",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                >
                  <svg width="28" height="20" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M41.6 13.2c3.2-3.3 7.6-5.4 12.5-5.4 6 0 11.3 3.2 14.3 8 2.5-1.1 5.2-1.7 8.1-1.7 11.3 0 20.5 9.2 20.5 20.5 0 11.3-9.2 20.5-20.5 20.5H23.4C13.3 55.1 5 46.8 5 36.7c0-9.4 6.8-17.2 15.8-18.8.3-11.1 9.4-20 20.8-20 5.8 0 11 2.3 14.8 6.1" fill="#00A1E0"/>
                  </svg>
                  <span style={{ fontSize: 11, color: "#444", lineHeight: 1 }}>Coming soon</span>
                </div>

                {/* Go High Level */}
                <div title="Coming soon" style={{
                  width: 140, height: 60,
                  background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                  opacity: 0.4, cursor: "not-allowed", transition: "border-color 0.2s ease",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                >
                  <svg width="22" height="22" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="20" fill="#16a34a"/>
                    <text x="25" y="31" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">GHL</text>
                  </svg>
                  <span style={{ fontSize: 11, color: "#444", lineHeight: 1 }}>Coming soon</span>
                </div>

                {/* Zoho */}
                <div title="Coming soon" style={{
                  width: 140, height: 60,
                  background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
                  opacity: 0.4, cursor: "not-allowed", transition: "border-color 0.2s ease",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                >
                  <svg width="36" height="16" viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="26" fill="#e44025" fontSize="28" fontWeight="800" fontFamily="sans-serif" letterSpacing="-1">zoho</text>
                  </svg>
                  <span style={{ fontSize: 11, color: "#444", lineHeight: 1 }}>Coming soon</span>
                </div>
              </div>

              {/* HubSpot error */}
              {hubspotStatus === "error" && hubspotError && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <p className="text-xs" style={{ color: "#ef4444" }}>{hubspotError}</p>
                  <button
                    onClick={pushToHubspot}
                    style={{ fontSize: 11, color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }}
                  >
                    Retry ↺
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <p className="mt-6 text-xs" style={{ color: S.muted }}>
              Powered by Claude · Built by John Moffa
            </p>
          </div>
        )}
      </div>

      <style>{`
        .btn-amber:hover { opacity: 0.88; filter: brightness(1.05); }
        .btn-amber:active { transform: scale(0.97); }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @media (max-width: 640px) {
          .crm-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .crm-grid > * {
            width: 100% !important;
          }
          .agent-description {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h5 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(201,168,76,0.7)" }}>
        {title}
      </h5>
      {children}
    </div>
  );
}
