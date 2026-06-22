"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Room, RoomStatus, PatientGender } from "@/types";

interface SettingsPanelProps {
  room: Room;
  onSave: (status: RoomStatus, gender: PatientGender) => Promise<void>;
  onClose: () => void;
}

export function SettingsPanel({ room, onSave, onClose }: SettingsPanelProps) {
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [gender, setGender] = useState<PatientGender>(room.gender);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(status, gender);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 w-80 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-foreground">Room Settings</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-5 p-3 bg-muted/40 rounded-xl">
        <BedDouble className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">Room {room.roomNumber}</p>
          <p className="text-xs text-muted-foreground">{room.roomName}</p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Occupancy Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setStatus("occupied");
            }}
            className={cn(
              "py-3 rounded-xl font-semibold text-sm transition-all border-2",
              status === "occupied"
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-border bg-muted/30 text-muted-foreground hover:border-red-200"
            )}
          >
            Occupied
          </button>
          <button
            onClick={() => {
              setStatus("vacant");
              setGender(null);
            }}
            className={cn(
              "py-3 rounded-xl font-semibold text-sm transition-all border-2",
              status === "vacant"
                ? "border-green-500 bg-green-50 text-green-600"
                : "border-border bg-muted/30 text-muted-foreground hover:border-green-200"
            )}
          >
            Vacant
          </button>
        </div>
      </div>

      {/* Gender — only when occupied */}
      {status === "occupied" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 overflow-hidden"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Patient Gender
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGender("male")}
              className={cn(
                "py-3 rounded-xl font-semibold text-sm transition-all border-2",
                gender === "male"
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-blue-200"
              )}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={cn(
                "py-3 rounded-xl font-semibold text-sm transition-all border-2",
                gender === "female"
                  ? "border-pink-500 bg-pink-50 text-pink-600"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-pink-200"
              )}
            >
              Female
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || (status === "occupied" && !gender)}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" /> Save & Close
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
