import { ref, get, set, onValue, type Unsubscribe } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from "@/lib/firebase/config";
import { COLLECTIONS, BRANDING_DOC_ID } from "@/constants";
import type { Branding } from "@/types";

export const DEFAULT_BRANDING: Branding = {
  logo: "",
  primaryColor: "#0ea5e9",
  secondaryColor: "#0284c7",
  displayBgColor: "#ffffff",
  headerColor: "#96163C",
  roomCardColor: "#000000",
  maleColor: "#4169E1",
  femaleColor: "#be185d",
  availableColor: "#15803d",
  displayFontSize: 110,
  bannerEnabled: true,
  bannerText:
    "Welcome to Burjeel Hospital  ·  Your health is our priority  ·  Please maintain silence  ·  Thank you for choosing us",
};

function brandingDbRef() {
  return ref(database, `${COLLECTIONS.BRANDING}/${BRANDING_DOC_ID}`);
}

export const brandingService = {
  async get(): Promise<Branding> {
    const snap = await get(brandingDbRef());
    if (!snap.exists()) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...snap.val() } as Branding;
  },

  async update(data: Partial<Branding>): Promise<void> {
    const existing = await brandingService.get();
    await set(brandingDbRef(), { ...existing, ...data });
  },

  async uploadLogo(file: File): Promise<string> {
    const fileRef = storageRef(storage, `branding/logo-${Date.now()}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  subscribe(
    callback: (branding: Branding) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    return onValue(
      brandingDbRef(),
      (snap) => {
        if (!snap.exists()) {
          callback(DEFAULT_BRANDING);
          return;
        }
        callback({ ...DEFAULT_BRANDING, ...snap.val() } as Branding);
      },
      (err) => {
        console.error("[brandingService] subscribe error:", err.message);
        onError?.(err);
        callback(DEFAULT_BRANDING);
      }
    );
  },
};
