"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase, type User, type Couple } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  couple: Couple | null;
  partner: User | null;
  daysCount: number;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  couple: null,
  partner: null,
  daysCount: 0,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [daysCount, setDaysCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ref로 변경 - 동기적 체크 가능
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const ensureUserRow = async (id: string, email: string) => {
    try {
      const { error } = await supabase.from("users").upsert({
        id,
        email,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Error ensuring user row:", error);
      }
    } catch (error) {
      console.error("Error ensuring user row:", error);
    }
  };

  const fetchUserData = async (userId: string): Promise<User | null> => {
    const requestId = Math.random().toString(36).substring(7);

    // 이미 요청 중이면 대기 (ref로 동기 체크)
    if (isFetchingRef.current) {
      return null;
    }

    // 1초 이내 중복 요청 방지 (디바운싱)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      return null;
    }

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      const queryStart = Date.now();

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const queryTime = Date.now() - queryStart;

      if (error) {
        return null;
      }

      // 커플 데이터가 있으면 함께 로드 (null, undefined, "null" 문자열 모두 체크)
      if (
        data?.couple_id &&
        data.couple_id !== "null" &&
        data.couple_id !== "undefined"
      ) {
        await fetchCoupleData(data.couple_id, userId);
      } else {
        // 커플 데이터 없으면 초기화
        setCouple(null);
        setPartner(null);
        setDaysCount(0);
      }

      return data as User | null;
    } catch (error: any) {
      console.error(`💥 [${requestId}] Unexpected error:`, error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchCoupleData = async (coupleId: string, userId: string) => {
    try {
      // coupleId 유효성 검사
      if (!coupleId || coupleId === "null" || coupleId === "undefined") {
        setCouple(null);
        setPartner(null);
        setDaysCount(0);
        return;
      }

      // 커플 정보 가져오기
      const { data: coupleData, error: coupleError } = await supabase
        .from("couples")
        .select("*")
        .eq("id", coupleId)
        .single();

      if (coupleError || !coupleData) {
        setCouple(null);
        setPartner(null);
        setDaysCount(0);
        return;
      }

      setCouple(coupleData);

      // D-day 계산
      try {
        const startDate = new Date(coupleData.start_date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysCount(diffDays);
      } catch (e) {
        setDaysCount(0);
      }

      // 파트너 정보 가져오기
      let partnerId =
        coupleData.user1_id === userId
          ? coupleData.user2_id
          : coupleData.user1_id;

      // 파트너 ID 정규화 (null, undefined, 빈 문자열 모두 null로 변환)
      if (
        !partnerId ||
        partnerId === "null" ||
        partnerId === "undefined" ||
        partnerId === "" ||
        partnerId === null ||
        partnerId === undefined
      ) {
        setPartner(null);
        return;
      }

      // UUID 형식 검증 (추가 안전장치)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(partnerId)) {
        setPartner(null);
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from("users")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (partnerError || !partnerData) {
        // 에러 무시 - 파트너 매칭 대기 중
        setPartner(null);
        return;
      }

      setPartner(partnerData);
    } catch (error) {
      // 모든 에러 무시 - 기본값 유지
      setCouple(null);
      setPartner(null);
      setDaysCount(0);
    }
  };

  const refreshUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const userData = await fetchUserData(authUser.id);
        if (!userData && authUser.email) {
          await ensureUserRow(authUser.id, authUser.email);
          const retried = await fetchUserData(authUser.id);
          setUser(retried);
          setSupabaseUser(authUser);
          return;
        }
        setUser(userData);
        setSupabaseUser(authUser);
      } else {
        setUser(null);
        setSupabaseUser(null);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error refreshing user:", error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let isInitializing = true;

    const initializeAuth = async () => {
      try {
        const sessionStart = Date.now();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session?.user) {
          const userData = await fetchUserData(session.user.id);

          if (!userData && session.user.email) {
            await ensureUserRow(session.user.id, session.user.email);
            const retried = await fetchUserData(session.user.id);
            if (mounted) {
              setSupabaseUser(session.user);
              setUser(retried);
            }
          } else {
            if (mounted) {
              setSupabaseUser(session.user);
              setUser(userData);
            }
          }
        } else {
          if (mounted) {
            setSupabaseUser(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (mounted) {
          setSupabaseUser(null);
          setUser(null);
        }
      } finally {
        isInitializing = false;
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Auth state change 리스너 먼저 설정
    // 리스너 설정 후 초기화 실행
    initializeAuth().then(() => {
      if (!mounted) return;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // 초기화 중이면 무시
      if (isInitializing) {
        return;
      }

      // INITIAL_SESSION 무시
      if (event === "INITIAL_SESSION") {
        return;
      }

      // SIGNED_IN - 이미 사용자 있으면 무시 (Alt+Tab 등)
      if (event === "SIGNED_IN" && user && session?.user.id === user.id) {
        return;
      }

      // SIGNED_OUT - 로그아웃 처리
      if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null);
          setSupabaseUser(null);
        }
        return;
      }

      // TOKEN_REFRESHED - 무시 (기존 데이터 유지)
      if (event === "TOKEN_REFRESHED") {
        return;
      }

      // 그 외 이벤트는 페이지 새로고침 권장
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setCouple(null);
    setPartner(null);
    setDaysCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        couple,
        partner,
        daysCount,
        loading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
