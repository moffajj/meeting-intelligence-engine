"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  done: boolean;
  autoDone: boolean;
  autoType: "gmail" | "calendar" | "hubspot" | null;
  due: string | null;
}

export interface ActionItemTrackerProps {
  meetingTitle: string;
  meetingDate: string;
  meetingId: string;
  items: ActionItem[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: "#0a0a0a",
  card: "#111",
  surface: "#1a1a1a",
  border: "#1e1e1e",
  amber: "#c9a84c",
  amberBg: "rgba(201,168,76,0.08)",
  amberBorder: "rgba(201,168,76,0.25)",
  head: "#f0ede8",
  body: "#aaa",
  muted: "#555",
  green: "#1D9E75",
  greenBg: "rgba(29,158,117,0.08)",
  greenBorder: "#1D9E75",
  blue: "#378ADD",
  blueBg: "rgba(55,138,221,0.12)",
  blueBorder: "rgba(55,138,221,0.25)",
} as const;

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  text: string;
  color: string;
  bg: string;
}

// ─── Connector button ─────────────────────────────────────────────────────────

interface ConnectorProps {
  name: string;
  faviconDomain: string;
  connected: boolean;
  onToggle: () => void;
}

function ConnectorBtn({ name, faviconDomain, connected, onToggle }: ConnectorProps) {
  const style: React.CSSProperties = connected
    ? { border: `1px solid ${C.greenBorder}`, color: "#0F6E56", background: C.greenBg }
    : { border: `1px solid #2a2a2a`, color: C.muted, background: "transparent" };

  return (
    <m.button
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${faviconDomain}&sz=32`}
        alt={name}
        width={14}
        height={14}
        style={{ borderRadius: 2 }}
      />
      {name}
      {connected && (
        <span style={{ fontSize: 10, fontWeight: 700, color: C.green, letterSpacing: "0.03em" }}>
          On
        </span>
      )}
    </m.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActionItemTracker({ meetingTitle, meetingDate, meetingId, items: initialItems }: ActionItemTrackerProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [filter, setFilter] = useState<"All" | "Mine" | "Open" | "Completed">("All");
  const [collapsed, setCollapsed] = useState(false);
  const [newText, setNewText] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [simulating, setSimulating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Connector state
  const [gmailOn, setGmailOn] = useState(true);
  const [calendarOn, setCalendarOn] = useState(false);
  const [hubspotOn, setHubspotOn] = useState(false);

  // Sync items when props change
  useEffect(() => {
    setItems(initialItems);
  }, [meetingId]); // eslint-disable-line react-hooks/exhaustive-deps

  function addToast(text: string, color: string, bg: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, color, bg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, done: !item.done, autoDone: false, autoType: null }
          : item
      )
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function markDone(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: true } : item
      )
    );
  }

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    const newItem: ActionItem = {
      id: String(Date.now()),
      text,
      owner: "John Moffa",
      done: false,
      autoDone: false,
      autoType: null,
      due: null,
    };
    setItems((prev) => [newItem, ...prev]);
    setNewText("");
  }

  function simulateAutoComplete() {
    if (!gmailOn && !calendarOn && !hubspotOn) {
      addToast("Connect Gmail or Calendar above to enable auto-complete", C.amber, C.amberBg);
      return;
    }
    if (simulating) return;
    setSimulating(true);

    if (gmailOn) {
      setTimeout(() => {
        const match = items.find(
          (i) => !i.done && /send|email|follow.?up/i.test(i.text)
        );
        if (match) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === match.id
                ? { ...item, done: true, autoDone: true, autoType: "gmail" }
                : item
            )
          );
          addToast("Auto-completed: Emailed — action marked done", C.blue, C.blueBg);
        }
      }, 1000);
    }

    if (calendarOn) {
      setTimeout(() => {
        const match = items.find(
          (i) => !i.done && /schedule|meeting|call/i.test(i.text)
        );
        if (match) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === match.id
                ? { ...item, done: true, autoDone: true, autoType: "calendar" }
                : item
            )
          );
          addToast("Auto-completed: Meeting found in calendar — action marked done", C.green, C.greenBg);
        }
      }, 2200);
    }

    if (hubspotOn) {
      setTimeout(() => {
        const match = items.find(
          (i) => !i.done && /crm|log|contact|deal/i.test(i.text)
        );
        if (match) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === match.id
                ? { ...item, done: true, autoDone: true, autoType: "hubspot" }
                : item
            )
          );
          addToast("Auto-completed: Logged to HubSpot — action marked done", C.amber, C.amberBg);
        }
        setSimulating(false);
      }, 3000);
    } else {
      setTimeout(() => setSimulating(false), 2500);
    }
  }

  // Derived stats
  const totalDone = items.filter((i) => i.done).length;
  const totalItems = items.length;
  const autoDoneCount = items.filter((i) => i.autoDone).length;
  const progress = totalItems > 0 ? (totalDone / totalItems) * 100 : 0;

  // Filtered list
  const filtered = items.filter((item) => {
    if (filter === "Mine") return item.owner === "You" || item.owner === "John Moffa";
    if (filter === "Open") return !item.done;
    if (filter === "Completed") return item.done;
    return true;
  });

  const filterChips: Array<"All" | "Mine" | "Open" | "Completed"> = ["All", "Mine", "Open", "Completed"];

  function ownerPill(owner: string) {
    const isMe = owner === "You" || owner === "John Moffa";
    return (
      <span
        style={{
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 10,
          background: isMe ? C.amberBg : "rgba(55,138,221,0.15)",
          color: isMe ? C.amber : C.blue,
          border: `1px solid ${isMe ? C.amberBorder : C.blueBorder}`,
          fontWeight: 500,
          whiteSpace: "nowrap" as const,
        }}
      >
        {owner}
      </span>
    );
  }

  function autoTag(autoType: "gmail" | "calendar" | "hubspot" | null) {
    if (!autoType) return null;
    const labels: Record<string, string> = {
      gmail: "Auto-completed via Gmail",
      calendar: "via Calendar",
      hubspot: "via HubSpot",
    };
    const icons: Record<string, string> = { gmail: "📧", calendar: "📅", hubspot: "🔗" };
    return (
      <span
        style={{
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 10,
          background: C.blueBg,
          color: C.blue,
          border: `1px solid ${C.blueBorder}`,
          fontWeight: 500,
          whiteSpace: "nowrap" as const,
        }}
      >
        {icons[autoType]} {labels[autoType]}
      </span>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={containerRef}
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden",
          marginTop: 24,
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap" as const,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.head, letterSpacing: "-0.01em" }}>
              Action Item Tracker
            </span>
            <span style={{ fontSize: 12, color: C.body }}>
              {totalDone} done · {totalItems} total
              {autoDoneCount > 0 && (
                <span style={{ color: C.blue }}> · {autoDoneCount} auto-completed</span>
              )}
            </span>
          </div>

          {/* Sync strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" as const }}>Auto-complete via:</span>
            <ConnectorBtn
              name="Gmail"
              faviconDomain="gmail.com"
              connected={gmailOn}
              onToggle={() => setGmailOn((v) => !v)}
            />
            <ConnectorBtn
              name="Google Calendar"
              faviconDomain="calendar.google.com"
              connected={calendarOn}
              onToggle={() => setCalendarOn((v) => !v)}
            />
            <ConnectorBtn
              name="HubSpot"
              faviconDomain="hubspot.com"
              connected={hubspotOn}
              onToggle={() => setHubspotOn((v) => !v)}
            />
            <m.button
              onClick={simulateAutoComplete}
              disabled={simulating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "transparent",
                border: `1px solid ${C.amberBorder}`,
                color: simulating ? C.muted : C.amber,
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 20,
                cursor: simulating ? "default" : "pointer",
                opacity: simulating ? 0.6 : 1,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap" as const,
              }}
            >
              {simulating ? "Running..." : "Simulate auto-complete"}
            </m.button>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
          {filterChips.map((chip) => (
            <m.button
              key={chip}
              onClick={() => setFilter(chip)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                border: filter === chip ? `1px solid ${C.amber}` : `1px solid #2a2a2a`,
                color: filter === chip ? C.amber : C.muted,
                background: filter === chip ? C.amberBg : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {chip}
            </m.button>
          ))}
        </div>

        {/* Meeting group */}
        <div style={{ padding: "0 0 12px 0" }}>
          {/* Group header */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left" as const,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.muted,
                transition: "transform 0.2s ease",
                display: "inline-block",
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              ▾
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.head, flex: 1 }}>
              {meetingTitle}
            </span>
            <span style={{ fontSize: 11, color: C.muted }}>{meetingDate}</span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 10,
                background: "#1a1a1a",
                color: C.body,
                border: `1px solid ${C.border}`,
              }}
            >
              {items.length}
            </span>
            {/* Progress bar */}
            <div
              style={{
                width: 60,
                height: 4,
                background: "#1a1a1a",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: C.green,
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </button>

          {/* Items list */}
          {!collapsed && (
            <div style={{ padding: "0 20px" }}>
              <AnimatePresence initial={false}>
                {filtered.map((item) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: item.done
                          ? `1px solid ${item.autoDone ? C.blue : C.green}`
                          : "1px solid #333",
                        background: item.done
                          ? item.autoDone
                            ? C.blue
                            : C.green
                          : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        marginTop: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!item.done) e.currentTarget.style.borderColor = C.amber;
                      }}
                      onMouseLeave={(e) => {
                        if (!item.done) e.currentTarget.style.borderColor = "#333";
                      }}
                      aria-label={item.done ? "Mark incomplete" : "Mark complete"}
                    >
                      {item.done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                        <span
                          style={{
                            fontSize: 13,
                            color: item.done ? C.muted : C.body,
                            textDecoration: item.done ? "line-through" : "none",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.text}
                        </span>
                        {ownerPill(item.owner)}
                        {item.autoDone && item.autoType && autoTag(item.autoType)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {!item.done && (
                        <button
                          onClick={() => markDone(item.id)}
                          style={{
                            fontSize: 11,
                            color: C.green,
                            background: "transparent",
                            border: `1px solid rgba(29,158,117,0.3)`,
                            borderRadius: 10,
                            padding: "3px 8px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.greenBg; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          Mark done
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          background: "transparent",
                          border: `1px solid #2a2a2a`,
                          borderRadius: 10,
                          padding: "3px 8px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "#2a2a2a"; }}
                      >
                        Remove
                      </button>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div style={{ padding: "20px 0", textAlign: "center" as const, color: C.muted, fontSize: 13 }}>
                  No items match this filter.
                </div>
              )}

              {/* Add item row */}
              <div style={{ display: "flex", gap: 8, paddingTop: 12 }}>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
                  placeholder="Add action item..."
                  style={{
                    flex: 1,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.head,
                    fontSize: 13,
                    padding: "8px 12px",
                    outline: "none",
                  }}
                />
                <m.button
                  onClick={addItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: C.amber,
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Add
                </m.button>
              </div>
            </div>
          )}
        </div>

        {/* Toasts */}
        <div style={{ position: "absolute", bottom: -8, left: 20, right: 20, zIndex: 10, pointerEvents: "none" }}>
          <AnimatePresence>
            {toasts.map((toast) => (
              <m.div
                key={toast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: toast.bg,
                  color: toast.color,
                  border: `1px solid ${toast.color}33`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                {toast.text}
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
