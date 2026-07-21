import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "HUBSPOT_ACCESS_TOKEN not configured." }, { status: 503 });
  }

  // Verify the token works by hitting a lightweight HubSpot endpoint
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "HubSpot token invalid or expired.", status: res.status }, { status: 401 });
  }

  return NextResponse.json({ connected: true });
}
