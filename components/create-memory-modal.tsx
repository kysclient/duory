"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Globe, 
  Lock, 
  Plus,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function CreateMemoryModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = selectedImages.length + files.length;
      
      if (totalImages > 4) {
        alert("사진은 최대 4장까지 업로드할 수 있습니다.");
        return;
      }

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert("각 이미지는 5MB를 초과할 수 없습니다.");
          return;
        }
      }

      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
    // 같은 파일 재선택 가능하도록 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) return;
    if (!user || !user.couple_id) return;

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      // 병렬 업로드 처리
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file) => {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
          const filePath = `memories/${user.couple_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("duory-images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("duory-images")
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        uploadedUrls.push(...urls);
      }

      const { error: insertError } = await supabase
        .from("memories")
        .insert({
          content,
          images: uploadedUrls, // 컬럼명 수정: image_urls -> images
          couple_id: user.couple_id,
          created_by: user.id,
          is_public: isPublic,
          memory_date: new Date().toISOString().split('T')[0], // 컬럼명 수정: date -> memory_date, 형식: YYYY-MM-DD
        });

      if (insertError) throw insertError;

      // 초기화
      setContent("");
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setPreviewUrls([]);
      setIsPublic(false);
      setIsOpen(false);
      router.refresh();
      
    } catch (error) {
      console.error("추억 저장 실패:", error);
      alert("문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.couple_id) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl active:scale-95"
          aria-label="추억 작성하기"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
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
          <span className="hidden sm:block text-sm font-semibold text-muted-foreground">새로운 추억</span>
          <Button 
            onClick={handleSubmit} 
            disabled={(!content.trim() && selectedImages.length === 0) || loading}
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
                  "mb-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  isPublic 
                    ? "border-sky-200 bg-sky-50 text-sky-600" 
                    : "border-stone-200 bg-stone-50 text-stone-600"
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

              {/* 이미지 그리드 - 트위터 스타일 */}
              {previewUrls.length > 0 && (
                <div className={cn(
                  "mt-3 grid gap-2 overflow-hidden rounded-2xl border bg-muted",
                  previewUrls.length === 1 ? "grid-cols-1" : 
                  previewUrls.length === 2 ? "grid-cols-2 aspect-2/1" :
                  "grid-cols-2 aspect-square"
                )}>
                  {previewUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "relative h-full w-full overflow-hidden",
                        previewUrls.length === 3 && index === 0 ? "row-span-2" : "",
                        previewUrls.length === 1 ? "aspect-auto max-h-[500px]" : "aspect-square"
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
            </div>
          </div>
        </div>

        <div className="border-t p-3 sm:rounded-b-xl">
          <div className="flex items-center gap-4 px-2">
            <input
              type="file"
              accept="image/*"
              multiple // 다중 선택 허용
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageSelect}
              disabled={loading || selectedImages.length >= 4}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "rounded-full p-2 text-primary transition-colors hover:bg-primary/10 active:scale-95",
                selectedImages.length >= 4 && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
              title={selectedImages.length >= 4 ? "최대 4장까지 가능합니다" : "사진 추가"}
              disabled={loading || selectedImages.length >= 4}
            >
              <ImageIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
