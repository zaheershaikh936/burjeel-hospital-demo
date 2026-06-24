import type { UserRole, AppUser } from "@/types";

const USERS: Array<{ email: string; password: string; role: UserRole }> = [
  { email: "superadmin@aim4it.ae", password: "password", role: "super_admin" },
  { email: "admin@aim4it.ae",      password: "Password", role: "admin" },
];

const STORAGE_KEY = "burjeel_user";

export function signIn(email: string, password: string): AppUser | null {
  const match = USERS.find(
    (u) => u.email === email.toLowerCase().trim() && u.password === password
  );
  if (!match) return null;
  const user: AppUser = { uid: match.email, email: match.email, role: match.role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}
