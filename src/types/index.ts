export type UserRole = "super_admin" | "admin" | "marketing";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
}

export type RoomStatus = "occupied" | "vacant";
export type PatientGender = "male" | "female" | null;
export type AuditSource = "admin" | "tablet";
export type RoomType = "output_screen_1" | "output_screen_2";

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  department: string;
  floor?: string;
  building?: string;
  status: RoomStatus;
  gender: PatientGender;
  roomType?: RoomType;
  displayUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoomFormData {
  roomNumber: string;
  roomName: string;
  department?: string;
  floor?: string;
  building?: string;
  status: RoomStatus;
  gender: PatientGender;
  roomType?: RoomType;
}

export interface Branding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  // Display screen colors
  displayBgColor: string;
  headerColor: string;
  roomCardColor: string;
  cardTextColor: string;
  maleColor: string;
  femaleColor: string;
  availableColor: string;
  // Display typography
  displayFontSize: number;
  genderIconSize: number;
  // Promotional banner
  bannerEnabled: boolean;
  bannerText: string;
}

export interface AuditLog {
  id: string;
  roomId: string;
  roomNumber?: string;
  roomName?: string;
  previousStatus: RoomStatus | null;
  newStatus: RoomStatus | null;
  previousGender: PatientGender;
  newGender: PatientGender;
  source: AuditSource;
  timestamp: number;
}

export interface DashboardStats {
  total: number;
  occupied: number;
  vacant: number;
  male: number;
  female: number;
}

export type MediaType = "image" | "video";
export type TransitionEffect = "none" | "fade" | "slide";

export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  createdAt: number;
}

export interface PlaylistItem {
  id: string;
  type: MediaType;
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  order: number;
  imageDuration?: number;
  playbackSpeed?: number;
  transition?: TransitionEffect;
  createdAt: number;
  updatedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  roomIds: string[];
  roomDisplayDuration: number; // seconds to show room UI before/after playlist
  createdAt: number;
  updatedAt: number;
  items: PlaylistItem[];
}
