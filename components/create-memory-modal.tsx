"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/api/upload";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  Globe,
  Lock,
  Plus,
  ChevronDown,
  MapPin,
  Feather,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LocationSearchModal,
  Location,
} from "@/components/location-search-modal";

interface CreateMemoryModalProps {
  onCreated?: () => void;
}

export function CreateMemoryModal({ onCreated }: CreateMemoryModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (selectedVideo) {
        toast.error("영상은 사진과 함께 올릴 수 없습니다", {
          description: "영상이 있으면 사진은 추가할 수 없어요.",
        });
        return;
      }

      const files = Array.from(e.target.files);
      const totalImages = selectedImages.length + files.length;

      if (totalImages > 4) {
        toast.error("사진 업로드 제한", {
          description: "사진은 최대 4장까지 업로드할 수 있습니다.",
        });
        return;
      }

      // S3는 용량 제한이 없으므로 클라이언트 제한 제거

      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
    // 같은 파일 재선택 가능하도록 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedImages.length > 0) {
      toast.error("영상은 사진과 함께 올릴 수 없습니다", {
        description: "사진이 있으면 영상은 추가할 수 없어요.",
      });
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
      return;
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("지원하지 않는 영상 형식", {
        description: "MP4, WebM, MOV 형식만 업로드할 수 있습니다.",
      });
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
      return;
    }

    // S3는 용량 제한이 없으므로 클라이언트 제한 제거

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setSelectedVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0 && !selectedVideo)
      return;
    if (!user || !user.couple_id) return;

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];
      const uploadedVideoUrls: string[] = [];

      // S3로 병렬 업로드 처리
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file) =>
          uploadFile(file, "memories"),
        );
        const urls = await Promise.all(uploadPromises);
        uploadedUrls.push(...urls);
      }

      if (selectedVideo) {
        const videoUrl = await uploadFile(selectedVideo, "memories");
        uploadedVideoUrls.push(videoUrl);
      }

      // 위치 데이터 준비
      const locationData = selectedLocation
        ? {
            name: selectedLocation.name,
            address: selectedLocation.address,
            roadAddress: selectedLocation.roadAddress,
            category: selectedLocation.category,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          }
        : null;

      const { error: insertError } = await supabase.from("memories").insert({
        content,
        images: uploadedUrls, // 컬럼명 수정: image_urls -> images
        videos: uploadedVideoUrls,
        couple_id: user.couple_id,
        created_by: user.id,
        is_public: isPublic,
        memory_date: new Date().toISOString().split("T")[0], // 컬럼명 수정: date -> memory_date, 형식: YYYY-MM-DD
        location_data: locationData, // 위치 데이터 추가
      });

      if (insertError) throw insertError;

      // ---------------------------------------------------------
      // 알림 발송 로직 (Partner Notification)
      // ---------------------------------------------------------
      try {
        if (user.couple_id) {
          // 1. 파트너의 FCM 토큰 조회
          const { data: partnerData } = await supabase
            .from("users")
            .select("fcm_token")
            .eq("couple_id", user.couple_id)
            .neq("id", user.id) // 나 제외
            .single();

          // 2. 토큰이 있다면 알림 발송 API 호출
          if (partnerData?.fcm_token) {
            const notificationTitle = `[Duory] ${user.nickname || "짝꿍"}님의 새 추억 ❤️`;
            const notificationBody = content
              ? content.length > 30
                ? content.substring(0, 30) + "..."
                : content
              : "새로운 사진/영상이 올라왔어요!";

            // 비동기로 호출 (await 안 함 - 사용자 경험 대기 방지)
            fetch("/api/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: partnerData.fcm_token,
                title: notificationTitle,
                body: notificationBody,
                data: { url: "/" },
              }),
            }).catch((err) => console.error("Notification send error:", err));
          }
        }
      } catch (notifyError) {
        console.error("Failed to process notification:", notifyError);
      }
      // ---------------------------------------------------------

      toast.success("추억이 등록되었습니다", {
        description: "피드에 바로 반영됐어요.",
      });

      // 초기화
      setContent("");
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setPreviewUrls([]);
      removeVideo();
      setIsPublic(false);
      setSelectedLocation(null);
      setIsOpen(false);
      onCreated?.();
    } catch (error: any) {
      console.error("추억 저장 실패:", error);
      console.error("Error Stack:", error?.stack); // 스택 트레이스 로깅
      const message =
        error?.message ||
        error?.details ||
        error?.error_description ||
        "문제가 발생했습니다. 다시 시도해주세요.";
      toast.error("추억 저장 실패", {
        description: `${message} (${error?.name || "Error"})`, // 에러 타입 표시
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.couple_id) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#FFD6DF] via-[#E9A2B3] to-[#B86E81] text-white shadow-[0_14px_36px_rgba(184,110,129,0.38)] transition-all hover:scale-105 hover:shadow-[0_18px_44px_rgba(184,110,129,0.48)] active:scale-95"
            style={{
              bottom: "calc(5rem + max(env(safe-area-inset-bottom), 0px))",
              right: "1.5rem",
            }}
            aria-label="추억 작성하기"
          >
            <Feather className="w-7 h-7 text-white" />
          </button>
        </DialogTrigger>

        <DialogContent className="flex h-dvh w-full flex-col gap-0 border-none bg-background p-0 sm:h-auto sm:max-w-[500px] sm:rounded-xl sm:border">
          <div className="flex items-center justify-between px-4 py-3 border-b sm:border-none">
            <button
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              취소
            </button>
            <span className="hidden sm:block text-sm font-semibold text-muted-foreground">
              새로운 추억
            </span>
            <Button
              onClick={handleSubmit}
              disabled={
                (!content.trim() && selectedImages.length === 0) || loading
              }
              size="sm"
              className="rounded-full px-5 font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "게시"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex gap-4">
              <div className="shrink-0 pt-1">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted border border-border">
                  <Image
                    src={user.avatar_url || "/heart.png"}
                    alt="프로필"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    "mb-3 flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium transition-colors",
                    isPublic ? "  text-sky-600" : "  text-primary",
                  )}
                >
                  {isPublic ? (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>전체 공개</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>우리끼리만</span>
                    </>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="어떤 순간을 기록하고 싶나요?"
                  className="w-full resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground focus:outline-none min-h-[120px]"
                  maxLength={500}
                  disabled={loading}
                />

                {/* 위치 표시/추가 버튼 */}
                <div className="mt-3">
                  {selectedLocation ? (
                    <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium flex-1 truncate">
                        {selectedLocation.name}
                      </span>
                      <button
                        onClick={() => setSelectedLocation(null)}
                        className="rounded-full p-0.5 hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsLocationSearchOpen(true)}
                      className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>위치 추가</span>
                    </button>
                  )}
                </div>

                {/* 이미지 그리드 - 트위터 스타일 */}
                {previewUrls.length > 0 && (
                  <div
                    className={cn(
                      "mt-3 grid gap-2 overflow-hidden rounded-2xl border bg-muted",
                      previewUrls.length === 1
                        ? "grid-cols-1"
                        : previewUrls.length === 2
                          ? "grid-cols-2 aspect-2/1"
                          : "grid-cols-2 aspect-square",
                    )}
                  >
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative h-full w-full overflow-hidden",
                          previewUrls.length === 3 && index === 0
                            ? "row-span-2"
                            : "",
                          previewUrls.length === 1
                            ? "aspect-auto max-h-[500px]"
                            : "aspect-square",
                        )}
                      >
                        <img
                          src={url}
                          alt={`미리보기 ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 영상 미리보기 */}
                {videoPreviewUrl && (
                  <div className="mt-3 overflow-hidden rounded-2xl border bg-muted">
                    <div className="relative aspect-video bg-black">
                      <video
                        src={videoPreviewUrl}
                        className="h-full w-full object-contain"
                        muted
                        playsInline
                        controls
                      />
                      <button
                        onClick={removeVideo}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-105 hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t p-3 sm:rounded-b-xl pb-6">
            <div className="flex items-center gap-4 px-2">
              <input
                type="file"
                accept="image/*"
                multiple // 다중 선택 허용
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
                disabled={
                  loading || selectedImages.length >= 4 || !!selectedVideo
                }
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-full p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95",
                  (selectedImages.length >= 4 || !!selectedVideo) &&
                    "opacity-50 cursor-not-allowed hover:bg-transparent",
                )}
                title={
                  selectedVideo
                    ? "영상이 있으면 사진을 추가할 수 없습니다"
                    : selectedImages.length >= 4
                      ? "최대 4장까지 가능합니다"
                      : "사진 추가"
                }
                disabled={
                  loading || selectedImages.length >= 4 || !!selectedVideo
                }
              >
                <ImageIcon className="h-6 w-6" />
              </button>

              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                ref={videoInputRef}
                className="hidden"
                onChange={handleVideoSelect}
                disabled={
                  loading || !!selectedVideo || selectedImages.length > 0
                }
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                className={cn(
                  "rounded-full p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95",
                  (selectedVideo || selectedImages.length > 0) &&
                    "opacity-50 cursor-not-allowed hover:bg-transparent",
                )}
                title={
                  selectedImages.length > 0
                    ? "사진이 있으면 영상을 추가할 수 없습니다"
                    : selectedVideo
                      ? "이미 영상이 추가되어 있습니다"
                      : "영상 추가"
                }
                disabled={
                  loading || !!selectedVideo || selectedImages.length > 0
                }
              >
                <Video className="h-6 w-6" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 위치 검색 모달 */}
      <LocationSearchModal
        isOpen={isLocationSearchOpen}
        onClose={() => setIsLocationSearchOpen(false)}
        onSelect={(location) => {
          setSelectedLocation(location);
          setIsLocationSearchOpen(false);
        }}
      />
    </>
  );
}
