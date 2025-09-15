"use client";

import { useState } from "react";

interface ChartData {
  date: string;
  views: number;
  visitors: number;
}

interface TrafficChartProps {
  data: ChartData[];
  loading?: boolean;
}

export default function TrafficChart({ data, loading = false }: TrafficChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Traffic Trends</h2>
        <div className="h-64 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>No data available</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate chart dimensions and scaling
  const chartHeight = 200;
  const chartWidth = 100;
  const maxValue = Math.max(...data.map(d => Math.max(d.views, d.visitors)), 1);
  const yAxisSteps = 5;
  const stepValue = Math.ceil(maxValue / (yAxisSteps - 1));
  
  // Generate Y-axis labels
  const yAxisLabels = Array.from({ length: yAxisSteps }, (_, i) => stepValue * (yAxisSteps - 1 - i));
  
  const getBarHeight = (value: number): number => {
    return Math.max((value / maxValue) * chartHeight, 2);
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Traffic Trends</h2>
        {loading && <div className="text-sm text-blue-600 animate-pulse">Updating...</div>}
      </div>
      
      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-slate-600">Page Views</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-sm text-slate-600">Visitors</span>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative">
        {/* Chart Area */}
        <div className="flex items-end" style={{ height: chartHeight + 40 }}>
          {/* Y-Axis */}
          <div className="flex flex-col justify-between mr-4" style={{ height: chartHeight }}>
            {yAxisLabels.map((label, index) => (
              <div key={index} className="text-xs text-slate-500 text-right leading-none">
                {label}
              </div>
            ))}
          </div>
          
          {/* Chart Bars */}
          <div className="flex-1 flex items-end justify-between">
            {data.slice(-14).map((day, index) => {
              const viewsHeight = getBarHeight(day.views);
              const visitorsHeight = getBarHeight(day.visitors);
              const isHovered = hoveredIndex === index;
              
              return (
                <div
                  key={index}
                  className="flex flex-col items-center relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ width: `${chartWidth / data.slice(-14).length}%` }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
                      <div className="font-semibold">{day.date}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-blue-400 rounded"></div>
                        <span>{day.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded"></div>
                        <span>{day.visitors} visitors</span>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                    </div>
                  )}
                  
                  {/* Bars container */}
                  <div className="flex items-end justify-center space-x-1 mb-2" style={{ height: chartHeight }}>
                    {/* Page Views Bar */}
                    <div
                      className={`bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'from-blue-700 to-blue-500 shadow-lg' : ''
                      }`}
                      style={{
                        height: `${viewsHeight}px`,
                        width: '8px',
                      }}
                    />
                    
                    {/* Visitors Bar */}
                    <div
                      className={`bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'from-emerald-700 to-emerald-500 shadow-lg' : ''
                      }`}
                      style={{
                        height: `${visitorsHeight}px`,
                        width: '8px',
                      }}
                    />
                  </div>
                  
                  {/* Date Label */}
                  <div className="text-xs text-slate-500 text-center transform -rotate-45 origin-center whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('id-ID', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none ml-12" style={{ height: chartHeight }}>
          {yAxisLabels.map((_, index) => (
            <div key={index} className="w-full border-t border-slate-200 border-dashed opacity-50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
