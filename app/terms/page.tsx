"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
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
              <span>서비스 이용약관</span>
            </button>
          </div>
        </header>

        {/* 컨텐츠 */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">서비스 이용약관</h1>
            <p className="text-sm text-muted-foreground">
              최종 수정일: 2026년 1월 19일
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제1조 (목적)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                본 약관은 Duory(이하 "서비스")가 제공하는 커플 추억 기록 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제2조 (정의)</h2>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• <strong>서비스</strong>: Duory가 제공하는 커플 추억 기록 및 공유 플랫폼</li>
                <li>• <strong>이용자</strong>: 본 약관에 따라 서비스를 이용하는 회원 및 비회원</li>
                <li>• <strong>회원</strong>: 서비스에 가입하여 지속적으로 서비스를 이용하는 자</li>
                <li>• <strong>커플</strong>: 초대코드를 통해 연결된 두 명의 회원</li>
                <li>• <strong>추억</strong>: 회원이 작성한 텍스트, 사진 등의 컨텐츠</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제3조 (약관의 효력 및 변경)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 공지합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제4조 (회원가입)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 회원가입은 이용자가 약관의 내용에 동의하고 가입신청을 한 후, 서비스가 이를 승낙함으로써 완료됩니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 서비스는 다음 각 호에 해당하는 경우 가입을 거부하거나 해지할 수 있습니다:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground ml-8">
                <li>- 타인의 명의를 도용한 경우</li>
                <li>- 허위 정보를 기재한 경우</li>
                <li>- 관련 법령을 위반한 경우</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제5조 (서비스 이용)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 서비스는 시스템 점검, 보수, 교체 등 필요한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제6조 (커플 연결)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 회원은 초대코드를 생성하여 상대방에게 공유할 수 있습니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 초대코드는 24시간 동안 유효하며, 사용되거나 만료되면 자동으로 무효화됩니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ③ 커플 연결 후 작성된 추억은 두 회원이 공유합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제7조 (컨텐츠 관리)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 회원이 작성한 컨텐츠의 저작권은 해당 회원에게 있습니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 회원은 "전체 공개" 설정을 통해 컨텐츠를 다른 이용자와 공유할 수 있습니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ③ 서비스는 다음 각 호에 해당하는 컨텐츠를 사전 통보 없이 삭제할 수 있습니다:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground ml-8">
                <li>- 타인의 권리를 침해하는 내용</li>
                <li>- 음란물 또는 청소년 유해 정보</li>
                <li>- 범죄 행위와 관련된 내용</li>
                <li>- 기타 관련 법령에 위배되는 내용</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제8조 (회원의 의무)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                회원은 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• 허위 정보 기재</li>
                <li>• 타인의 정보 도용</li>
                <li>• 서비스 운영 방해</li>
                <li>• 저작권 등 타인의 권리 침해</li>
                <li>• 음란 또는 폭력적인 메시지, 이미지 등 공서양속 위반</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제9조 (서비스의 제한)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                서비스는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 정지할 수 있습니다:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• 본 약관을 위반한 경우</li>
                <li>• 서비스의 정상적인 운영을 방해한 경우</li>
                <li>• 관련 법령을 위반한 경우</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제10조 (면책조항)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 서비스는 천재지변, 전쟁, 시스템 장애 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 서비스는 회원 간의 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임이 없습니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ③ 서비스는 회원이 작성한 컨텐츠의 진실성, 신뢰성 등에 대해 책임지지 않습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제11조 (회원 탈퇴 및 자격 상실)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 회원은 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원 탈퇴를 처리합니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 회원 탈퇴 시 모든 개인정보 및 컨텐츠는 즉시 삭제되며 복구할 수 없습니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ③ 커플 연결 상태에서 한 명이 탈퇴하는 경우, 커플 연결이 해제될 수 있습니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">제12조 (분쟁 해결)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ① 서비스와 이용자 간 발생한 분쟁에 대해 소송이 제기될 경우, 서비스의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                ② 서비스와 이용자 간의 법률관계는 대한민국 법령을 적용합니다.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">부칙</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                본 약관은 2026년 1월 19일부터 시행됩니다.
              </p>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

