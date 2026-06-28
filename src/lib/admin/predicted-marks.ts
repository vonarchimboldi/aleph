import { createClient } from "@/lib/supabase/server";

export interface PredictedMarkBreakdown {
  subjectId: string;
  subjectTitle: string;
  weightInExamPercent: number;
  strength: number; // 0-100
  questionsAttempted: number;
  contribution: number; // strength * weight / 100
}

export interface PredictedMarkResult {
  userId: string;
  subjectId: string;
  predictedScore: number; // 0-100
  confidence: number; // 0-100
  breakdown: PredictedMarkBreakdown[];
}

export async function calculatePredictedMarks(userId: string): Promise<PredictedMarkResult | null> {
  const supabase = await createClient();

  // Get all active subjects with weights
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, weight_in_exam_percent")
    .eq("is_active", true);

  if (!subjects || subjects.length === 0) return null;

  // Get concept mastery for this user
  const { data: mastery } = await supabase
    .from("concept_mastery")
    .select("subject_id, strength, questions_attempted")
    .eq("user_id", userId);

  const masteryBySubject = new Map<string, { strengths: number[]; attempts: number }>();

  for (const row of mastery || []) {
    const existing = masteryBySubject.get(row.subject_id) || { strengths: [], attempts: 0 };
    existing.strengths.push(row.strength * 100);
    existing.attempts += row.questions_attempted;
    masteryBySubject.set(row.subject_id, existing);
  }

  let totalScore = 0;
  let totalWeight = 0;
  let totalAttempts = 0;
  const breakdown: PredictedMarkBreakdown[] = [];

  for (const subject of subjects) {
    const weight = subject.weight_in_exam_percent || 0;
    const subjectMastery = masteryBySubject.get(subject.id);

    const strength = subjectMastery
      ? subjectMastery.strengths.reduce((a, b) => a + b, 0) / subjectMastery.strengths.length
      : 0;

    const contribution = (strength * weight) / 100;

    breakdown.push({
      subjectId: subject.id,
      subjectTitle: subject.title,
      weightInExamPercent: weight,
      strength: Math.round(strength),
      questionsAttempted: subjectMastery?.attempts || 0,
      contribution,
    });

    totalScore += contribution;
    totalWeight += weight;
    totalAttempts += subjectMastery?.attempts || 0;
  }

  // Normalize if weights don't sum to 100
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;

  // Confidence: more attempts = higher confidence, capped at 100
  // Assume 50 questions gives ~90% confidence
  const confidence = Math.min(100, Math.round((totalAttempts / 50) * 90));

  return {
    userId,
    subjectId: "all", // aggregated across subjects
    predictedScore: Math.round(normalizedScore),
    confidence,
    breakdown,
  };
}

export async function storePredictedMarks(userId: string): Promise<void> {
  const supabase = await createClient();
  const result = await calculatePredictedMarks(userId);
  if (!result) return;

  for (const item of result.breakdown) {
    await supabase
      .from("predicted_marks")
      .upsert(
        {
          user_id: userId,
          subject_id: item.subjectId,
          predicted_score: item.strength,
          confidence: result.confidence,
          breakdown: item,
          calculated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, subject_id" }
      );
  }
}
