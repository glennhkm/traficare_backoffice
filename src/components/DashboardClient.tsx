"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/admin/StatCard";
import { AnalyticsStats } from "@/lib/analytics";
import { 
  ChartSkeleton, 
  DeviceStatsSkeleton, 
  ActivityCardSkeleton,
  ButtonSkeleton,
  LoadingSpinner
} from "@/components/LoadingComponents";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

interface DashboardClientProps {
  initialStats: AnalyticsStats;
  studentsCount: number;
  guidesCount: number;
  recentViews: any[];
  recentVisits: any[];
}

export default function DashboardClient({ 
  initialStats, 
  studentsCount, 
  guidesCount, 
  recentViews,
  recentVisits 
}: DashboardClientProps) {
  const [stats, setStats] = useState<AnalyticsStats>(initialStats);
  const [timespan, setTimespan] = useState("30");
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async (days: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/stats?days=${days}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timespan !== "30") {
      fetchAnalytics(timespan);
    }
  }, [timespan]);

  return (
    <>
      {/* Stats Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Siswa" 
          value={studentsCount} 
          icon="/icons/member-list.svg"
          bgOpacity={10}
        />
        <StatCard 
          label="Panduan P3K" 
          value={guidesCount} 
          icon="/icons/info-guide.svg"
          bgOpacity={10}
        />
        <StatCard 
          label="Page Views" 
          value={stats.totalPageViews} 
          icon="/icons/overview.svg"
          bgOpacity={10}
        />
        <StatCard 
          label="Unique Visitors" 
          value={stats.uniqueVisitors} 
          icon="/icons/visit.svg"
          bgOpacity={10}
        />
      </section>

      {/* Analytics Charts Section */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Traffic Trends Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Traffic Trends</h2>
              
              {/* Timespan Selector */}
              <div className="flex items-center space-x-3">
                <select
                  value={timespan}
                  onChange={(e) => setTimespan(e.target.value)}
                  className="border border-slate-300 rounded-3xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  disabled={loading}
                >
                  <option value="7">7 Hari</option>
                  <option value="14">14 Hari</option>
                  <option value="30">30 Hari</option>
                  <option value="90">90 Hari</option>
                </select>
              </div>
            </div>
            
            <div className="h-80">
              {stats.dailyStats && stats.dailyStats.length > 0 ? (
                <TrafficChart data={stats.dailyStats} timespan={parseInt(timespan)} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-sm">Belum ada data traffic</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Mulai kunjungi website frontpage untuk melihat analytics
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device Stats */}
        {loading ? (
          <DeviceStatsSkeleton />
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Device Types</h2>
            <div className="h-64">
              {stats.deviceStats && stats.deviceStats.length > 0 ? (
                <DeviceChart data={stats.deviceStats} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm">Belum ada data device</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Activity Section */}
      <section className="grid lg:grid-cols-2 gap-6">                
        {loading ? (
          <>
            <ActivityCardSkeleton title="Halaman Populer" />
            <ActivityCardSkeleton title="Traffic Terbaru" />
          </>
        ) : (
          <>
            <ActivityCard 
              title="Halaman Populer"
              icon="/icons/population.svg"
              data={stats.topPages?.slice(0, 8) || []}
              renderItem={(page, i) => (
                <li key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{page.path}</div>
                  </div>
                  <div className="ml-3 text-sm text-slate-600">{page.views} views</div>
                </li>
              )}
            />

            <ActivityCard 
              title="Traffic Terbaru"
              icon="/icons/traffic-cone.svg"
              data={recentVisits || []}
              renderItem={(activity, i) => (
                <li key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{activity.path}</div>
                    <div className="text-xs text-slate-500">
                      {activity.student_nis ? `Student: ${activity.students.nama}` : "Anonymous"}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </li>
              )}
            />
          </>
        )}
      </section>
    </>
  );
}

function TrafficChart({ data, timespan }: { data: any[], timespan: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-sm">Tidak ada data untuk periode ini</div>
        </div>
      </div>
    );
  }

  // Show appropriate number of days based on timespan
  const displayData = data.slice(-Math.min(timespan, 90)).map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066A5" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#0066A5" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ff8c00" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="formattedDate" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: '#64748b', fontSize: 11 }}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: '#64748b', fontSize: 11 }} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            borderRadius: '12px', 
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
        />
        <Legend 
          verticalAlign="top" 
          height={40} 
          iconType="circle"
          iconSize={12}
          wrapperStyle={{ fontSize: '16px', color: '#1e293b', fontWeight: '600', paddingBottom: '15px' }}
        />
        <Area 
          type="monotone" 
          name="Page Views"
          dataKey="views" 
          stroke="#0066A5" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#viewsGradient)" 
        />
        <Area 
          type="monotone" 
          name="Unique Visitors"
          dataKey="visitors" 
          stroke="#ff8c00" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#visitorsGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DeviceChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center py-8">
          <div className="text-2xl mb-2">📱</div>
          <div className="text-sm">Belum ada data device</div>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.device_type,
    value: item.count
  }));

  const COLORS = ['#0066A5', '#2563eb', '#60a5fa', '#93c5fd'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="42%"
          innerRadius={48}
          outerRadius={70}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            borderRadius: '10px', 
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={40} 
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: '18px', color: '#1e293b', fontWeight: '600', paddingTop: '10px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}



function ActivityCard({ title, icon, data, renderItem }: {
  title: string;
  icon: string;
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-[#0066A5]/10 rounded-xl flex items-center justify-center p-2.5">
          {icon.startsWith('/') ? (
            <img 
              src={icon} 
              alt="" 
              className="w-5 h-5" 
              style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }}
            />
          ) : (
            <span className="text-lg">{icon}</span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      
      {data && data.length > 0 ? (
        <ul className="space-y-0">
          {data.map(renderItem)}
        </ul>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-sm">Belum ada aktivitas</div>
        </div>
      )}
    </div>
  );
}
