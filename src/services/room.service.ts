import {
  ref,
  set,
  update,
  remove,
  get,
  onValue,
  query,
  orderByChild,
  type Unsubscribe,
} from "firebase/database";
import { database } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/constants";
import { generateDisplayUrl } from "@/utils";
import type { Room, RoomFormData, RoomStatus, PatientGender } from "@/types";

// Rooms are keyed by roomNumber: rooms/{roomNumber}
function roomRef(roomNumber: string) {
  return ref(database, `${COLLECTIONS.ROOMS}/${roomNumber}`);
}

function parseRoom(key: string, val: Record<string, unknown>): Room {
  return {
    id: key,
    roomNumber: (val.roomNumber as string) ?? key,
    roomName: (val.roomName as string) ?? "",
    department: (val.department as string) ?? "",
    floor: (val.floor as string) ?? "",
    building: (val.building as string) ?? "",
    status: (val.status as RoomStatus) ?? "vacant",
    gender: (val.gender as PatientGender) ?? null,
    displayUrl: (val.displayUrl as string) ?? generateDisplayUrl(key),
    createdAt: (val.createdAt as number) ?? 0,
    updatedAt: (val.updatedAt as number) ?? 0,
  };
}

export const roomService = {
  async getAll(): Promise<Room[]> {
    const q = query(ref(database, COLLECTIONS.ROOMS), orderByChild("createdAt"));
    const snap = await get(q);
    if (!snap.exists()) return [];
    const rooms: Room[] = [];
    snap.forEach((child) => {
      if (child.key) rooms.push(parseRoom(child.key, child.val()));
    });
    return rooms.reverse();
  },

  async getById(id: string): Promise<Room | null> {
    const snap = await get(roomRef(id));
    if (!snap.exists()) return null;
    return parseRoom(id, snap.val());
  },

  async create(data: RoomFormData): Promise<string> {
    const now = Date.now();
    const displayUrl = generateDisplayUrl(data.roomNumber);
    await set(roomRef(data.roomNumber), {
      ...data,
      gender: data.gender ?? null,
      displayUrl,
      createdAt: now,
      updatedAt: now,
    });
    return data.roomNumber;
  },

  async update(id: string, data: Partial<RoomFormData>): Promise<void> {
    await update(roomRef(id), {
      ...data,
      gender: data.gender ?? null,
      updatedAt: Date.now(),
    });
  },

  async updateStatus(id: string, status: RoomStatus, gender: PatientGender): Promise<void> {
    await update(roomRef(id), {
      status,
      gender: status === "vacant" ? null : gender,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await remove(roomRef(id));
  },

  subscribe(
    callback: (rooms: Room[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const q = query(ref(database, COLLECTIONS.ROOMS), orderByChild("createdAt"));
    return onValue(
      q,
      (snap) => {
        const rooms: Room[] = [];
        snap.forEach((child) => {
          if (child.key) rooms.push(parseRoom(child.key, child.val()));
        });
        callback(rooms.reverse());
      },
      (err) => {
        console.error("[roomService] subscribe error:", err.message);
        onError?.(err);
        callback([]);
      }
    );
  },

  subscribeToRoom(
    id: string,
    callback: (room: Room | null) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    return onValue(
      roomRef(id),
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        callback(parseRoom(id, snap.val()));
      },
      (err) => {
        console.error("[roomService] subscribeToRoom error:", err.message);
        onError?.(err);
        callback(null);
      }
    );
  },
};
