import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Note: This uses client-side supabase. For cron, we usually need createClient with SERVICE_ROLE_KEY if RLS is strict.
// However, I will check if I can use admin features here.
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with \n to handle newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.stack);
  }
}

export const dynamic = "force-dynamic"; // Prevent caching so cron runs fresh

export async function GET(request: Request) {
  try {
    // 1. Calculate time window (tomorrow, same time window)
    // Notify exactly 24 hours before
    const now = new Date();
    // Start of the window (24 hours from now)
    const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // End of the window (25 hours from now, to catch events in this hourly slot)
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // *Ideally*, we should use Service Role Supabase Client here to bypass RLS.
    // But for this demo, I will assume we can query if we had a server-side client setup.
    // Since existing @/lib/supabase is likely client-side with Anon Key, it might fail to select *all* users' data if RLS is strict (uid check).
    // For a real Cron job, we absolutely need the SERVICE_ROLE_KEY.

    // Check if SERVICE_ROLE_KEY exists in env
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      // Fallback or Error. I cannot implement this securely without service role key for RLS bypass or specific RLS policies.
      // I will return a message instructing to add the key.
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }

    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
    );

    // Fetch schedules starting tomorrow in this hour window
    const { data: schedules, error } = await supabaseAdmin
      .from("schedules")
      .select(
        `
            *,
            couples (
                user1_id,
                user2_id
            )
        `,
      )
      .gte("start_time", windowStart.toISOString())
      .lt("start_time", windowEnd.toISOString());

    if (error) throw error;

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ message: "No schedules found for tomorrow" });
    }

    let sentCount = 0;

    // Process each schedule
    for (const schedule of schedules) {
      const couple = schedule.couples;
      if (!couple) continue;

      // Get User IDs
      const userIds = [couple.user1_id, couple.user2_id].filter((id) => id); // remove nulls

      // Fetch Tokens
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("fcm_token")
        .in("id", userIds);

      if (!users) continue;

      const tokens = users.map((u: any) => u.fcm_token).filter((t: any) => t);
      if (tokens.length === 0) continue;

      // Formating Time for display
      const scheduleTime = new Date(schedule.start_time);

      // Convert to KST (UTC+9) manually for display string if server is UTC
      // Or trust localTimeString if node server has correct locale.
      // Best approach for server-side rendering of time is explicit offset if possible, but let's stick to a simple formatted string.
      // We will assume the users are Korean based on the language.
      const timeString = scheduleTime.toLocaleTimeString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Send Notification
      // Since we can send multicast, let's do that or loop.
      const message = {
        notification: {
          title: `📅 내일 일정이 있어요: ${schedule.title}`,
          body: `내일 ${timeString}에 "${schedule.title}" 일정이 예정되어 있습니다.`,
        },
        tokens: tokens, // Multicast
        android: { notification: { icon: "/logo_192.png", color: "#FFD6DF" } },
        webpush: { notification: { icon: "/logo_192.png" } },
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(
          `Sent notifications for schedule ${schedule.title}: ${response.successCount} success`,
        );
        sentCount += response.successCount;
      } catch (sendError) {
        console.error("Failed to send notification", sendError);
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
