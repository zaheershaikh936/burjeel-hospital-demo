"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  BedDouble,
  Filter,
  LayoutGrid,
  LayoutList,
  BedSingle,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GenderBadge } from "@/components/shared/GenderBadge";
import { useRooms, useDeleteRoom, useUpdateRoomStatus } from "@/hooks/useRooms";
import { useAllPresence } from "@/hooks/usePresence";
import { useAuth } from "@/context/AuthContext";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import type { Room } from "@/types";

function getRoomBorderColor(room: Room): string {
  if (room.status === "vacant") return "#82C179";
  return "#ef4444";
}

function DeviceStatusBadge({ online }: { online: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

function RoomTypeBadge({ room, className }: { room: Room; className?: string }) {
  const isScreen2 = room.roomType === "output_screen_2";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold w-fit ${className ?? ""}`}
      style={
        isScreen2
          ? { backgroundColor: "#dbeafe", color: "#1d4ed8" }
          : { backgroundColor: "#fef9c3", color: "#a16207" }
      }
    >
      {isScreen2 ? "Output Screen 2" : "Output Screen 1"}
    </span>
  );
}

export default function RoomsPage() {
  const router = useRouter();
  const { rooms, isLoading } = useRooms();
  const deleteRoom = useDeleteRoom();
  const updateStatus = useUpdateRoomStatus();
  const presence = useAllPresence();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const stats = useMemo(() => ({
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    vacant: rooms.filter((r) => r.status === "vacant").length,
    male: rooms.filter((r) => r.gender === "male").length,
    female: rooms.filter((r) => r.gender === "female").length,
  }), [rooms]);

  const STAT_CARDS = [
    { title: "Total Rooms", value: stats.total, icon: BedDouble, color: "bg-slate-500" },
    { title: "Occupied", value: stats.occupied, icon: UserCheck, color: "bg-red-500" },
    { title: "Vacant", value: stats.vacant, icon: UserX, color: "bg-green-500" },
    { title: "Male Patients", value: stats.male, icon: Users, color: "bg-blue-500" },
    { title: "Female Patients", value: stats.female, icon: BedSingle, color: "bg-pink-500" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const filtered = rooms.filter((r) => {
    const matchSearch =
      !search ||
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.roomName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchGender =
      genderFilter === "all" ||
      (genderFilter === "none" ? !r.gender : r.gender === genderFilter);
    const matchRoomType =
      roomTypeFilter === "all" ||
      (roomTypeFilter === "output_screen_1"
        ? !r.roomType || r.roomType === "output_screen_1"
        : r.roomType === roomTypeFilter);
    return matchSearch && matchStatus && matchGender && matchRoomType;
  });

  function copyDisplayUrl(room: Room) {
    navigator.clipboard.writeText(`${window.location.origin}${room.displayUrl}`);
    toast.success("Display URL copied!");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRoom.mutateAsync(deleteTarget.id);
      toast.success("Room deleted");
    } catch {
      toast.error("Failed to delete room");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stat cards — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
            : STAT_CARDS.map((card, i) => <StatCard key={card.title} {...card} index={i} />)}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap flex-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Search</span>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Status</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-36">
                <Filter className="w-3 h-3 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Gender</span>
            <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v ?? "all")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="none">No Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium">Output Screen</span>
            <Select value={roomTypeFilter} onValueChange={(v) => setRoomTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="output_screen_1">Output Screen 1</SelectItem>
                <SelectItem value="output_screen_2">Output Screen 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "hover:bg-muted"}`}
              title="List view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 transition-colors ${viewMode === "card" ? "bg-foreground text-background" : "hover:bg-muted"}`}
              title="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href="/rooms/add">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Count + active filter labels */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${filtered.length} room${filtered.length !== 1 ? "s" : ""} found`}
        </p>
        {statusFilter !== "all" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
            Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            <button onClick={() => setStatusFilter("all")} className="hover:text-destructive ml-0.5">×</button>
          </span>
        )}
        {genderFilter !== "all" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
            Gender: {genderFilter === "none" ? "No Gender" : genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}
            <button onClick={() => setGenderFilter("all")} className="hover:text-destructive ml-0.5">×</button>
          </span>
        )}
        {roomTypeFilter !== "all" && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={
              roomTypeFilter === "operation"
                ? { backgroundColor: "#dbeafe", color: "#1d4ed8" }
                : { backgroundColor: "#dcfce7", color: "#15803d" }
            }
          >
            {roomTypeFilter === "operation" ? "Operation" : "Day Care"}
            <button onClick={() => setRoomTypeFilter("all")} className="hover:opacity-60 ml-0.5">×</button>
          </span>
        )}
        {search && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
            Search: &quot;{search}&quot;
            <button onClick={() => setSearch("")} className="hover:text-destructive ml-0.5">×</button>
          </span>
        )}
      </div>

      {/* ── Card view ── */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-14">
              <BedDouble className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No rooms found</p>
            </div>
          ) : (
            filtered.map((room, i) => {
              const borderColor = getRoomBorderColor(room);
              const isVacant = room.status === "vacant";
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-3 flex flex-col gap-2 min-h-44"
                  style={{ border: `2px solid ${borderColor}` }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <DeviceStatusBadge online={!!presence[room.id]?.online} />
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: borderColor }} />
                      <button
                        onClick={() => copyDisplayUrl(room)}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => router.push(`/rooms/edit/${room.id}`)}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(room)}
                        className="p-0.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Room name */}
                  <p className="font-black text-sm uppercase leading-tight tracking-wide text-foreground">
                    {room.roomName} · {room.roomNumber}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-col gap-1.5">
                    <RoomTypeBadge room={room} className="text-sm" />
                    <div className="flex items-center gap-1">
                      <button
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({
                          room,
                          status: room.status === "occupied" ? "vacant" : "occupied",
                          gender: room.status === "occupied" ? null : (room.gender ?? "female"),
                          source: "admin",
                        })}
                        className="inline-flex disabled:opacity-50"
                      >
                        <StatusBadge status={room.status} className="text-sm cursor-pointer hover:opacity-80 transition-opacity" />
                      </button>
                      {room.status === "occupied" && (
                        <button
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({
                            room,
                            status: "occupied",
                            gender: room.gender === "male" ? "female" : "male",
                            source: "admin",
                          })}
                          className="inline-flex disabled:opacity-50"
                        >
                          <GenderBadge gender={room.gender} className="text-sm cursor-pointer hover:opacity-80 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => window.open(room.displayUrl, "_blank")}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: isVacant ? "#82C179" : "#ef4444" }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* ── List view ── */
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0 pt-0 px-0" />
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-4">Room #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead>Output Screen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                          <TableCell colSpan={8} className="text-center py-14">
                        <BedDouble className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No rooms found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((room, i) => (
                      <motion.tr
                        key={room.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-4 font-mono font-semibold text-sm text-foreground">
                          {room.roomNumber}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{room.roomName}</TableCell>
                        <TableCell className="hidden md:table-cell font-medium text-foreground">
                          {room.department}
                        </TableCell>
                        <TableCell>
                          <RoomTypeBadge room={room} />
                        </TableCell>
                        <TableCell>
                          <button
                            className="inline-flex disabled:opacity-50"
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({
                              room,
                              status: room.status === "occupied" ? "vacant" : "occupied",
                              gender: room.status === "occupied" ? null : (room.gender ?? "female"),
                              source: "admin",
                            })}
                          >
                            <StatusBadge status={room.status} className="cursor-pointer hover:opacity-80 transition-opacity" />
                          </button>
                        </TableCell>
                        <TableCell>
                          {room.status === "occupied" ? (
                            <button
                              className="inline-flex disabled:opacity-50"
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({
                                room,
                                status: "occupied",
                                gender: room.gender === "male" ? "female" : "male",
                                source: "admin",
                              })}
                            >
                              <GenderBadge gender={room.gender} className="cursor-pointer hover:opacity-80 transition-opacity" />
                            </button>
                          ) : (
                            <GenderBadge gender={room.gender} />
                          )}
                        </TableCell>
                        <TableCell>
                          <DeviceStatusBadge online={!!presence[room.id]?.online} />
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => copyDisplayUrl(room)}
                              title="Copy display URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => window.open(room.displayUrl, "_blank")}
                              title="Open display"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => router.push(`/rooms/edit/${room.id}`)}
                              title="Edit room"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(room)}
                              title="Delete room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete room{" "}
              <strong>
                {deleteTarget?.roomNumber} — {deleteTarget?.roomName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
