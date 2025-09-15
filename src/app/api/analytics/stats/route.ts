import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/analytics";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "30";
    
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    
    const stats = await getAnalyticsStats(startDate, endDate);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
