import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAnalyticsStats } from "@/lib/analytics";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  // Get analytics stats (default 30 days)
  const analyticsStats = await getAnalyticsStats();

  const [{ count: studentsCount }] = await Promise.all([
    supabaseAdmin.from("students").select("*", { count: "exact", head: true }),
  ]);
  const { count: guidesCount } = await supabaseAdmin
    .from("guides")
    .select("*", { count: "exact", head: true });

  const { data: recentViews } = await supabaseAdmin
    .from("guide_views")
    .select(
      "student_nis, guide_id, viewed_at, guides:guides!inner(title, category)"
    )
    .order("viewed_at", { ascending: false })
    .limit(10);
  const { data: recentVisits } = await supabaseAdmin
      .from("analytics_page_views")
      .select("path, timestamp, student_nis, user_agent, students:students(nama)")
      .order("created_at", { ascending: false })
      .limit(5);

  return (
    <main className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Statistik ringkas dan aktivitas terbaru platform TRAFICARE
        </p>
      </div>

      {/* Dashboard Client Component */}
      <DashboardClient
        initialStats={analyticsStats}
        studentsCount={studentsCount ?? 0}
        guidesCount={guidesCount ?? 0}
        recentViews={recentViews ?? []}
        recentVisits={recentVisits ?? []}
      />
    </main>
  );
}
