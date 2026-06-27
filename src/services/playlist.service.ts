import {
  ref,
  push,
  set,
  remove,
  onValue,
  get,
  type Unsubscribe,
} from "firebase/database";
import { database } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/constants";
import type { PlaylistItem } from "@/types";

function playlistRef() {
  return ref(database, COLLECTIONS.PLAYLIST);
}

function itemRef(id: string) {
  return ref(database, `${COLLECTIONS.PLAYLIST}/${id}`);
}

function orderFieldRef(id: string) {
  return ref(database, `${COLLECTIONS.PLAYLIST}/${id}/order`);
}

export const playlistService = {
  async getAll(): Promise<PlaylistItem[]> {
    const snap = await get(playlistRef());
    if (!snap.exists()) return [];
    const items: PlaylistItem[] = [];
    snap.forEach((child) => {
      items.push({ id: child.key!, ...child.val() } as PlaylistItem);
    });
    return items.sort((a, b) => a.order - b.order);
  },

  async add(item: Omit<PlaylistItem, "id">): Promise<string> {
    const newRef = push(playlistRef());
    await set(newRef, item);
    return newRef.key!;
  },

  async update(id: string, data: Partial<Omit<PlaylistItem, "id">>): Promise<void> {
    const snap = await get(itemRef(id));
    if (!snap.exists()) throw new Error("Playlist item not found");
    await set(itemRef(id), { ...snap.val(), ...data, updatedAt: Date.now() });
  },

  async delete(id: string): Promise<void> {
    await remove(itemRef(id));
  },

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      items.map(({ id, order }) => set(orderFieldRef(id), order))
    );
  },

  async replace(items: Omit<PlaylistItem, "id">[]): Promise<void> {
    if (items.length === 0) {
      await remove(playlistRef());
      return;
    }
    const data: Record<string, Omit<PlaylistItem, "id">> = {};
    items.forEach((item) => {
      const key = push(playlistRef()).key!;
      data[key] = item;
    });
    await set(playlistRef(), data);
  },

  subscribe(callback: (items: PlaylistItem[]) => void): Unsubscribe {
    return onValue(playlistRef(), (snap) => {
      if (!snap.exists()) {
        callback([]);
        return;
      }
      const items: PlaylistItem[] = [];
      snap.forEach((child) => {
        items.push({ id: child.key!, ...child.val() } as PlaylistItem);
      });
      callback(items.sort((a, b) => a.order - b.order));
    });
  },
};
