import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "AI status service has been deprecated and disabled" }, { status: 404 });
}
