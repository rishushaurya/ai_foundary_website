import React from "react";

export default function TeamLoading() {
  return (
    <div className="mesh-bg min-h-screen pt-36 sm:pt-44 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Skeleton */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-36 h-6 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-80 sm:w-96 h-12 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="w-full max-w-xl h-5 rounded-lg bg-slate-200 animate-pulse" />
        </div>

        {/* 2-Column Faculty Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="glass-card rounded-[32px] p-8 h-48 bg-white/60 animate-pulse border border-white/80"
            />
          ))}
        </div>

        {/* Wings Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="glass-card rounded-3xl p-6 h-64 bg-white/60 animate-pulse border border-white/80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
