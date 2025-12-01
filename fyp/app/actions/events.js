"use server";

import { inngest } from "@/inngest/client.js"; // ✅ Correct path

export async function sendUserCreateEvent(payload) {
  try {
    await inngest.send({
      name: "user.create",
      data: payload,
    });
    console.log("✅ Inngest event sent:", payload.email);
  } catch (error) {
    console.error("❌ Failed to send Inngest event:", error);
  }
}
