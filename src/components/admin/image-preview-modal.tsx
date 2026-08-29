"use client";

import React, { useState, useEffect } from "react";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  X,
  Eye,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  LayoutTemplate,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export interface ImagePreviewSettings {
  imageUrl: string;
  homeImageUrl?: string;
  imageFit: "cover" | "contain";
  imagePosition: "center" | "top" | "bottom";
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  homeImageUrl?: string;
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom";
  aspectRatioType?: "event" | "team" | "about" | "general";
  cardTitle?: string;
  cardSubtitle?: string;
  onApply: (settings: ImagePreviewSettings) => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  homeImageUrl = "",
  imageFit = "cover",
  imagePosition = "center",
  aspectRatioType = "event",
  cardTitle = "Sample Title",
  cardSubtitle = "Dayananda Sagar University • AI Foundry",
  onApply,
}: ImagePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"landing" | "dedicated">("landing");
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [currentHomeUrl, setCurrentHomeUrl] = useState(homeImageUrl);
  const [currentFit, setCurrentFit] = useState<"cover" | "contain">(imageFit);
  const [currentPos, setCurrentPos] = useState<"center" | "top" | "bottom">(imagePosition);
  const [useSeparateHomeImg, setUseSeparateHomeImg] = useState(!!homeImageUrl && homeImageUrl.trim() !== "");

  useEffect(() => {
    setCurrentUrl(imageUrl);
    setCurrentHomeUrl(homeImageUrl || "");
    setCurrentFit(imageFit || "cover");
    setCurrentPos(imagePosition || "center");
    setUseSeparateHomeImg(!!homeImageUrl && homeImageUrl.trim() !== "");
  }, [imageUrl, homeImageUrl, imageFit, imagePosition, isOpen]);

  if (!isOpen) return null;

  const displayImgSrc =
    activeTab === "landing" && useSeparateHomeImg && currentHomeUrl.trim()
      ? normalizeImageUrl(currentHomeUrl)
      : normalizeImageUrl(currentUrl);

  const handleSave = () => {
    onApply({
      imageUrl: currentUrl,
      homeImageUrl: useSeparateHomeImg ? currentHomeUrl : undefined,
      imageFit: currentFit,
      imagePosition: currentPos,
    });
    onClose();
  };

  const getPositionClass = () => {
    if (currentPos === "top") return "object-top";
    if (currentPos === "bottom") return "object-bottom";
    return "object-center";
  };

  const getFitClass = () => {
    return currentFit === "contain" ? "object-contain bg-slate-900/10" : "object-cover";
  };

  return (
    <div
      className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Eye className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Visual Image Preview &amp; Framing Inspector
              </h2>
              <p className="text-xs text-slate-500 font-medium">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* View Switcher Tabs (Landing Page vs Dedicated Page) */}
        <div className="flex items-center justify-between gap-4 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("landing")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "landing"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutTemplate className="size-3.5 text-cyan-600" />
            <span>Landing Page Preview (/)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dedicated")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "dedicated"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="size-3.5 text-cyan-600" />
            <span>
              Dedicated Page Preview (/{aspectRatioType === "team" ? "team" : aspectRatioType === "event" ? "events" : "page"})
            </span>
          </button>
        </div>

        {/* Live Visual Canvas Area */}
        <div className="p-6 rounded-3xl bg-[#FFFFE9] border border-[#C6CCBD] flex flex-col items-center justify-center text-[#2D2E2A]">
          <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7A836F]">
              <span>
                {activeTab === "landing" ? "Homepage Card Context" : "Dedicated Subpage Context"}
              </span>
              <span>
                Fit: {currentFit.toUpperCase()} • Pos: {currentPos.toUpperCase()}
              </span>
            </div>

            {/* Event Card Simulation */}
            {aspectRatioType === "event" && (
              <div className="bg-white/80 border border-[#C6CCBD] rounded-3xl p-5 shadow-xs space-y-3">
                <div
                  className={`relative w-full rounded-2xl overflow-hidden border border-[#C6CCBD]/80 bg-slate-100 ${
                    activeTab === "landing" ? "h-48 sm:h-52" : "h-56 sm:h-60"
                  }`}
                >
                  <img
                    src={displayImgSrc}
                    alt="Preview"
                    className={`w-full h-full ${getFitClass()} ${getPositionClass()} transition-all duration-300`}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#ECFF17] text-black text-[9px] font-bold font-mono">
                    UPCOMING
                  </div>
                </div>
                <div>
                  <h4 className="font-libre text-lg font-bold text-[#2D2E2A] truncate">
                    {cardTitle || "AI Innovation Hackathon"}
                  </h4>
                  <p className="text-[11px] text-[#7A836F] font-mono truncate">{cardSubtitle}</p>
                </div>
              </div>
            )}

            {/* Team Card Simulation */}
            {aspectRatioType === "team" && (
              <div className="bg-white/80 border border-[#C6CCBD] rounded-3xl p-5 shadow-xs space-y-3">
                <div
                  className={`relative w-full rounded-2xl overflow-hidden border border-[#C6CCBD]/80 bg-slate-100 ${
                    activeTab === "landing" ? "h-64 sm:h-72" : "h-52 sm:h-60"
                  }`}
                >
                  <img
                    src={displayImgSrc}
                    alt="Preview"
                    className={`w-full h-full ${getFitClass()} ${getPositionClass()} transition-all duration-300`}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#2D2E2A] text-white text-[9px] font-bold font-mono">
                    LEADERSHIP
                  </div>
                </div>
                <div>
                  <h4 className="font-libre text-lg font-bold text-[#2D2E2A] truncate">
                    {cardTitle || "Team Member Name"}
                  </h4>
                  <p className="text-[11px] text-[#7A836F] font-mono truncate">
                    {cardSubtitle || "Executive Director / Lead"}
                  </p>
                </div>
              </div>
            )}

            {/* About Us or General View Simulation */}
            {(aspectRatioType === "about" || aspectRatioType === "general") && (
              <div className="bg-white/80 border border-[#C6CCBD] rounded-3xl p-5 shadow-xs space-y-3">
                <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#C6CCBD]/80 bg-slate-100">
                  <img
                    src={displayImgSrc}
                    alt="Preview"
                    className={`w-full h-full ${getFitClass()} ${getPositionClass()} transition-all duration-300`}
                  />
                </div>
                <div>
                  <h4 className="font-libre text-base font-bold text-[#2D2E2A]">
                    {cardTitle || "About AI Foundry Showcase"}
                  </h4>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls & Formatting Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Fit Mode */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Object Fit Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrentFit("cover")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                  currentFit === "cover"
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Maximize2 className="size-3.5" />
                <span>Cover (Fill)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentFit("contain")}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border ${
                  currentFit === "contain"
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Minimize2 className="size-3.5" />
                <span>Contain (Full)</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {currentFit === "cover"
                ? "Fills container completely (crops excess)"
                : "Shows the complete uncropped image inside the box"}
            </p>
          </div>

          {/* Focal Position */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Focal Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["top", "center", "bottom"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setCurrentPos(pos)}
                  className={`py-2 px-2 rounded-xl font-bold text-xs capitalize cursor-pointer border ${
                    currentPos === pos
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {currentPos === "top"
                ? "Anchors to top (prevents cutting off faces)"
                : currentPos === "bottom"
                ? "Anchors to bottom"
                : "Centers image equally in viewport"}
            </p>
          </div>
        </div>

        {/* Separate Landing Page Image Option (Optional) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useSeparateHomeImg}
                onChange={(e) => setUseSeparateHomeImg(e.target.checked)}
                className="size-4 text-cyan-600 rounded"
              />
              <span>Use a separate image specifically for the Landing Page card</span>
            </label>
          </div>

          {useSeparateHomeImg && (
            <div className="space-y-1 pt-1">
              <label className="block font-mono text-[11px] text-slate-600">
                Landing Page Image URL (Custom Crop / Graphic)
              </label>
              <input
                type="text"
                value={currentHomeUrl}
                onChange={(e) => setCurrentHomeUrl(e.target.value)}
                placeholder="Paste alternate image link for homepage..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Check className="size-4" />
            <span>Apply Preview Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
