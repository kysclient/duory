"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, status: string, data: any) => {
    setResults((prev) => [...prev, { test, status, data, time: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    try {
      // 테스트 1: 환경 변수 확인
      addResult(
        "환경 변수",
        "info",
        {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        }
      );

      // 테스트 2: Auth 세션 확인
      console.log("테스트 2: Auth 세션 확인...");
      const sessionStart = Date.now();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const sessionTime = Date.now() - sessionStart;
      
      if (sessionError) {
        addResult("Auth 세션", "error", { error: sessionError, time: sessionTime });
      } else {
        addResult("Auth 세션", "success", {
          hasSession: !!sessionData.session,
          user: sessionData.session?.user?.email,
          time: sessionTime + "ms",
        });
      }

      // 테스트 3: Users 테이블 카운트 (간단한 쿼리)
      console.log("테스트 3: Users 테이블 접근...");
      const countStart = Date.now();
      
      const countPromise = supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      try {
        const { count, error: countError } = await Promise.race([
          countPromise,
          timeout
        ]) as any;
        const countTime = Date.now() - countStart;

        if (countError) {
          addResult("Users 테이블 접근", "error", { 
            error: countError,
            code: countError.code,
            message: countError.message,
            time: countTime + "ms"
          });
        } else {
          addResult("Users 테이블 접근", "success", { 
            count,
            time: countTime + "ms"
          });
        }
      } catch (timeoutError) {
        addResult("Users 테이블 접근", "timeout", {
          message: "3초 타임아웃",
          time: Date.now() - countStart + "ms"
        });
      }

      // 테스트 4: 현재 로그인된 사용자 데이터 조회
      if (sessionData.session?.user) {
        console.log("테스트 4: 사용자 데이터 조회...");
        const userStart = Date.now();
        
        const userPromise = supabase
          .from("users")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .maybeSingle();

        const userTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        try {
          const { data: userData, error: userError } = await Promise.race([
            userPromise,
            userTimeout
          ]) as any;
          const userTime = Date.now() - userStart;

          if (userError) {
            addResult("사용자 데이터 조회", "error", {
              error: userError,
              code: userError.code,
              message: userError.message,
              time: userTime + "ms"
            });
          } else {
            addResult("사용자 데이터 조회", "success", {
              found: !!userData,
              data: userData,
              time: userTime + "ms"
            });
          }
        } catch (timeoutError) {
          addResult("사용자 데이터 조회", "timeout", {
            message: "3초 타임아웃",
            time: Date.now() - userStart + "ms"
          });
        }
      }

      // 테스트 5: 간단한 SELECT 1 쿼리 (RLS 없음)
      console.log("테스트 5: 기본 연결 테스트...");
      const pingStart = Date.now();
      
      try {
        const { error: pingError } = await supabase.rpc('ping' as any);
        const pingTime = Date.now() - pingStart;
        
        if (pingError && pingError.code !== '42883') { // 함수 없음 에러는 정상
          addResult("기본 연결", "error", { error: pingError, time: pingTime + "ms" });
        } else {
          addResult("기본 연결", "success", { 
            message: "연결 성공",
            time: pingTime + "ms"
          });
        }
      } catch (err) {
        addResult("기본 연결", "info", { 
          message: "RPC 함수 없음 (정상)",
          time: Date.now() - pingStart + "ms"
        });
      }

    } catch (err: any) {
      addResult("전체 테스트", "error", { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase 연결 테스트</h1>

        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50 mb-6"
        >
          {loading ? "테스트 중..." : "테스트 실행"}
        </button>

        <div className="space-y-4">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                result.status === "success"
                  ? "bg-green-50 border-green-500"
                  : result.status === "error"
                  ? "bg-red-50 border-red-500"
                  : result.status === "timeout"
                  ? "bg-orange-50 border-orange-500"
                  : "bg-blue-50 border-blue-500"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{result.test}</h3>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    result.status === "success"
                      ? "bg-green-500 text-white"
                      : result.status === "error"
                      ? "bg-red-500 text-white"
                      : result.status === "timeout"
                      ? "bg-orange-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
              <div className="text-xs text-gray-500 mt-2">{result.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

