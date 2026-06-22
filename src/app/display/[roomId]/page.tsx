"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { logo as defaultLogo } from "@/public/images";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRoom, useUpdateRoomStatus } from "@/hooks/useRooms";
import { useBranding } from "@/hooks/useBranding";
import { AUTO_LOCK_TIMEOUT_MS } from "@/constants";
import { DEFAULT_BRANDING } from "@/services/branding.service";
import type { RoomStatus, PatientGender } from "@/types";

function StatusClock({ color }: { color: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <div style={{ minWidth: "clamp(180px, 22vw, 300px)" }} />;
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="text-right shrink-0" style={{ minWidth: "clamp(180px, 22vw, 300px)" }}>
      <p className="font-black leading-none" style={{ color, fontSize: "clamp(1.4rem, 3.2vw, 2.8rem)" }}>{time}</p>
      <p className="font-bold leading-tight" style={{ color, fontSize: "clamp(0.8rem, 1.4vw, 1.2rem)", opacity: 0.8 }}>{date}</p>
    </div>
  );
}

export default function RoomDisplayPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { room, isLoading } = useRoom(roomId);
  const { branding } = useBranding();
  const updateStatus = useUpdateRoomStatus();

  const [isLocked, setIsLocked] = useState(true);
  const [pendingStatus, setPendingStatus] = useState<RoomStatus>("vacant");
  const [pendingGender, setPendingGender] = useState<PatientGender>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (room && isLocked) {
      setPendingStatus(room.status);
      setPendingGender(room.gender);
    }
  }, [room, isLocked]);

  const lock = useCallback(() => {
    setIsLocked(true);
    setSaveOpen(false);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, []);

  const resetAutoLock = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(lock, AUTO_LOCK_TIMEOUT_MS);
  }, [lock]);

  function unlock() {
    if (room) {
      setPendingStatus(room.status);
      setPendingGender(room.gender);
    }
    setIsLocked(false);
    resetAutoLock();
  }

  function handleControlClick(fn: () => void) {
    if (isLocked) return;
    fn();
    resetAutoLock();
  }

  async function handleSave() {
    if (!room) return;
    try {
      await updateStatus.mutateAsync({
        room,
        status: pendingStatus,
        gender: pendingGender,
        source: "tablet",
      });
      toast.success("Room updated");
    } catch {
      toast.error("Failed to update room");
    } finally {
      lock();
    }
  }

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const displayStatus  = pendingStatus;
  const displayGender  = pendingGender;
  const isOccupied     = displayStatus === "occupied";

  const bgColor     = branding.displayBgColor || DEFAULT_BRANDING.displayBgColor;
  const headerColor = branding.headerColor    || DEFAULT_BRANDING.headerColor;
  const roomCardBg  = branding.roomCardColor  || DEFAULT_BRANDING.roomCardColor;
  const maleColor   = branding.maleColor      || DEFAULT_BRANDING.maleColor;
  const femaleColor = branding.femaleColor    || DEFAULT_BRANDING.femaleColor;
  const availColor  = branding.availableColor || DEFAULT_BRANDING.availableColor;
  const fontSizePx  = branding.displayFontSize || DEFAULT_BRANDING.displayFontSize;

  const genderCardBg = isOccupied
    ? displayGender === "male"   ? maleColor
    : displayGender === "female" ? femaleColor
    : "#6b7280"
    : availColor;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: bgColor }}>
        <p className="text-3xl font-bold text-gray-700">Room Not Found</p>
        <p className="text-gray-400 text-sm">ID: {roomId}</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden select-none relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* ── Status bar (always visible) ── */}
      <div
        className="relative z-20 shrink-0 flex items-center px-8 pt-4 pb-2 bg-white border-b border-gray-100"
        style={{ minHeight: "clamp(110px, 16vh, 160px)" }}
      >
        {/* Logo */}
        <div className="shrink-0 flex items-center" style={{ width: "clamp(160px, 22vw, 300px)" }}>
          <Image
            src={branding.logo || defaultLogo}
            alt="Hospital Logo"
            width={400}
            height={400}
            className="object-contain object-left w-full"
            style={{ maxHeight: "clamp(90px, 13vh, 140px)" }}
          />
        </div>

        {/* — OCCUPIED / AVAILABLE — */}
        {(() => {
          const statusColor = isOccupied ? "#F97316" : "#82C179";
          return (
            <div className="flex-1 flex items-center gap-3 sm:gap-5 px-3 sm:px-6">
              <div className="flex-1 rounded-full" style={{ backgroundColor: statusColor, height: "clamp(8px, 0.45vh, 5px)" }} />
              <span
                className="font-black uppercase whitespace-nowrap"
                style={{
                  color: statusColor,
                  fontSize: "clamp(2rem, 3.8vw, 2.4rem)",
                  letterSpacing: "0.16em",
                }}
              >
                {isOccupied ? "OCCUPIED" : "AVAILABLE"}
              </span>
              <div className="flex-1 rounded-full" style={{ backgroundColor: statusColor, height: "clamp(8px, 0.45vh, 5px)" }} />
            </div>
          );
        })()}

        {/* Time & date — fixed burgundy */}
        <StatusClock color="#7E254B" />
      </div>

      {/* ── Slide-in control header (unlocked only) ── */}
      <AnimatePresence>
        {!isLocked && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 sm:px-8 py-3 sm:py-4 shadow-xl"
            style={{ backgroundColor: "#7E254B" }}
          >
            {/* Occupancy */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Occupancy</span>
              <div className="flex items-center gap-2">
                {(["occupied", "vacant"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleControlClick(() => {
                      setPendingStatus(s);
                      if (s === "vacant") setPendingGender(null);
                    })}
                    className={cn(
                      "px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase border-2 transition-all duration-150",
                      displayStatus === s
                        ? "bg-white text-gray-900 border-white"
                        : "bg-transparent text-white border-white hover:bg-white/10"
                    )}
                  >
                    {s === "occupied" ? "Occupied" : "Available"}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Patient Gender</span>
              <div className="flex items-center gap-2">
                {(["male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => handleControlClick(() => {
                      if (pendingStatus === "occupied") setPendingGender(g);
                    })}
                    className={cn(
                      "px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase border-2 transition-all duration-150",
                      displayGender === g
                        ? "bg-white text-gray-900 border-white"
                        : "bg-transparent text-white border-white hover:bg-white/10",
                      pendingStatus === "vacant" && "opacity-40 pointer-events-none"
                    )}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            {/* Save & Close */}
            <Popover open={saveOpen} onOpenChange={setSaveOpen}>
              <PopoverTrigger
                onClick={() => { setSaveOpen(true); resetAutoLock(); }}
                className="px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-black uppercase cursor-pointer transition-all duration-150 bg-orange-500 text-white border-2 border-orange-400 hover:bg-orange-600 active:scale-95"
              >
                Save &amp; Close
              </PopoverTrigger>
              <PopoverContent className="w-56 sm:w-60 p-4" align="end" side="bottom">
                <p className="text-sm font-semibold mb-1">Confirm changes?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Updates room status on all displays in real time.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSaveOpen(false)}>Cancel</Button>
                  <Button size="sm" className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                    {updateStatus.isPending
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : "Confirm"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main cards ── */}
      <div className="flex-1 flex items-center justify-center gap-5 sm:gap-8 px-8 py-4 relative z-10 min-h-0">
        {/* Room number card */}
        <motion.div
          layout
          className="rounded-[32px] sm:rounded-[40px] flex flex-col items-center justify-center shadow-xl"
          style={{
            backgroundColor: roomCardBg,
            width: "min(48vw, 74vh)",
            height: "min(48vw, 74vh)",
          }}
        >
          <p
            className="font-black text-white tracking-tight leading-none text-center"
            style={{ fontSize: `clamp(3.5rem, ${fontSizePx * 0.13}vw + 1rem, ${fontSizePx}px)` }}
          >
            {room.roomNumber}
          </p>
          <p
            className="font-bold text-white/60 mt-3 text-center px-6"
            style={{ fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
          >
            {room.roomName}
          </p>
        </motion.div>

        {/* Status / gender card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayStatus}-${displayGender}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-[32px] sm:rounded-[40px] flex flex-col items-center justify-center shadow-xl"
            style={{
              backgroundColor: genderCardBg,
              width: "min(48vw, 74vh)",
              height: "min(48vw, 74vh)",
            }}
          >
            <span
              className="text-white leading-none"
              style={{
                fontSize: `clamp(7rem, ${Math.round(fontSizePx * 1.2) * 0.18}vw + 2rem, ${Math.round(fontSizePx * 1.6)}px)`,
                lineHeight: 1,
                WebkitTextStroke: "clamp(5px, 0.8vw, 9px) white",
                paintOrder: "stroke fill",
              }}
            >
              {isOccupied
                ? displayGender === "male"   ? "♂"
                : displayGender === "female" ? "♀"
                : "?"
                : "✓"}
            </span>
            <p
              className="font-black text-white mt-4 capitalize"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              {isOccupied ? (displayGender ?? "Unknown") : "Available"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Promotional banner ── */}
      {branding.bannerEnabled && branding.bannerText && (
        <div
          className="shrink-0 z-20 overflow-hidden border-t border-white/10"
          style={{ backgroundColor: headerColor }}
        >
          <div className="py-2 overflow-hidden whitespace-nowrap">
            <div
              className="inline-flex text-white/80 font-medium"
              style={{
                animation: "marquee-scroll 30s linear infinite",
                fontSize: "clamp(0.75rem, 1.5vw, 0.9375rem)",
              }}
            >
              <span className="pr-20 sm:pr-24">{branding.bannerText}</span>
              <span className="pr-20 sm:pr-24" aria-hidden>{branding.bannerText}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Lock / Unlock (always on top, vertically centred in status bar) ── */}
      <button
        onClick={() => (isLocked ? unlock() : lock())}
        className={cn(
          "absolute right-3 sm:right-4 z-40 flex items-center justify-center rounded-full transition-all duration-200",
          "w-7 h-7",
          isLocked
            ? "bg-transparent hover:bg-black/8"
            : "bg-black/10 hover:bg-black/15"
        )}
        style={{ bottom: "clamp(12px, 2vh, 20px)" }}
        title={isLocked ? "Unlock to edit" : "Lock"}
      >
        {isLocked
          ? <Lock className="w-3 h-3 text-black/20" />
          : <Unlock className="w-3 h-3 text-black/40" />}
      </button>
    </div>
  );
}
