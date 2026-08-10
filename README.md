# Meeting Intelligence Engine

Built by John Moffa · johnmoffa.com · Powered by Claude

An AI-powered meeting preparation tool that generates complete pre-call briefs for any company. Enter a company name, describe your context, pick your stakeholders, and get back a full meeting brief with sentiment analysis, ranked next steps, stakeholder LinkedIn links, and a follow-up email draft. Optionally syncs to HubSpot CRM.

Live demo: https://johnmoffa.com (scroll to Agents section)

> **Note:** This repo is a showcase snapshot of the Meeting Intelligence Agent. The actively maintained, deployment-ready version — with a customer access gate, optional HubSpot integration, and rate limiting — lives in [john-moffa-site](https://github.com/moffajj/john-moffa-site).

## Tech stack
Next.js 16, Vercel, Claude API (claude-sonnet-4-5), Upstash Redis, HubSpot Private App API (optional), Tailwind CSS, Framer Motion

## Key files
- `app/components/agents/MeetingPrepAgent.tsx` — main agent component (wizard UI + output)
- `app/components/agents/MeetingIntelligenceHub.tsx` — meeting history Q&A, participants, transcripts
- `app/components/agents/ActionItemTracker.tsx` — shared action item tracker component
- `app/api/agents/meeting-prep/route.ts` — Claude API route (generates the brief, rate limiting)
- `app/api/integrations/hubspot/route.ts` — HubSpot token health check
- `app/api/integrations/hubspot/push/route.ts` — push brief data to HubSpot CRM
- `proxy.ts` — access gate (APP_ACCESS_TOKEN) + Supabase session handling

## Setup
Copy `.env.local.example` to `.env.local`, fill in your keys, and run `npm run dev`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `APP_ACCESS_TOKEN` | Yes | Shared secret for the access gate — generate with `openssl rand -base64 32` |
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL (rate limiting) |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `RATE_LIMIT_DAILY` | No | Max meeting-prep requests per day (default: 50) |
| `HUBSPOT_ACCESS_TOKEN` | No | HubSpot Private App token with CRM read/write scope |
| `NEXT_PUBLIC_HUBSPOT_ENABLED` | No | Set to `true` to show the HubSpot CRM sync UI |

## Access gate
Set `APP_ACCESS_TOKEN` to a random secret. Share `https://yoursite.com/?token=<value>` with your customer — on first visit the token is stored in a cookie for 30 days. Leave `APP_ACCESS_TOKEN` unset to disable the gate locally.

## HubSpot integration (optional)
If `HUBSPOT_ACCESS_TOKEN` is not set, all HubSpot calls are skipped and the CRM sync UI is hidden. To enable it, set both `HUBSPOT_ACCESS_TOKEN` and `NEXT_PUBLIC_HUBSPOT_ENABLED=true`.

## Deploying this for a customer
For current, complete deployment instructions — including how to set the access gate, configure rate limiting, and wire up HubSpot — see the [john-moffa-site README](https://github.com/moffajj/john-moffa-site#readme). That repo is the canonical deployment target; this one is the isolated agent source for reference.
