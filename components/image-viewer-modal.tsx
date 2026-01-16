"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageViewerModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewerModal({
  images,
  initialIndex = 0,
  isOpen,
  onOpenChange,
}: ImageViewerModalProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api && isOpen) {
      api.scrollTo(initialIndex, true);
    }
  }, [api, isOpen, initialIndex]);

  const handlePrevious = () => api?.scrollPrev();
  const handleNext = () => api?.scrollNext();

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-none h-screen w-screen p-0 m-0 bg-black border-none flex items-center justify-center"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 z-[100] rounded-full bg-black/70 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-95 border border-white/20"
          aria-label="닫기"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 카운터 */}
        {count > 1 && (
          <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            {current + 1} / {count}
          </div>
        )}

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          className="w-full h-full"
          opts={{
            align: "center",
            loop: false,
          }}
        >
          <CarouselContent className="h-full items-center -ml-0">
            {images.map((imageUrl, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="relative w-screen h-screen flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={`이미지 ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={index === initialIndex}
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* 좌우 화살표 */}
          {count > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={current === 0}
                className={cn(
                  "absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/80 active:scale-95",
                  current === 0 && "opacity-30 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={current === count - 1}
                className={cn(
                  "absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/80 active:scale-95",
                  current === count - 1 && "opacity-30 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
