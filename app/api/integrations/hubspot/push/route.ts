import { NextRequest, NextResponse } from "next/server";

interface PushBody {
  company: string;
  stakeholders: string[];
  summary: string;
  nextSteps: string[];
  recommendation: string;
  meetingDate: string;
  meetingType: string;
}

async function hs(path: string, method: string, body?: object) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return NextResponse.json({ error: "HUBSPOT_ACCESS_TOKEN not configured" }, { status: 503 });
  }

  try {
    const body: PushBody = await req.json();
    const { company, stakeholders, summary, nextSteps, recommendation, meetingDate, meetingType } = body;

    // Parse primary stakeholder name into first/last
    const primaryStakeholder = stakeholders?.[0] ?? "";
    const nameParts = primaryStakeholder.trim().split(/\s+/);
    const firstname = nameParts[0] ?? primaryStakeholder;
    const lastname = nameParts.slice(1).join(" ") || "";

    const description = [
      `Meeting Type: ${meetingType}`,
      `Date: ${meetingDate}`,
      `Summary: ${summary}`,
      `Next Steps: ${(nextSteps ?? []).join(", ")}`,
      `Recommendation: ${recommendation}`,
    ].join(" | ");

    const contactProperties = {
      firstname,
      lastname,
      company,
      jobtitle: primaryStakeholder,
      message: description,
    };

    // Search for existing contact by company name
    const searchRes = await hs("/crm/v3/objects/contacts/search", "POST", {
      filterGroups: [{
        filters: [{
          propertyName: "company",
          operator: "EQ",
          value: company,
        }],
      }],
      properties: ["id", "firstname", "lastname", "company"],
      limit: 1,
    });

    if (searchRes.status === 401) {
      return NextResponse.json({ error: "HubSpot token invalid or expired" }, { status: 401 });
    }

    const existingContacts = (searchRes.data as { results?: { id: string }[] }).results ?? [];
    let contactId: string;

    if (existingContacts.length > 0) {
      contactId = existingContacts[0].id;
      const updateRes = await hs(`/crm/v3/objects/contacts/${contactId}`, "PATCH", {
        properties: contactProperties,
      });
      if (updateRes.status === 401) {
        return NextResponse.json({ error: "HubSpot token invalid or expired" }, { status: 401 });
      }
      if (!updateRes.ok) {
        return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
      }
    } else {
      const createRes = await hs("/crm/v3/objects/contacts", "POST", {
        properties: contactProperties,
      });
      if (createRes.status === 401) {
        return NextResponse.json({ error: "HubSpot token invalid or expired" }, { status: 401 });
      }
      if (!createRes.ok) {
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
      }
      contactId = (createRes.data as { id: string }).id;
    }

    return NextResponse.json({ success: true, contactId });
  } catch (err) {
    console.error("HubSpot push error:", err);
    return NextResponse.json({ error: "Failed to push to HubSpot" }, { status: 500 });
  }
}
