import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  getUserConsent,
  updateUserConsent,
  exportUserData,
} from "@/lib/data/assessment-v2-data";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  if (searchParams.get("export") === "1") {
    const data = await exportUserData();
    return NextResponse.json(data);
  }

  const consent = await getUserConsent();
  return NextResponse.json({ consent });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const consent = await updateUserConsent(body);
  return NextResponse.json({ consent });
}
