"use client";

import React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {children}
    </div>
  );
}
