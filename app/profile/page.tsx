"use client";

import { BottomNav } from "@/components/bottom-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  ImageIcon,
  LogOut,
  ChevronRight,
  Bell,
  Moon,
  Shield,
  Sun,
  Heart,
  Camera,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Calendar22 } from "@/components/calendar22";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { signOut, user, couple, partner, daysCount, refreshUser } = useAuth();
  const router = useRouter();
  const [isCoupleOpen, setIsCoupleOpen] = useState(false);
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [coupleError, setCoupleError] = useState("");
  
  // 프로필 설정
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // 통계 데이터
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [anniversariesCount, setAnniversariesCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // 마운트 후에만 테마 표시 (hydration 이슈 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // AuthContext에서 가져온 couple 데이터로 초기화
  useEffect(() => {
    if (couple) {
      setCoupleName(couple.couple_name || "");
      setStartDate(couple.start_date ? new Date(couple.start_date) : undefined);
    }
  }, [couple]);

  // 유저 데이터로 닉네임 초기화
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
    }
  }, [user]);

  // 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.couple_id) {
        setStatsLoading(false);
        return;
      }

      try {
        // 추억 개수
        const { count: memCount, error: memError } = await supabase
          .from("memories")
          .select("*", { count: "exact", head: true })
          .eq("couple_id", user.couple_id);

        if (memError) {
          console.error("추억 개수 조회 실패:", memError);
        } else {
          setMemoriesCount(memCount || 0);
        }

        // 기념일 개수
        const { count: annCount, error: annError } = await supabase
          .from("anniversaries")
          .select("*", { count: "exact", head: true })
          .eq("couple_id", user.couple_id);

        if (annError) {
          console.error("기념일 개수 조회 실패:", annError);
        } else {
          setAnniversariesCount(annCount || 0);
        }
      } catch (error) {
        console.error("통계 데이터 조회 중 오류:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user?.couple_id]);

  const getThemeLabel = () => {
    if (!mounted) return "...";
    switch (theme) {
      case "light":
        return "라이트";
      case "dark":
        return "다크";
      default:
        return "시스템";
    }
  };

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveCoupleInfo = async () => {
    if (!user?.couple_id) return;
    setIsSaving(true);
    setCoupleError("");

    const { error } = await supabase
      .from("couples")
      .update({
        couple_name: coupleName || null,
        start_date: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.couple_id);

    if (error) {
      setCoupleError("커플 정보를 저장하지 못했어요.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsCoupleOpen(false);
    
    // 저장 후 페이지 새로고침으로 AuthContext 갱신
    window.location.reload();
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith("image/")) {
      setProfileError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploadingImage(true);
    setProfileError("");

    try {
      // 파일 이름 생성 (user_id + timestamp)
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      // duory-images/avatars/profile-images 경로로 업로드
      const filePath = `duory-images/avatars/profile-images/${fileName}`;

      // Supabase Storage에 업로드 (duory-images 버킷)
      const { error: uploadError } = await supabase.storage
        .from("duory-images")
        .upload(`avatars/profile-images/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from("duory-images")
        .getPublicUrl(`avatars/profile-images/${fileName}`);

      // users 테이블 업데이트
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // AuthContext 새로고침
      await refreshUser();
    } catch (error: any) {
      console.error("이미지 업로드 실패:", error);
      setProfileError("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 프로필 정보 저장
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setProfileError("");

    const { error } = await supabase
      .from("users")
      .update({
        nickname: nickname || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setProfileError("프로필 정보를 저장하지 못했어요.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsProfileOpen(false);
    
    // AuthContext 새로고침
    await refreshUser();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center px-4">
            <div className="flex flex-row items-center">
              <Image
                src="/logo_v1.png"
                alt="Duory"
                width={215}
                height={112}
                className="w-9 h-auto"
                priority
              />
              <span className="font-semibold translate -translate-y-0.1">Duory</span>
            </div>
          </div>
        </header>

        {/* 커플 프로필 카드 */}
        <div className="border-b border-border p-6">
          <div className="mb-4 flex items-center justify-center">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="group relative h-20 w-20 overflow-hidden rounded-full bg-foreground/10 flex items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image
                src={user?.avatar_url || "/heart.png"}
                alt="프로필"
                className="object-cover"
                sizes="80px"
                width={50}
                height={50}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
          </div>
          <div className="text-center">
            <h2 className="mb-1 text-xl font-bold transition-all">
              {couple?.couple_name || "우리 커플"}
            </h2>
            <div className="text-sm text-muted-foreground">
              {startDate
                ? `${dayjs(startDate).format("YYYY. MM. DD")} ~`
                : "만난 날을 설정해주세요"}
            </div>
          </div>

          {/* 통계 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-foreground/5 p-3 text-center">
              <div className="mb-1 text-xl font-bold">
                {statsLoading ? "..." : daysCount}
              </div>
              <div className="text-xs text-muted-foreground">함께한 날</div>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3 text-center">
              <div className="mb-1 text-xl font-bold">
                {statsLoading ? "..." : memoriesCount}
              </div>
              <div className="text-xs text-muted-foreground">추억</div>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3 text-center">
              <div className="mb-1 text-xl font-bold">
                {statsLoading ? "..." : anniversariesCount}
              </div>
              <div className="text-xs text-muted-foreground">기념일</div>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        <div className="p-4">
          {/* 커플 관리 */}
          <div className="mb-4">
            <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              커플
            </div>
            <div className="space-y-2">

           
            <button
              onClick={() => router.push("/couple")}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">커플 관리</div>
                  <div className="text-xs text-muted-foreground">
                    초대코드, 커플 정보 등
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <Dialog open={isCoupleOpen} onOpenChange={setIsCoupleOpen}>
                <DialogTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">커플 정보 수정</div>
                        <div className="text-xs text-muted-foreground">
                          만난 날과 이름을 변경해요
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>커플 정보 수정</DialogTitle>
                    <DialogDescription>
                      둘 중 누구나 수정할 수 있어요
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="couple-name">커플 이름</Label>
                      <Input
                        id="couple-name"
                        value={coupleName}
                        onChange={(e) => setCoupleName(e.target.value)}
                        placeholder="예: 지은♥민수"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="">만난 날</Label>
                      <Calendar22 date={startDate} setDate={setStartDate} />
                    </div>
                  </div>

                  {coupleError && (
                    <div className="text-sm text-destructive">
                      {coupleError}
                    </div>
                  )}

                  <DialogFooter className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setIsCoupleOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSaveCoupleInfo}
                      disabled={isSaving || !startDate}
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 기념일 관리 */}
          <div className="mb-4">
            <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              기념일
            </div>
            <button 
              onClick={() => router.push("/anniversaries")}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">기념일 관리</div>
                  <div className="text-xs text-muted-foreground">
                    특별한 날들을 기록하세요
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* 추억 앨범 */}
          <div className="mb-4">
            <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              갤러리
            </div>
            <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">추억 앨범</div>
                  <div className="text-xs text-muted-foreground">
                    모든 추억을 모아보세요
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* 설정 */}
          <div className="mb-4">
            <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              설정
            </div>
            <div className="space-y-2">
       

              {/* 프로필 설정 Dialog */}
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>프로필 설정</DialogTitle>
                    <DialogDescription>
                      프로필 사진과 닉네임을 변경할 수 있어요
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* 프로필 이미지 */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-foreground/10 flex items-center justify-center">
                        <Image
                          src={user?.avatar_url || "/heart.png"}
                          alt="프로필"
                          className="object-cover"
                          sizes="96px"
                          width={60}
                          height={60}
                        />
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <Label
                          htmlFor="profile-image"
                          className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                        >
                          <Camera className="mr-2 inline-block h-4 w-4" />
                          {isUploadingImage ? "업로드 중..." : "사진 변경"}
                        </Label>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG (최대 5MB)
                        </p>
                      </div>
                    </div>

                    {/* 닉네임 */}
                    <div className="space-y-2">
                      <Label htmlFor="nickname">닉네임</Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        {nickname.length}/20
                      </p>
                    </div>

                    {profileError && (
                      <div className="text-sm text-destructive">
                        {profileError}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsProfileOpen(false)}
                      disabled={isSaving}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !nickname.trim()}
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">알림 설정</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={cycleTheme}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70"
              >
                <div className="flex items-center gap-3">
                  {mounted && theme === "dark" ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">다크 모드</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {getThemeLabel()}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>

              <button className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent active:opacity-70">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">개인정보 설정</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* 계정 */}
          <div>
            <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
              계정
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-lg border border-destructive/20 bg-card p-4 text-destructive transition-colors hover:bg-destructive/5 active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">로그아웃</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
