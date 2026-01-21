"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoViewerModalProps {
  src: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoViewerModal({ src, isOpen, onOpenChange }: VideoViewerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpen) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => undefined);
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isOpen]);

  if (!src) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none h-screen w-screen p-0 m-0 bg-black border-none flex items-center justify-center"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
          className="absolute z-[100] rounded-full bg-black/70 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-95 border border-white/20"
          style={{
            top: "max(1rem, env(safe-area-inset-top, 0px))",
            right: "1rem",
          }}
          aria-label="닫기"
        >
          <X className="h-6 w-6" />
        </button>
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full"
          controls
          playsInline
          preload="metadata"
        />
      </DialogContent>
    </Dialog>
  );
}

