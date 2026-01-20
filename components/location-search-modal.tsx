"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface Location {
  name: string;
  address: string;
  roadAddress: string;
  category: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  phone?: string;
}

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
}

export function LocationSearchModal({ isOpen, onClose, onSelect }: LocationSearchModalProps) {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 입력창에 포커스
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // 모달이 닫힐 때 초기화
      setQuery("");
      setLocations([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setLocations([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchLocations = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search-location?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setLocations(data.locations || []);
      } else {
        console.error("위치 검색 실패:", data.error);
        setLocations([]);
      }
    } catch (error) {
      console.error("위치 검색 오류:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="flex h-dvh w-full flex-col gap-0 border-none bg-background p-0 sm:h-[600px] sm:max-w-[500px] sm:rounded-xl sm:border"
        style={{ zIndex: 60 }} // 상위 모달보다 높은 z-index
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="flex-1 text-base font-semibold">위치 검색</h2>
        </div>

        {/* 검색 입력창 */}
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2.5">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소, 주소 검색"
              className="border-0 p-0 h-auto text-base bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto">
          {locations.length > 0 ? (
            <div className="divide-y">
              {locations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(location)}
                  className="w-full px-4 py-4 text-left hover:bg-muted/50 transition-colors active:bg-muted"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2 shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base mb-1">{location.name}</p>
                      <p className="text-sm text-muted-foreground mb-0.5">
                        {location.roadAddress || location.address}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {location.category}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-base font-medium mb-1">검색 결과가 없습니다</p>
              <p className="text-sm text-muted-foreground">
                다른 검색어를 입력해보세요
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-base font-medium mb-1">장소를 검색해보세요</p>
              <p className="text-sm text-muted-foreground">
                카페, 음식점, 관광지 등
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
