import { NextResponse } from "next/server";
import { PLAN_CONFIG } from "@/config/plans";
import { loadUserPlanFromRequest } from "@/lib/planAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorStatus(errorMessage: string) {
  if (
    errorMessage.includes("Nicht eingeloggt") ||
    errorMessage.includes("Session")
  ) {
    return 401;
  }

  return 500;
}

export async function GET(request: Request) {
  try {
    const plan = await loadUserPlanFromRequest(request);

    return NextResponse.json({
      plan,
      planLabel: PLAN_CONFIG[plan].label,
      learningAccess: PLAN_CONFIG[plan].learningAccess,
      componentKnowledgeAccess: PLAN_CONFIG[plan].componentKnowledgeAccess,
      serviceReminderAccess: PLAN_CONFIG[plan].serviceReminderAccess,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Plan konnte nicht geladen werden.";

    return NextResponse.json(
      {
        error: errorMessage,
        plan: "free",
        planLabel: PLAN_CONFIG.free.label,
        learningAccess: false,
        componentKnowledgeAccess: false,
        serviceReminderAccess: false,
      },
      { status: getErrorStatus(errorMessage) }
    );
  }
}
