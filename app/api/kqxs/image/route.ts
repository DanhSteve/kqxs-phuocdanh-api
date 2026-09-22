import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, fetchXsmn } from "@/lib/xsmn";
import { renderKqxsImage } from "@/lib/render-image";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const { payload } = await fetchXsmn(date);

    if (!payload.stations.length) {
      return NextResponse.json(
        { error: "no_stations" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return renderKqxsImage({
      date: payload.date,
      stations: payload.stations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 502, headers: corsHeaders() }
    );
  }
}
