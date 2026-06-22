"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CORRECT_PATTERN = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface PatternLockProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DOT_POSITIONS = [
  [0, 0], [1, 0], [2, 0],
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
];

export function PatternLock({ onSuccess, onCancel }: PatternLockProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  function selectDot(index: number) {
    if (selected.includes(index + 1)) return;
    const next = [...selected, index + 1];
    setSelected(next);
    setError(false);

    if (next.length === CORRECT_PATTERN.length) {
      const isCorrect = next.every((v, i) => v === CORRECT_PATTERN[i]);
      if (isCorrect) {
        setTimeout(onSuccess, 300);
      } else {
        setError(true);
        setAttempts((a) => a + 1);
        setTimeout(() => {
          setSelected([]);
          setError(false);
        }, 800);
      }
    }
  }

  function reset() {
    setSelected([]);
    setError(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-8 w-80 shadow-2xl"
    >
      <h3 className="text-center font-bold text-lg text-foreground mb-1">Enter Pattern</h3>
      <p className="text-center text-sm text-muted-foreground mb-6">
        {error
          ? "Incorrect pattern. Try again."
          : selected.length === 0
          ? "Draw the unlock pattern"
          : `${selected.length} / ${CORRECT_PATTERN.length} dots`}
      </p>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {DOT_POSITIONS.map((_, i) => {
          const dotNum = i + 1;
          const isSelected = selected.includes(dotNum);
          const selIndex = selected.indexOf(dotNum);
          return (
            <button
              key={i}
              onClick={() => selectDot(i)}
              className="flex items-center justify-center w-full aspect-square"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all duration-150 flex items-center justify-center font-bold text-sm",
                  isSelected && !error
                    ? "bg-sky-500 border-sky-500 text-white shadow-lg scale-110"
                    : isSelected && error
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-border bg-muted hover:border-sky-400 hover:bg-sky-50"
                )}
              >
                {isSelected && <span>{selIndex + 1}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {attempts > 0 && (
        <p className="text-center text-xs text-muted-foreground mb-3">
          {3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={reset}
          className="flex-1 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
