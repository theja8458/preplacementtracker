"use client";

/**
 * SaveStatus
 *
 * Tiny inline status indicator for debounced autosave fields.
 * Replaces per-keystroke toast spam with a quiet, contextual signal.
 *
 * States:
 *  - "idle"    — nothing shown
 *  - "saving"  — animated dot + "Saving..."
 *  - "saved"   — checkmark + "Saved ✓" (fades out after 2s)
 *  - "error"   — "Failed to save" in rose
 */
export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;

  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] text-[#64748B] font-medium">
        <span
          className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"
          aria-hidden="true"
        />
        Saving...
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium animate-fade-in">
        <span aria-hidden="true">✓</span>
        Saved
      </span>
    );
  }

  // error
  return (
    <span className="text-[10px] text-rose-400 font-medium">
      Failed to save
    </span>
  );
}
