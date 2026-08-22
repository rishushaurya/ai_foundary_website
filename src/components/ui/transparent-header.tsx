"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LightNavbar } from "@/components/ui/light-navbar";

export function TransparentHeader() {
  const pathname = usePathname();

  // If on admin routes, header is handled by admin layout
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <LightNavbar />;
}
