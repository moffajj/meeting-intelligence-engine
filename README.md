# Meeting Intelligence Engine

Built by John Moffa · johnmoffa.com · Powered by Claude

An AI-powered meeting preparation tool that generates complete pre-call briefs for Fortune 500 companies. Select a company, describe your context, pick your stakeholders, and get back a full meeting brief with sentiment analysis, ranked next steps, stakeholder LinkedIn links, a follow-up email draft, and HubSpot CRM sync.

Live demo: https://johnmoffa.com (scroll to Agents section)

## Tech stack
Next.js, Vercel, Claude API (claude-sonnet-4-5), HubSpot Private App API, Tailwind CSS, Framer Motion

## Key files
- `app/components/agents/MeetingPrepAgent.tsx` — main agent component (wizard UI + output)
- `app/components/agents/MeetingIntelligenceHub.tsx` — meeting history Q&A, participants, transcripts
- `app/components/agents/ActionItemTracker.tsx` — shared action item tracker component
- `app/api/agents/meeting-prep/route.ts` — Claude API route (generates the brief)
- `app/api/integrations/hubspot/route.ts` — HubSpot token health check
- `app/api/integrations/hubspot/push/route.ts` — push brief data to HubSpot CRM

## Setup
Copy `.env.local.example` to `.env.local`, fill in your keys, and run `npm run dev`.

## Environment variables
- `ANTHROPIC_API_KEY` — your Anthropic API key
- `HUBSPOT_ACCESS_TOKEN` — a HubSpot Private App access token with CRM write scope
