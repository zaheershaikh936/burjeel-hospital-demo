"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Lock, Unlock, BedDouble, User } from "lucide-react";
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

  const bgColor     = branding.displayBgColor || "#0f0f1a";
  const headerColor = branding.headerColor    || "#7B2856";
  const roomCardBg  = branding.roomCardColor  || "#1a1a2e";
  const maleColor   = branding.maleColor      || "#1d4ed8";
  const femaleColor = branding.femaleColor    || "#be185d";
  const availColor  = branding.availableColor || "#15803d";

  const genderCardBg = isOccupied
    ? displayGender === "male"
      ? maleColor
      : displayGender === "female"
      ? femaleColor
      : "#374151"
    : availColor;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="w-14 h-14 border-4 border-white/20 border-t-white/70 rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: bgColor }}>
        <BedDouble className="w-16 h-16 text-white/20" />
        <p className="text-3xl font-bold text-white/70">Room Not Found</p>
        <p className="text-white/30 text-sm">ID: {roomId}</p>
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
        className="relative z-20 flex items-center gap-4 px-6 py-3 shrink-0 shadow-lg"
        style={{ backgroundColor: headerColor }}
      >
        {/* Logo + hospital name */}
        <div className="flex items-center gap-3 shrink-0">
          {branding.logo ? (
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
              <Image
                src={branding.logo}
                alt="Hospital Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white/70" />
            </div>
          )}
          <span className="text-white font-semibold text-sm tracking-wide hidden sm:block">
            Burjeel Hospital
          </span>
        </div>

        <div className="w-px h-7 bg-white/20 shrink-0" />

        {/* Occupancy controls */}
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap hidden md:block">
            Occupancy
          </span>
          <button
            onClick={() => handleControlClick(() => setPendingStatus("occupied"))}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-black uppercase border-2 transition-all duration-150",
              displayStatus === "occupied"
                ? "bg-white text-gray-900 border-white shadow-md"
                : "bg-transparent text-white/70 border-white/40 hover:border-white/80 hover:text-white",
              isLocked && "pointer-events-none opacity-40"
            )}
          >
            Occupied
          </button>
          <button
            onClick={() => handleControlClick(() => { setPendingStatus("vacant"); setPendingGender(null); })}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-black uppercase border-2 transition-all duration-150",
              displayStatus === "vacant"
                ? "bg-white text-gray-900 border-white shadow-md"
                : "bg-transparent text-white/70 border-white/40 hover:border-white/80 hover:text-white",
              isLocked && "pointer-events-none opacity-40"
            )}
          >
            Available
          </button>
        </div>

        <div className="w-px h-7 bg-white/20 shrink-0" />

        {/* Gender controls */}
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap hidden md:block">
            Gender
          </span>
          <button
            onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("male"); })}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-black uppercase border-2 transition-all duration-150",
              displayGender === "male"
                ? "bg-white text-gray-900 border-white shadow-md"
                : "bg-transparent text-white/70 border-white/40 hover:border-white/80 hover:text-white",
              (isLocked || pendingStatus === "vacant") && "pointer-events-none opacity-40"
            )}
          >
            Male
          </button>
          <button
            onClick={() => handleControlClick(() => { if (pendingStatus === "occupied") setPendingGender("female"); })}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-black uppercase border-2 transition-all duration-150",
              displayGender === "female"
                ? "bg-white text-gray-900 border-white shadow-md"
                : "bg-transparent text-white/70 border-white/40 hover:border-white/80 hover:text-white",
              (isLocked || pendingStatus === "vacant") && "pointer-events-none opacity-40"
            )}
          >
            Female
          </button>
        </div>

        <div className="flex-1" />

        {/* Save & Close */}
        <Popover open={saveOpen} onOpenChange={setSaveOpen}>
          <PopoverTrigger
            onClick={() => { if (!isLocked) { setSaveOpen(true); resetAutoLock(); } }}
            className={cn(
              "px-5 py-1.5 rounded-full text-[11px] font-black uppercase transition-all duration-150 cursor-pointer",
              "bg-orange-500 text-white border-2 border-orange-400 hover:bg-orange-600 active:scale-95 shadow-md",
              isLocked && "pointer-events-none opacity-40"
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

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center gap-6 px-10 relative z-10">
        {/* Room card */}
        <motion.div
          layout
          className="flex-1 max-w-md rounded-3xl flex flex-col items-center justify-center py-12 px-8 shadow-2xl"
          style={{ backgroundColor: roomCardBg }}
        >
          {/* Small logo inside card */}
          <div className="mb-5">
            {branding.logo ? (
              <Image
                src={branding.logo}
                alt="Logo"
                width={56}
                height={56}
                className="object-contain opacity-60"
              />
            ) : (
              <Building2 className="w-12 h-12 text-white/20" />
            )}
          </div>
          <p className="text-[88px] font-black text-white tracking-tight leading-none">
            {room.roomNumber}
          </p>
          <p className="text-2xl font-bold text-white/60 mt-3 text-center">{room.roomName}</p>
          {room.department && (
            <div className="mt-3 px-4 py-1 rounded-full bg-white/10 border border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-widest">{room.department}</p>
            </div>
          )}
          {room.floor && (
            <p className="text-xs text-white/25 mt-2">Floor {room.floor}{room.building ? ` · ${room.building}` : ""}</p>
          )}
        </motion.div>

        {/* Status / gender card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayStatus}-${displayGender}`}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 max-w-md rounded-3xl flex flex-col items-center justify-center py-12 px-8 shadow-2xl"
            style={{ backgroundColor: genderCardBg }}
          >
            <div className="mb-4">
              {isOccupied ? (
                <User className="w-10 h-10 text-white/40" />
              ) : (
                <BedDouble className="w-10 h-10 text-white/40" />
              )}
            </div>
            <span
              className="text-white font-black leading-none"
              style={{ fontSize: "90px", lineHeight: 1 }}
            >
              {isOccupied
                ? displayGender === "male" ? "♂"
                : displayGender === "female" ? "♀"
                : "?"
                : "✓"}
            </span>
            <p className="text-3xl font-black text-white mt-4 capitalize tracking-tight">
              {isOccupied ? (displayGender ?? "Unknown") : "Available"}
            </p>
            <div className="mt-4 px-4 py-1 rounded-full bg-white/10 border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">
                {isOccupied ? "Occupied" : "Ready for patient"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer clock */}
      <div className="relative z-10 px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {branding.logo ? (
            <Image
              src={branding.logo}
              alt="Logo"
              width={22}
              height={22}
              className="object-contain opacity-40"
            />
          ) : (
            <Building2 className="w-4 h-4 text-white/20" />
          )}
          <span className="text-white/25 text-xs font-medium tracking-wide">Burjeel Hospital</span>
        </div>
        <div className="text-white/35">
          <RoomClock />
        </div>
      </div>

      {/* Promotional banner */}
      {branding.bannerEnabled && branding.bannerText && (
        <div className="shrink-0 z-20 overflow-hidden" style={{ backgroundColor: headerColor }}>
          <div className="py-2 overflow-hidden whitespace-nowrap border-t border-white/10">
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
          "absolute right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
          isLocked
            ? "bg-white/8 hover:bg-white/15 border border-white/10"
            : "bg-white/20 hover:bg-white/30 ring-2 ring-white/30 border border-white/20"
        )}
        title={isLocked ? "Unlock to edit" : "Lock"}
      >
        {isLocked ? (
          <Lock className="w-5 h-5 text-white/40" />
        ) : (
          <Unlock className="w-5 h-5 text-white/90" />
        )}
      </button>
    </div>
  );
}
