"use client";

import { useState, useEffect } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  bgOpacity: number;
}

export default function StatCard({ label, value, icon, bgOpacity }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000; // 1 second animation duration
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.max(Math.min(elapsed / duration, 1), 0);
      
      // Easing function: easeOutQuad for smooth deceleration
      const easeProgress = progress * (2 - progress);
      
      const current = Math.floor(easeProgress * end);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center p-2 shrink-0"
          style={{ backgroundColor: `rgba(0, 102, 165, ${bgOpacity / 100})` }}
        >
          {icon.startsWith("/") ? (
            <img 
              src={icon} 
              alt="" 
              className="w-5.5 h-5.5" 
              style={{ filter: "invert(26%) sepia(85%) saturate(2032%) hue-rotate(188deg) brightness(91%) contrast(101%)" }}
            />
          ) : (
            <span className="text-lg">{icon}</span>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 leading-tight">
        {displayValue.toLocaleString()}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
