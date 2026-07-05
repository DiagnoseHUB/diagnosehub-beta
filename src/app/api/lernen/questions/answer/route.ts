import { NextResponse } from "next/server";
import { requireLearningAccess } from "@/lib/planAccess";
import {
  evaluateLearningQuestionAnswer,
  saveLearningQuestionAttempt,
} from "@/lib/supabase/learningQuestionStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry >= 0);
}

function getErrorStatus(errorMessage: string) {
  if (
    errorMessage.includes("Nicht eingeloggt") ||
    errorMessage.includes("Session")
  ) {
    return 401;
  }

  return 500;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const questionId =
      typeof body.questionId === "string" ? body.questionId.trim() : "";

    if (!questionId) {
      return NextResponse.json(
        { error: "Frage-ID fehlt." },
        { status: 400 }
      );
    }

    const access = await requireLearningAccess(request);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.error,
          userPlan: access.plan,
        },
        { status: 403 }
      );
    }

    const result = await evaluateLearningQuestionAnswer({
      questionId,
      selectedAnswerIndexes: normalizeNumberArray(body.selectedAnswerIndexes),
      userPlan: access.plan,
    });

    try {
      await saveLearningQuestionAttempt({
        userId: access.user.id,
        questionId,
        selectedAnswerIndexes: result.selectedAnswerIndexes,
      });
    } catch (attemptError) {
      console.error(
        "Lernfortschritt konnte nicht gespeichert werden:",
        attemptError
      );
    }

    return NextResponse.json({
      result,
      userPlan: access.plan,
    });
  } catch (error) {
    console.error("Antwort konnte nicht geprüft werden:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Antwort konnte nicht geprüft werden.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: getErrorStatus(errorMessage) }
    );
  }
}
