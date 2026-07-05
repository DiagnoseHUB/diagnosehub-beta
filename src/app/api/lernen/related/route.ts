import { NextResponse } from "next/server";
import { requireLearningAccess } from "@/lib/planAccess";
import { findRelatedLearningModules } from "@/lib/supabase/learningStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeLimit(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 6;
  }

  return Math.min(Math.max(Math.round(numericValue), 1), 12);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const access = await requireLearningAccess(request);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.error,
          modules: [],
          userPlan: access.plan,
        },
        { status: 403 }
      );
    }

    const faultCodes = normalizeStringArray(body.faultCodes);
    const parts = normalizeStringArray(body.parts);
    const systems = normalizeStringArray(body.systems);
    const limit = normalizeLimit(body.limit);

    const modules = await findRelatedLearningModules({
      faultCodes,
      parts,
      systems,
      userPlan: access.plan,
      limit,
    });

    return NextResponse.json({
      modules,
      userPlan: access.plan,
    });
  } catch (error) {
    console.error("Passende Lernmodule konnten nicht geladen werden:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Passende Lernmodule konnten nicht geladen werden.";
    const status =
      errorMessage.includes("Nicht eingeloggt") ||
      errorMessage.includes("Session")
        ? 401
        : 500;

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status }
    );
  }
}
