"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RoomClock } from "@/components/display/RoomClock";
import { useRoom, useUpdateRoomStatus } from "@/hooks/useRooms";
import { useBranding } from "@/hooks/useBranding";
import { AUTO_LOCK_TIMEOUT_MS } from "@/constants";
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

  const bgColor     = branding.displayBgColor || "#ffffff";
  const headerColor = branding.headerColor    || "#7B2856";
  const roomCardBg  = branding.roomCardColor  || "#000000";
  const maleColor   = branding.maleColor      || "#4169E1";
  const femaleColor = branding.femaleColor    || "#be185d";
  const availColor  = branding.availableColor || "#15803d";

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
      className="h-screen w-screen flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div
        className="relative z-20 flex items-center gap-6 px-8 py-4 shrink-0"
        style={{ backgroundColor: headerColor }}
      >
        {/* Occupancy */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
            Occupancy
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleControlClick(() => setPendingStatus("occupied"))}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                displayStatus === "occupied"
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/10",
                isLocked && "pointer-events-none opacity-60"
              )}
            >
              Occupied
            </button>
            <button
              onClick={() => handleControlClick(() => { setPendingStatus("vacant"); setPendingGender(null); })}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                displayStatus === "vacant"
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/10",
                isLocked && "pointer-events-none opacity-60"
              )}
            >
              Available
            </button>
          </div>
        </div>

        {/* Gender */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
            Patient Gender
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("male"); })}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                displayGender === "male"
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/10",
                (isLocked || pendingStatus === "vacant") && "pointer-events-none opacity-60"
              )}
            >
              Male
            </button>
            <button
              onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("female"); })}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-black uppercase border-2 transition-all duration-150",
                displayGender === "female"
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/10",
                (isLocked || pendingStatus === "vacant") && "pointer-events-none opacity-60"
              )}
            >
              Female
            </button>
          </div>
        </div>

        <div className="flex-1" />

        {/* Save & Close */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-transparent text-xs font-semibold uppercase tracking-widest select-none">
            &nbsp;
          </span>
          <Popover open={saveOpen} onOpenChange={setSaveOpen}>
            <PopoverTrigger
              onClick={() => { if (!isLocked) { setSaveOpen(true); resetAutoLock(); } }}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-black uppercase cursor-pointer transition-all duration-150",
                "bg-orange-500 text-white border-2 border-orange-400 hover:bg-orange-600 active:scale-95",
                isLocked && "pointer-events-none opacity-60"
              )}
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
        </div>
      </div>

      {/* Main cards */}
      <div className="flex-1 flex items-stretch gap-4 p-6 relative z-10">
        {/* Room number card */}
        <motion.div
          layout
          className="flex-1 rounded-3xl flex flex-col items-center justify-center shadow-lg"
          style={{ backgroundColor: roomCardBg }}
        >
          <p className="text-[110px] font-black text-white tracking-tight leading-none">
            {room.roomNumber}
          </p>
          <p className="text-3xl font-bold text-white mt-4">{room.roomName}</p>
        </motion.div>

        {/* Status / gender card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayStatus}-${displayGender}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-3xl flex flex-col items-center justify-center shadow-lg"
            style={{ backgroundColor: genderCardBg }}
          >
            <span
              className="text-white font-bold leading-none"
              style={{ fontSize: "130px", lineHeight: 1 }}
            >
              {isOccupied
                ? displayGender === "male" ? "♂"
                : displayGender === "female" ? "♀"
                : "?"
                : "✓"}
            </span>
            <p className="text-4xl font-black text-white mt-4 capitalize">
              {isOccupied ? (displayGender ?? "Unknown") : "Available"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer clock */}
      <div className="relative z-10 px-8 pb-3 flex justify-end shrink-0">
        <div className="text-gray-400 opacity-60">
          <RoomClock />
        </div>
      </div>

      {/* Promotional banner */}
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

      {/* Lock / Unlock button */}
      <button
        onClick={() => (isLocked ? unlock() : lock())}
        className={cn(
          "absolute right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md",
          isLocked
            ? "bg-black/10 hover:bg-black/20 border border-black/10"
            : "bg-black/20 hover:bg-black/30 ring-2 ring-black/20 border border-black/15"
        )}
        title={isLocked ? "Unlock to edit" : "Lock"}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-black/40" />
        ) : (
          <Unlock className="w-5 h-5 text-black/70" />
        )}
      </button>
    </div>
  );
}
