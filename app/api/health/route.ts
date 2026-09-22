import { NextResponse } from "next/server";
import { corsHeaders, SOURCE_API } from "@/lib/xsmn";

export const runtime = "edge";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "kqxs-phuocdanh-api",
      source: SOURCE_API,
      endpoints: {
        today: "/api/kqxs/today",
        todayByDate: "/api/kqxs/today?date=YYYY-MM-DD",
        image: "/api/kqxs/image",
        imageByDate: "/api/kqxs/image?date=YYYY-MM-DD",
      },
    },
    { headers: corsHeaders() }
  );
}
