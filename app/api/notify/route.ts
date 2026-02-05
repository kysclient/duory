import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with \n to handle newlines in environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.stack);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, title, body: messageBody, data } = body;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const message = {
      notification: {
        title: title || "Duory 알림",
        body: messageBody || "새로운 소식이 있습니다.",
      },
      data: data || {},
      token: token,
      android: {
        notification: {
          icon: "/logo_192.png",
          color: "#FFD6DF",
        },
      },
      webpush: {
        headers: {
          image: "/logo_192.png",
        },
        notification: {
          icon: "/logo_192.png",
          badge: "/logo_180.png",
        },
      },
    };

    // Send the message
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
