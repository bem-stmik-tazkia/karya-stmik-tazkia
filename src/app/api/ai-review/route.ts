import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "AI review service has been deprecated and disabled" }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "AI review service has been deprecated and disabled" }, { status: 404 });
}
