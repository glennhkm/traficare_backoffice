"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "white";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  color = "blue", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-400",
    white: "text-white"
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Skeleton for Stat Cards
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
        <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="w-20 h-8 bg-slate-200 rounded mb-1"></div>
      <div className="w-24 h-4 bg-slate-200 rounded"></div>
    </div>
  );
}

// Skeleton for Chart
export function ChartSkeleton() {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-32 h-6 bg-slate-200 rounded"></div>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-4 bg-slate-200 rounded hidden sm:block"></div>
          <div className="w-20 h-8 bg-slate-200 rounded"></div>
        </div>
      </div>
      
      <div className="h-80 relative">
        {/* Y-axis skeleton */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-8 h-3 bg-slate-200 rounded"></div>
          ))}
        </div>
        
        {/* Chart area skeleton */}
        <div className="ml-12 mr-4 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-20">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-slate-300"></div>
            ))}
          </div>
          
          {/* Skeleton line chart */}
          <div className="w-full h-full flex items-end justify-between px-2">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 bg-slate-200 rounded-t"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              ></div>
            ))}
          </div>
          
          {/* Bottom stats skeleton */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between py-2">
            <div className="w-12 h-3 bg-slate-200 rounded"></div>
            <div className="w-24 h-3 bg-slate-200 rounded"></div>
            <div className="w-12 h-3 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for Device Stats
export function DeviceStatsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="w-28 h-6 bg-slate-200 rounded mb-4"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-16 h-4 bg-slate-200 rounded"></div>
            <div className="flex-1 bg-slate-200 rounded-full h-2"></div>
            <div className="w-8 h-4 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for Activity Cards
export function ActivityCardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div className="w-32 h-6 bg-slate-200 rounded"></div>
      </div>
      
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex-1 min-w-0">
              <div className="w-3/4 h-4 bg-slate-200 rounded mb-1"></div>
              <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
            </div>
            <div className="w-16 h-4 bg-slate-200 rounded ml-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for Full Dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      {/* Charts Section Skeleton */}
      <section className="grid lg:grid-cols-3 gap-6">
        <ChartSkeleton />
        <DeviceStatsSkeleton />
      </section>

      {/* Activity Section Skeleton */}
      <section className="grid lg:grid-cols-2 gap-6">
        <ActivityCardSkeleton title="Halaman Populer" />
        <ActivityCardSkeleton title="Traffic Terbaru" />
      </section>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({ 
  title = "Memuat...", 
  description = "Mohon tunggu sebentar",
  className = ""
}: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Memproses..." 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface LoadingTableRowProps {
  columns: number;
  rows?: number;
}

export function LoadingTableRow({ columns, rows = 5 }: LoadingTableRowProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-200 animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-slate-200 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Button Loading Skeleton
export function ButtonSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
  );
}

// Form Loading Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
          <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
        </div>
      ))}
      <div className="w-32 h-10 bg-slate-200 rounded-lg mt-6"></div>
    </div>
  );
}
