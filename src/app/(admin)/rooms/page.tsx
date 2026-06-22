"use client";

import { useState } from "react";
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
import { useRooms, useDeleteRoom } from "@/hooks/useRooms";
import type { Room } from "@/types";

function getRoomBorderColor(room: Room): string {
  if (room.status === "vacant") return "#82C179";
  return "#ef4444";
}

export default function RoomsPage() {
  const router = useRouter();
  const { rooms, isLoading } = useRooms();
  const deleteRoom = useDeleteRoom();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
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
    return matchSearch && matchStatus && matchGender;
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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <Filter className="w-3 h-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="vacant">Vacant</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="none">No Gender</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : `${filtered.length} room${filtered.length !== 1 ? "s" : ""} found`}
      </p>

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
                  className="bg-white rounded-xl p-3 flex flex-col gap-2"
                  style={{ border: `2px solid ${borderColor}` }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {room.floor ? `Floor ${room.floor}` : room.department}
                    </span>
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
                  <div className="flex items-center gap-1 flex-wrap">
                    <StatusBadge status={room.status} />
                    <GenderBadge gender={room.gender} />
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => window.open(room.displayUrl, "_blank")}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
                    <TableHead className="hidden lg:table-cell">Floor</TableHead>
                    <TableHead className="hidden lg:table-cell">Building</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gender</TableHead>
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
                        <TableCell className="hidden md:table-cell text-foreground text-sm">
                          {room.department}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-foreground text-sm">
                          {room.floor}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-foreground text-sm">
                          {room.building}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={room.status} />
                        </TableCell>
                        <TableCell>
                          <GenderBadge gender={room.gender} />
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
