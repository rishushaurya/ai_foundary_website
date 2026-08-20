"use client";

import React, { useState, useEffect } from "react";
import { EventData } from "@/lib/data";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface CountdownProps {
  event: EventData;
  onRegisterClick?: () => void;
}

export function EventCountdown({ event, onRegisterClick }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const target = new Date(event.date).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
              FEATURED EVENT
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">
              {event.status}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-tight text-white">
            {event.title}
          </h3>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-cyan-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-cyan-400" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Right Timer Units */}
        <div className="flex flex-col items-center sm:items-end gap-4 w-full md:w-auto">
          {!timeLeft.isEnded ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { label: "DAYS", value: timeLeft.days },
                { label: "HRS", value: timeLeft.hours },
                { label: "MIN", value: timeLeft.minutes },
                { label: "SEC", value: timeLeft.seconds },
              ].map((unit, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border border-white/10 bg-white/5 min-w-[56px] sm:min-w-[64px]"
                >
                  <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 tracking-tight">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl border border-white/10 bg-white/5 text-xs font-mono uppercase text-slate-400">
              Event has commenced
            </div>
          )}

          {/* Registration Button */}
          {event.registrationMode === "google-form" && event.googleFormUrl ? (
            <a
              href={event.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,210,255,0.4)] no-underline"
            >
              <span>Register on Google Forms</span>
              <ArrowRight className="size-3.5" />
            </a>
          ) : (
            <button
              onClick={onRegisterClick}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
            >
              <span>Register Now</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
