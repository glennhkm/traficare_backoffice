import { getAnalyticsStats } from "@/lib/analytics";
import AnalyticsClient from "@/components/AnalyticsClient";

export default async function AnalyticsPage() {
  const stats = await getAnalyticsStats();

  return (
    <main className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Monitor traffic dan engagement website TRAFICARE secara real-time</p>
      </div>

      {/* Analytics Client Component */}
      <AnalyticsClient initialStats={stats} />
    </main>
  );
}
