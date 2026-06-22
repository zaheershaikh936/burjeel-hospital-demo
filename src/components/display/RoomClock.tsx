"use client";

import { useState, useEffect } from "react";

export function RoomClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={className ?? "text-right"}>
      <p className="text-4xl font-bold tabular-nums tracking-tight leading-none">{time}</p>
      <p className="text-sm opacity-70 mt-1">{date}</p>
    </div>
  );
}
