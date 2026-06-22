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

  const displayStatus = pendingStatus;
  const displayGender = pendingGender;
  const isOccupied = displayStatus === "occupied";

  const bgColor     = branding.displayBgColor  || DEFAULT_BRANDING.displayBgColor;
  const headerColor = branding.headerColor      || DEFAULT_BRANDING.headerColor;
  const roomCardBg  = branding.roomCardColor    || DEFAULT_BRANDING.roomCardColor;
  const maleColor   = branding.maleColor        || DEFAULT_BRANDING.maleColor;
  const femaleColor = branding.femaleColor      || DEFAULT_BRANDING.femaleColor;
  const availColor  = branding.availableColor   || DEFAULT_BRANDING.availableColor;
  const fontSizePx  = branding.displayFontSize  || DEFAULT_BRANDING.displayFontSize;

  const genderCardBg = isOccupied
    ? displayGender === "male"
      ? maleColor
      : displayGender === "female"
      ? femaleColor
      : "#6b7280"
    : availColor;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="w-14 h-14 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
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
      {/* ── Always-visible status bar ── */}
      <div className="relative z-20 shrink-0 flex items-center px-6 bg-white border-b border-gray-100" style={{ height: "72px" }}>
        {/* Logo */}
        <div className="shrink-0 w-36 flex items-center">
          <Image
            src={branding.logo || defaultLogo}
            alt="Hospital Logo"
            width={140}
            height={56}
            className="object-contain max-h-14"
          />
        </div>

        {/* — STATUS — */}
        <div className="flex-1 flex items-center gap-4 px-6">
          <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: headerColor }} />
          <span
            className="font-black uppercase tracking-[0.18em] whitespace-nowrap text-2xl"
            style={{ color: headerColor }}
          >
            {isOccupied ? "OCCUPIED" : "AVAILABLE"}
          </span>
          <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: headerColor }} />
        </div>

        {/* Spacer matching logo width */}
        <div className="shrink-0 w-36 flex justify-end">
          {/* intentionally empty — lock button is floating */}
        </div>
      </div>

      {/* ── Slide-in control header (unlocked only) ── */}
      <AnimatePresence>
        {!isLocked && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute top-0 left-0 right-0 z-30 flex items-center gap-6 px-8 py-4 shadow-xl"
            style={{ backgroundColor: headerColor }}
          >
            {/* Occupancy */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Occupancy</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleControlClick(() => setPendingStatus("occupied"))}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                    displayStatus === "occupied"
                      ? "bg-white text-gray-900 border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10"
                  )}
                >
                  Occupied
                </button>
                <button
                  onClick={() => handleControlClick(() => { setPendingStatus("vacant"); setPendingGender(null); })}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                    displayStatus === "vacant"
                      ? "bg-white text-gray-900 border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10"
                  )}
                >
                  Available
                </button>
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Patient Gender</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("male"); })}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                    displayGender === "male"
                      ? "bg-white text-gray-900 border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10",
                    pendingStatus === "vacant" && "opacity-40 pointer-events-none"
                  )}
                >
                  Male
                </button>
                <button
                  onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("female"); })}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                    displayGender === "female"
                      ? "bg-white text-gray-900 border-white"
                      : "bg-transparent text-white border-white hover:bg-white/10",
                    pendingStatus === "vacant" && "opacity-40 pointer-events-none"
                  )}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="flex-1" />

            {/* Save & Close */}
            <Popover open={saveOpen} onOpenChange={setSaveOpen}>
              <PopoverTrigger
                onClick={() => { setSaveOpen(true); resetAutoLock(); }}
                className="px-6 py-2 rounded-full text-sm font-black uppercase cursor-pointer transition-all duration-150 bg-orange-500 text-white border-2 border-orange-400 hover:bg-orange-600 active:scale-95"
              >
                Save &amp; Close
              </PopoverTrigger>
              <PopoverContent className="w-60 p-4" align="end" side="bottom">
                <p className="text-sm font-semibold mb-1">Confirm changes?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Updates room status on all displays in real time.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSaveOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                    {updateStatus.isPending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "Confirm"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main cards ── */}
      <div className="flex-1 flex items-center justify-center gap-6 px-10 relative z-10">
        {/* Room number card */}
        <motion.div
          layout
          className="rounded-[40px] flex flex-col items-center justify-center shadow-lg py-10 px-8"
          style={{ backgroundColor: roomCardBg, width: "42%", minHeight: "55vh" }}
        >
          <p
            className="font-black text-white tracking-tight leading-none"
            style={{ fontSize: `${fontSizePx}px` }}
          >
            {room.roomNumber}
          </p>
          <p className="text-2xl font-bold text-white/60 mt-4 text-center">{room.roomName}</p>
        </motion.div>

        {/* Status / gender card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayStatus}-${displayGender}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-[40px] flex flex-col items-center justify-center shadow-lg py-10 px-8"
            style={{ backgroundColor: genderCardBg, width: "42%", minHeight: "55vh" }}
          >
            <span
              className="text-white leading-none"
              style={{
                fontSize: `${Math.round(fontSizePx * 1.2)}px`,
                lineHeight: 1,
                WebkitTextStroke: "6px white",
                paintOrder: "stroke fill",
              }}
            >
              {isOccupied
                ? displayGender === "male" ? "♂"
                : displayGender === "female" ? "♀"
                : "?"
                : "✓"}
            </span>
            <p className="text-3xl font-black text-white mt-4 capitalize">
              {isOccupied ? (displayGender ?? "Unknown") : "Available"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Promotional banner ── */}
      {branding.bannerEnabled && branding.bannerText && (
        <div className="shrink-0 z-20 overflow-hidden border-t border-white/10" style={{ backgroundColor: headerColor }}>
          <div className="py-2 overflow-hidden whitespace-nowrap">
            <div
              className="inline-flex text-white/80 text-sm font-medium"
              style={{ animation: "marquee-scroll 30s linear infinite" }}
            >
              <span className="pr-24">{branding.bannerText}</span>
              <span className="pr-24" aria-hidden>{branding.bannerText}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Lock / Unlock button (always on top) ── */}
      <button
        onClick={() => (isLocked ? unlock() : lock())}
        className={cn(
          "absolute right-6 z-40 flex items-center justify-center rounded-full w-11 h-11 transition-all duration-200 shadow",
          isLocked
            ? "bg-black/8 hover:bg-black/15 border border-black/10"
            : "bg-white ring-2 ring-gray-200 border border-gray-200 hover:bg-gray-50"
        )}
        style={{ top: "calc(72px / 2)", transform: "translateY(-50%)" }}
        title={isLocked ? "Unlock to edit" : "Lock"}
      >
        {isLocked ? (
          <Lock className="w-4.5 h-4.5 text-black/35" />
        ) : (
          <Unlock className="w-4.5 h-4.5" style={{ color: headerColor }} />
        )}
      </button>
    </div>
  );
}
