"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>개인정보 처리방침</span>
            </button>
          </div>
        </header>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">개인정보 처리방침</h1>
            <p className="text-sm text-muted-foreground">
              최종 수정일: 2026년 1월 19일
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. 수집하는 개인정보</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Duory는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>필수 정보</strong>: 이메일 주소, 닉네임</li>
                <li>• <strong>선택 정보</strong>: 프로필 사진, 커플 정보, 기념일</li>
                <li>• <strong>서비스 이용 정보</strong>: 추억 기록(텍스트, 사진), 댓글, 좋아요</li>
                <li>• <strong>자동 수집 정보</strong>: 기기 정보, 접속 로그, IP 주소</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">2. 개인정보의 수집 방법</h2>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• 회원가입 및 서비스 이용 과정에서 직접 입력</li>
                <li>• 소셜 로그인(Google, Kakao 등)을 통한 수집</li>
                <li>• 추억 작성, 댓글, 기념일 등록 시 수집</li>
                <li>• 서비스 이용 과정에서 자동 생성 및 수집</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">3. 개인정보의 이용 목적</h2>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>서비스 제공</strong>: 커플 매칭, 추억 기록 및 공유</li>
                <li>• <strong>회원 관리</strong>: 본인 확인, 계정 관리, 고객 지원</li>
                <li>• <strong>서비스 개선</strong>: 통계 분석, 신규 기능 개발</li>
                <li>• <strong>공지사항 전달</strong>: 서비스 관련 중요 사항 안내</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                • <strong>회원 정보</strong>: 회원 탈퇴 시까지 보유
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                • <strong>서비스 이용 기록</strong>: 회원 탈퇴 후 즉시 삭제
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                • <strong>법령에 따른 보존</strong>: 전자상거래법, 통신비밀보호법 등 관련 법령에 따라 일정 기간 보존
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. 개인정보의 제3자 제공</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Duory는 원칙적으로 사용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• 사용자가 사전에 동의한 경우</li>
                <li>• 법령에 의해 요구되는 경우</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. 개인정보의 파기</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                회원 탈퇴 시 모든 개인정보는 즉시 파기됩니다. 단, 법령에 따라 보존이 필요한 경우 별도 분리 보관 후 법정 기간 경과 시 파기합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">7. 사용자의 권리</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                사용자는 언제든지 다음의 권리를 행사할 수 있습니다:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• 개인정보 열람 요청</li>
                <li>• 개인정보 수정 요청</li>
                <li>• 개인정보 삭제 요청</li>
                <li>• 개인정보 처리 정지 요청</li>
                <li>• 개인정보 다운로드 (데이터 이동권)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">8. 개인정보 보호책임자</h2>
              <div className="rounded-lg bg-muted p-4 space-y-1">
                <p className="text-sm font-medium">Duory 개인정보 보호팀</p>
                <p className="text-sm text-muted-foreground">이메일: privacy@duory.app</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">9. 개인정보 처리방침 변경</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                본 개인정보 처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있으며, 변경 시 앱 내 공지사항을 통해 고지합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">10. 기술적/관리적 보호 조치</h2>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• 데이터 암호화 전송 (HTTPS/SSL)</li>
                <li>• 접근 권한 관리 및 최소화</li>
                <li>• 개인정보 접근 로그 기록 및 보관</li>
                <li>• 정기적인 보안 점검 및 업데이트</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

