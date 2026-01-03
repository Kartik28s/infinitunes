import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { voiceNoteParser } from "@/lib/crm/voice-parser";
import { VoiceNoteInput } from "@/lib/crm/voice-parser";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = VoiceNoteInput.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { transcript, userId } = validationResult.data;

    const parseResult = voiceNoteParser.parse(transcript);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Failed to parse voice note", details: parseResult.errors },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      data: parseResult.data,
      originalTranscript: transcript,
    });
  } catch (error) {
    console.error("Error parsing voice note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
