import { ref, set, onValue, onDisconnect, serverTimestamp, type Unsubscribe } from "firebase/database";
import { database } from "@/lib/firebase/config";

export interface PresenceData {
  online: boolean;
  lastSeen: number;
}

function presenceRef(roomId: string) {
  return ref(database, `presence/${roomId}`);
}

export const presenceService = {
  async register(roomId: string): Promise<() => Promise<void>> {
    const r = presenceRef(roomId);
    await onDisconnect(r).set({ online: false, lastSeen: serverTimestamp() });
    await set(r, { online: true, lastSeen: serverTimestamp() });
    return async () => {
      await onDisconnect(r).cancel();
      await set(r, { online: false, lastSeen: serverTimestamp() });
    };
  },

  subscribeAll(callback: (data: Record<string, PresenceData>) => void): Unsubscribe {
    return onValue(ref(database, "presence"), (snap) => {
      if (!snap.exists()) { callback({}); return; }
      const result: Record<string, PresenceData> = {};
      snap.forEach((child) => {
        if (child.key) result[child.key] = child.val() as PresenceData;
      });
      callback(result);
    });
  },
};
