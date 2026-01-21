import { supabase } from "../supabase";

/**
 * 초대 코드 생성
 */
export async function createInviteCode(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc("create_new_invite_code", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error creating invite code:", error);
    throw new Error("초대 코드 생성에 실패했습니다");
  }

  return data;
}

/**
 * 초대 코드로 커플 연결
 */
export async function connectWithInviteCode(
  code: string,
  userId: string
): Promise<{ success: boolean; coupleId?: string; error?: string }> {
  try {
    // 1. 초대 코드 확인
    const { data: inviteCode, error: fetchError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code)
      .eq("used", false)
      .single();

    if (fetchError || !inviteCode) {
      return { success: false, error: "유효하지 않은 코드입니다" };
    }

    if (new Date(inviteCode.expires_at).getTime() <= Date.now()) {
      return { success: false, error: "만료된 코드입니다" };
    }

    if (inviteCode.created_by === userId) {
      return { success: false, error: "본인이 생성한 코드는 사용할 수 없습니다" };
    }

    // 2. 코드 생성자가 이미 커플인지 확인
    const { data: creator } = await supabase
      .from("users")
      .select("couple_id")
      .eq("id", inviteCode.created_by)
      .single();

    if (creator?.couple_id) {
      return { success: false, error: "상대방이 이미 다른 커플과 연결되어 있습니다" };
    }

    // 3. 현재 사용자가 이미 커플인지 확인
    const { data: currentUser } = await supabase
      .from("users")
      .select("couple_id")
      .eq("id", userId)
      .single();

    if (currentUser?.couple_id) {
      return { success: false, error: "이미 커플 연결이 되어 있습니다" };
    }

    // 4. 커플 생성
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .insert({
        user1_id: inviteCode.created_by,
        user2_id: userId,
        start_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (coupleError) {
      console.error("Error creating couple:", coupleError);
      return { success: false, error: "커플 연결에 실패했습니다" };
    }

    // 5. 두 사용자의 couple_id 업데이트
    await Promise.all([
      supabase
        .from("users")
        .update({ couple_id: couple.id })
        .eq("id", inviteCode.created_by),
      supabase
        .from("users")
        .update({ couple_id: couple.id })
        .eq("id", userId),
    ]);

    // 6. 초대 코드 사용 완료 처리
    await supabase
      .from("invite_codes")
      .update({ used: true })
      .eq("id", inviteCode.id);

    return { success: true, coupleId: couple.id };
  } catch (error) {
    console.error("Error connecting with invite code:", error);
    return { success: false, error: "연결 중 오류가 발생했습니다" };
  }
}

/**
 * 사용자의 활성 초대 코드 가져오기
 */
export async function getActiveInviteCode(
  userId: string
): Promise<{ code: string; expiresAt: string } | null> {
  const { data, error } = await supabase
    .from("invite_codes")
    .select("code, expires_at")
    .eq("created_by", userId)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    code: data.code,
    expiresAt: data.expires_at,
  };
}

