import { NextResponse } from "next/server";
import { loadSavedInstructionGuides } from "@/lib/supabase/instructionGuideStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guides = await loadSavedInstructionGuides(100);

    return NextResponse.json({
      guides,
    });
  } catch (error) {
    console.error("Gespeicherte Anleitungen konnten nicht geladen werden:", error);

    return NextResponse.json(
      {
        guides: [],
        error:
          error instanceof Error
            ? error.message
            : "Gespeicherte Anleitungen konnten nicht geladen werden.",
      },
      { status: 500 }
    );
  }
}