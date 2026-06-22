export type UserRole = "super_admin" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
}

export type RoomStatus = "occupied" | "vacant";
export type PatientGender = "male" | "female" | null;
export type AuditSource = "admin" | "tablet";

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  department: string;
  floor: string;
  building: string;
  status: RoomStatus;
  gender: PatientGender;
  displayUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface RoomFormData {
  roomNumber: string;
  roomName: string;
  department: string;
  floor: string;
  building: string;
  status: RoomStatus;
  gender: PatientGender;
}

export interface Branding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  // Display screen colors
  displayBgColor: string;
  headerColor: string;
  roomCardColor: string;
  maleColor: string;
  femaleColor: string;
  availableColor: string;
  // Display typography
  displayFontSize: number;
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
