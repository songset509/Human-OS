import { NextResponse } from "next/server";
import { getAssessmentQualityMeta } from "@/lib/data/assessment-v2-data";
import { getQuestionPool } from "@/lib/assessments/question-banks";
import { mapAssessmentToFramework } from "@/lib/framework/flourishing-framework";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessmentId");
  if (!assessmentId) {
    return NextResponse.json({ error: "assessmentId required" }, { status: 400 });
  }

  const meta = await getAssessmentQualityMeta(assessmentId);
  const poolSize = getQuestionPool(assessmentId).length;
  const frameworkDimensions = mapAssessmentToFramework(assessmentId);

  return NextResponse.json({
    meta,
    poolSize,
    frameworkDimensions,
    adaptive: true,
    engineVersion: "v2",
  });
}
