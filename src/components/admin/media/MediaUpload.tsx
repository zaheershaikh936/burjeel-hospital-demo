"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
}

interface MediaUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

interface FileEntry {
  status: "uploading" | "done" | "error";
  percent: number;
}

function uploadFile(
  file: File,
  onProgress: (pct: number) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        // Cap at 90 % — the remaining 10 % is server-to-Firebase time
        onProgress(Math.min(Math.round((e.loaded / e.total) * 90), 90));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onProgress(100);
          resolve(JSON.parse(xhr.responseText) as UploadedFile);
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error ?? "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", "/api/media/upload");
    xhr.send(form);
  });
}

export function MediaUpload({ onUpload, disabled }: MediaUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Record<string, FileEntry>>({});

  const isUploading = Object.values(files).some((f) => f.status === "uploading");

  const setEntry = useCallback(
    (name: string, patch: Partial<FileEntry>) =>
      setFiles((prev) => ({
        ...prev,
        [name]: { ...(prev[name] ?? { status: "uploading", percent: 0 }), ...patch },
      })),
    []
  );

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const valid = Array.from(fileList).filter((f) => {
        if (!ACCEPTED_MIME.has(f.type)) {
          toast.error(`"${f.name}" is not supported. Use JPG, PNG, WebP, or MP4.`);
          return false;
        }
        return true;
      });

      if (!valid.length) return;

      const initial: Record<string, FileEntry> = {};
      valid.forEach((f) => (initial[f.name] = { status: "uploading", percent: 0 }));
      setFiles(initial);

      const results: UploadedFile[] = [];

      await Promise.all(
        valid.map(async (file) => {
          try {
            const result = await uploadFile(file, (pct) =>
              setEntry(file.name, { percent: pct })
            );
            results.push(result);
            setEntry(file.name, { status: "done", percent: 100 });
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed";
            toast.error(`"${file.name}": ${msg}`);
            setEntry(file.name, { status: "error", percent: 0 });
          }
        })
      );

      if (results.length) onUpload(results);

      setTimeout(() => setFiles({}), 2500);
    },
    [onUpload, setEntry]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, isUploading, processFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const entries = Object.entries(files);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/40 bg-muted/20",
        (disabled || isUploading) && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && !isUploading && fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.mp4"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">
            Images: JPG, PNG, WebP &nbsp;·&nbsp; Videos: MP4 &nbsp;·&nbsp; Multiple files supported
          </p>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="mt-5 space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
          {entries.map(([name, entry]) => (
            <div key={name} className="px-3 py-2 rounded-lg bg-background space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                {entry.status === "uploading" && (
                  <div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin shrink-0" />
                )}
                {entry.status === "done" && (
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                )}
                {entry.status === "error" && (
                  <X className="w-3 h-3 text-destructive shrink-0" />
                )}
                <span className="truncate text-muted-foreground flex-1">{name}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {entry.status === "uploading" && `${entry.percent}%`}
                  {entry.status === "done" && "Done"}
                  {entry.status === "error" && "Failed"}
                </span>
              </div>
              {entry.status === "uploading" && (
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${entry.percent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
