"use client";

import { useState, useEffect } from "react";
import { AnalyticsStats } from "@/lib/analytics";
import { 
  ChartSkeleton, 
  DeviceStatsSkeleton, 
  ActivityCardSkeleton,
  ButtonSkeleton,
  LoadingSpinner
} from "@/components/LoadingComponents";

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
          icon="👥"
          color="blue"
          change="+12% dari bulan lalu"
        />
        <StatCard 
          label="Panduan P3K" 
          value={guidesCount} 
          icon="📚"
          color="emerald"
          change="4 kategori tersedia"
        />
        <StatCard 
          label="Page Views" 
          value={stats.totalPageViews} 
          icon="📊"
          color="purple"
          change={`${timespan} hari terakhir`}
        />
        <StatCard 
          label="Unique Visitors" 
          value={stats.uniqueVisitors} 
          icon="👀"
          color="orange"
          change="Traffic website"
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
                <span className="text-sm text-slate-600 hidden sm:inline">Periode:</span>
                <select
                  value={timespan}
                  onChange={(e) => setTimespan(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Device Types</h2>
            <div className="space-y-4">
              {stats.deviceStats && stats.deviceStats.length > 0 ? (
                stats.deviceStats.map((device, index) => {
                  const total = stats.deviceStats.reduce((sum, d) => sum + d.count, 0);
                  const percentage = total > 0 ? (device.count / total) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-16 text-sm font-medium text-slate-700">{device.device_type}</div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-slate-600">{device.count}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm">Belum ada data device</div>
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
              icon="⭐"
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
              icon="🌐"
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
  const displayData = data.slice(-Math.min(timespan, 90));
  const maxViews = Math.max(...displayData.map(d => d.views), 1);
  const minViews = Math.min(...displayData.map(d => d.views));
  
  // Create SVG path for the line
  const createPath = (data: any[]) => {
    const width = 100; // percentage
    const height = 100; // percentage
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.views - minViews) / (maxViews - minViews || 1)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const path = createPath(displayData);

  return (
    <div className="h-full relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-slate-300"></div>
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 py-4">
        <span>{maxViews}</span>
        <span>{Math.round(maxViews * 0.75)}</span>
        <span>{Math.round(maxViews * 0.5)}</span>
        <span>{Math.round(maxViews * 0.25)}</span>
        <span>{minViews}</span>
      </div>

      {/* Chart area */}
      <div className="ml-12 mr-4 h-full relative">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Area gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area under the line */}
          <path
            d={`${path} L 100 100 L 0 100 Z`}
            fill="url(#areaGradient)"
            className="transition-all duration-300"
          />
          
          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="0.8"
            className="transition-all duration-300"
          />
        </svg>

        {/* Interactive points overlay */}
        <div className="absolute inset-0 flex items-stretch">
          {displayData.map((point, index) => {
            const x = (index / (displayData.length - 1)) * 100;
            const y = 100 - ((point.views - minViews) / (maxViews - minViews || 1)) * 100;
            
            return (
              <div
                key={index}
                className="absolute group cursor-pointer"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Invisible hover area */}
                <div className="w-8 h-8 -m-4 hover:bg-blue-100 hover:bg-opacity-20 rounded-full transition-colors"></div>
                
                {/* Dot */}
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    <div className="font-medium">{point.views} views</div>
                    <div className="text-slate-300">
                      {new Date(point.date).toLocaleDateString('id-ID', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: point.date.includes('2024') ? 'numeric' : undefined
                      })}
                    </div>
                    {point.visitors > 0 && (
                      <div className="text-slate-300 text-xs">
                        {point.visitors} visitors
                      </div>
                    )}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 py-2">
          <span>
            {displayData.length > 0 && new Date(displayData[0].date).toLocaleDateString('id-ID', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="font-medium">
            Avg: {Math.round(displayData.reduce((sum, d) => sum + d.views, 0) / displayData.length)} views/day
          </span>
          <span>
            {displayData.length > 0 && new Date(displayData[displayData.length - 1].date).toLocaleDateString('id-ID', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, change }: { 
  label: string; 
  value: number; 
  icon: string; 
  color: string; 
  change: string; 
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50", 
    purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50",
    orange: "from-orange-500 to-orange-600 text-orange-600 bg-orange-50"
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses].split(' ').slice(2).join(' ')}`}>
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-600 font-medium">{label}</div>
    </div>
  );
}

function ActivityCard({ title, icon, data, renderItem }: {
  title: string;
  icon: string;
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
          {icon}
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
