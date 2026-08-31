"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LightNavbar } from "@/components/ui/light-navbar";
import { WixBoldNavbar } from "@/designs/wix-bold/navbar";
import { VisiblePagesConfig } from "@/lib/data";

export interface TransparentHeaderProps {
  activeDesign?: string;
  visiblePages?: VisiblePagesConfig;
}

export function TransparentHeader({
  activeDesign = "ivory-light",
  visiblePages,
}: TransparentHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If on admin routes, header is handled by admin layout
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Support client-side preview query override
  const previewDesign = searchParams?.get("preview-design");
  const effectiveDesign = previewDesign || activeDesign;

  if (effectiveDesign === "wix-bold") {
    return <WixBoldNavbar visiblePages={visiblePages} />;
  }

  return <LightNavbar visiblePages={visiblePages} />;
}
