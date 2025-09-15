import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  dailyStats: Array<{ date: string; views: number; visitors: number }>;
  recentActivity: Array<{
    path: string;
    timestamp: string;
    student_nis?: string;
    user_agent: string;
  }>;
  deviceStats: Array<{ device_type: string; count: number }>;
  referrerStats: Array<{ referrer: string; count: number }>;
}

// Generate sample analytics data for demo purposes
function generateSampleAnalyticsData(startDate: string, endDate: string): AnalyticsStats {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const diffDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate daily stats with some realistic variation
  const dailyStats = [];
  for (let i = 0; i <= diffDays; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + i);
    const date = currentDate.toISOString().split("T")[0];
    
    // Generate realistic views (0-20 with some days having more traffic)
    const baseViews = Math.floor(Math.random() * 15) + 1; // 1-15 base views
    const extraViews = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0; // Occasional spikes
    const views = baseViews + extraViews;
    const visitors = Math.max(1, Math.floor(views * 0.6)); // About 60% unique visitors
    
    dailyStats.push({ date, views, visitors });
  }

  const totalViews = dailyStats.reduce((sum, day) => sum + day.views, 0);
  const uniqueVisitors = Math.floor(totalViews * 0.7); // Estimate unique visitors

  return {
    totalPageViews: totalViews,
    uniqueVisitors,
    topPages: [
      { path: "/", views: Math.floor(totalViews * 0.4) },
      { path: "/panduan", views: Math.floor(totalViews * 0.25) },
      { path: "/panduan/evakuasi", views: Math.floor(totalViews * 0.15) },
      { path: "/panduan/luka", views: Math.floor(totalViews * 0.1) },
      { path: "/panduan/fraktur", views: Math.floor(totalViews * 0.1) },
    ],
    dailyStats,
    recentActivity: [
      { path: "/", timestamp: new Date().toISOString(), user_agent: "Mozilla/5.0..." },
      { path: "/panduan", timestamp: new Date(Date.now() - 300000).toISOString(), user_agent: "Mozilla/5.0..." },
      { path: "/panduan/evakuasi", timestamp: new Date(Date.now() - 600000).toISOString(), student_nis: "12345", user_agent: "Mozilla/5.0..." },
    ],
    deviceStats: [
      { device_type: "Desktop", count: Math.floor(totalViews * 0.6) },
      { device_type: "Mobile", count: Math.floor(totalViews * 0.35) },
      { device_type: "Tablet", count: Math.floor(totalViews * 0.05) },
    ],
    referrerStats: [
      { referrer: "Direct", count: Math.floor(totalViews * 0.6) },
      { referrer: "google.com", count: Math.floor(totalViews * 0.3) },
      { referrer: "facebook.com", count: Math.floor(totalViews * 0.1) },
    ],
  };
}

export async function getAnalyticsStats(
  startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: string = new Date().toISOString()
): Promise<AnalyticsStats> {
  try {
    // Check if analytics tables exist by trying to query them
    let hasAnalyticsData = true;
    try {
      await supabaseAdmin.from("analytics_page_views").select("id").limit(1);
    } catch (error) {
      hasAnalyticsData = false;
    }

    // If no analytics data exists, return sample data for demo purposes
    if (!hasAnalyticsData) {
      return generateSampleAnalyticsData(startDate, endDate);
    }
    // Total page views
    const { count: totalPageViews } = await supabaseAdmin
      .from("analytics_page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Unique visitors (by session_id)
    const { data: uniqueVisitorsData } = await supabaseAdmin
      .from("analytics_page_views")
      .select("session_id")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const uniqueVisitors = new Set(uniqueVisitorsData?.map(v => v.session_id) || []).size;

    // Top pages
    const { data: topPagesData } = await supabaseAdmin
      .from("analytics_page_views")
      .select("path")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const pathCounts = (topPagesData || []).reduce((acc: Record<string, number>, item) => {
      acc[item.path] = (acc[item.path] || 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    // Daily stats - generate complete date range
    const { data: dailyData } = await supabaseAdmin
      .from("analytics_page_views")
      .select("created_at, session_id")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: true });

    // Create a complete date range based on the period
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const diffDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate all dates in the range
    const allDates: string[] = [];
    for (let i = 0; i <= diffDays; i++) {
      const currentDate = new Date(startDateObj);
      currentDate.setDate(startDateObj.getDate() + i);
      allDates.push(currentDate.toISOString().split("T")[0]);
    }

    // Initialize daily stats with all dates (zero values)
    const dailyStats: Record<string, { views: number; visitors: Set<string> }> = {};
    allDates.forEach(date => {
      dailyStats[date] = { views: 0, visitors: new Set() };
    });
    
    // Fill in actual data
    (dailyData || []).forEach(item => {
      const date = item.created_at.split("T")[0];
      if (dailyStats[date]) {
        dailyStats[date].views++;
        dailyStats[date].visitors.add(item.session_id);
      }
    });

    // Convert to array format
    const dailyStatsArray = allDates.map(date => ({
      date,
      views: dailyStats[date].views,
      visitors: dailyStats[date].visitors.size,
    }));

    // Recent activity
    const { data: recentActivity } = await supabaseAdmin
      .from("analytics_page_views")
      .select("path, timestamp, student_nis, user_agent, students:students(nama)")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false })
      .limit(5);

    // Device stats (simplified)
    const { data: userAgentData } = await supabaseAdmin
      .from("analytics_page_views")
      .select("user_agent")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    const deviceCounts = (userAgentData || []).reduce((acc: Record<string, number>, item) => {
      const ua = item.user_agent.toLowerCase();
      let deviceType = "Desktop";
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        deviceType = "Mobile";
      } else if (ua.includes("tablet") || ua.includes("ipad")) {
        deviceType = "Tablet";
      }
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {});

    const deviceStats = Object.entries(deviceCounts).map(([device_type, count]) => ({
      device_type,
      count,
    }));

    // Referrer stats
    const { data: referrerData } = await supabaseAdmin
      .from("analytics_page_views")
      .select("referrer")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .neq("referrer", "");

    const referrerCounts = (referrerData || []).reduce((acc: Record<string, number>, item) => {
      const referrer = item.referrer || "Direct";
      const domain = referrer === "Direct" ? "Direct" : new URL(referrer).hostname;
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    const referrerStats = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));

    return {
      totalPageViews: totalPageViews || 0,
      uniqueVisitors,
      topPages,
      dailyStats: dailyStatsArray,
      recentActivity: recentActivity || [],
      deviceStats,
      referrerStats,
    };
  } catch (error) {
    console.error("Analytics stats error:", error);
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      dailyStats: [],
      recentActivity: [],
      deviceStats: [],
      referrerStats: [],
    };
  }
}
