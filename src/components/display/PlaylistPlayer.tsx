"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PlaylistItem, TransitionEffect } from "@/types";

function getVariants(transition: TransitionEffect) {
  if (transition === "slide") {
    return {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "-100%", opacity: 0 },
      duration: 0.5,
    };
  }
  if (transition === "fade") {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      duration: 0.5,
    };
  }
  return {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    duration: 0,
  };
}

// ── MediaSlide ────────────────────────────────────────────────────────────────

interface MediaSlideProps {
  item: PlaylistItem;
  onEnded: () => void;
}

function MediaSlide({ item, onEnded }: MediaSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable reference so image timer and video handler always call the latest advance
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; });

  // Image: fire after imageDuration seconds
  useEffect(() => {
    if (item.type !== "image") return;
    timerRef.current = setTimeout(
      () => onEndedRef.current(),
      (item.imageDuration ?? 5) * 1000
    );
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [item]);   // re-run only when the slide itself changes

  // Video: set playback rate and autoplay
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = item.playbackSpeed ?? 1;
    el.play().catch(() => {});
  }, [item]);

  const { initial, animate, exit, duration } = getVariants(item.transition ?? "fade");

  return (
    <motion.div
      className="absolute inset-0"
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{ duration }}
    >
      {item.type === "image" ? (
        <Image
          src={item.url}
          alt={item.fileName}
          fill
          className="object-cover"
          unoptimized
          priority
        />
      ) : (
        <video
          ref={videoRef}
          src={item.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          loop={false}
          controls={false}
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onEnded={() => onEndedRef.current()}
          style={{ pointerEvents: "none" }}
        />
      )}
    </motion.div>
  );
}

// ── PlaylistPlayer ────────────────────────────────────────────────────────────

interface PlaylistPlayerProps {
  items: PlaylistItem[];
  onCycleComplete?: () => void;
}

export function PlaylistPlayer({ items, onCycleComplete }: PlaylistPlayerProps) {
  const [index, setIndex] = useState(0);

  // completedCycles increments every time all items have played once.
  // Using a dedicated counter (instead of watching index wrap to 0) means
  // single-item playlists also trigger the callback — setIndex(0→0) is a no-op
  // that React skips, so a useEffect([index]) would never re-fire.
  const [completedCycles, setCompletedCycles] = useState(0);

  // Always keep the latest callback without adding it to effect deps
  const onCycleCompleteRef = useRef(onCycleComplete);
  useEffect(() => { onCycleCompleteRef.current = onCycleComplete; });

  // Reset state when the playlist is swapped out
  useEffect(() => {
    setIndex(0);
    setCompletedCycles(0);
  }, [items.length]);

  // Notify parent whenever a full cycle finishes (skip the initial 0 value)
  useEffect(() => {
    if (completedCycles === 0) return;
    onCycleCompleteRef.current?.();
  }, [completedCycles]);

  const advance = useCallback(() => {
    const nextIdx = (index + 1) % items.length;
    setIndex(nextIdx);
    if (nextIdx === 0) {
      // Cycle complete — always fires, even for a single-item playlist where
      // nextIdx === 0 === current index (React would bail on setIndex alone)
      setCompletedCycles((c) => c + 1);
    }
  }, [index, items.length]);

  if (!items.length) return null;

  const current = items[index % items.length];

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <MediaSlide
          key={`${current.id}-${index}`}
          item={current}
          onEnded={advance}
        />
      </AnimatePresence>
    </div>
  );
}
