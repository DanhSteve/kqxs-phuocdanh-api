import { NextRequest, NextResponse } from "next/server";
import {
  buildLiveCaption,
  corsHeaders,
  fetchXsmt,
} from "@/lib/xsmt";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders({ noStore: true }),
  });
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const { payload } = await fetchXsmt(date);

    const origin = req.nextUrl.origin;
    const imageUrl = payload.dateIso
      ? `${origin}/api/kqxs/image?date=${payload.dateIso}`
      : `${origin}/api/kqxs/image`;
    const liveBoardUrl = `${origin}/live-mt`;
    const musicUrl = `${origin}/audio/xo-so-live-bed.wav`;

    return NextResponse.json(
      {
        ...payload,
        imageUrl,
        liveBoardUrl,
        musicUrl,
        liveCaption: buildLiveCaption(
          payload.date,
          payload.stations,
          payload.stage,
          liveBoardUrl
        ),
      },
      { status: 200, headers: corsHeaders({ noStore: true }) }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message, completed: false },
      { status: 502, headers: corsHeaders({ noStore: true }) }
    );
  }
}
