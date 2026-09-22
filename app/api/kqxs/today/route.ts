import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, fetchXsmn } from "@/lib/xsmn";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const { payload } = await fetchXsmn(date);

    const origin = req.nextUrl.origin;
    const imageUrl = payload.dateIso
      ? `${origin}/api/kqxs/image?date=${payload.dateIso}`
      : `${origin}/api/kqxs/image`;

    return NextResponse.json(
      { ...payload, imageUrl },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message, completed: false },
      { status: 502, headers: corsHeaders() }
    );
  }
}
