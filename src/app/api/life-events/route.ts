import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { addLifeEvent, getLifeEvents } from "@/lib/data/assessment-v2-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await getLifeEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const event = await addLifeEvent(body);
  return NextResponse.json({ event });
}
