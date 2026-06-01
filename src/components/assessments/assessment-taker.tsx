"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LIKERT_LABELS } from "@/lib/assessments-data";
import type { AssessmentQuestion } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface AssessmentTakerProps {
  assessmentId: string;
  title: string;
  questions: AssessmentQuestion[];
  questionType?: "likert" | "multiple_choice";
  sessionId?: string;
  engineVersion?: "v1" | "v2";
}

export function AssessmentTaker({
  assessmentId,
  title,
  questions,
  questionType = "likert",
  sessionId,
  engineVersion = "v1",
}: AssessmentTakerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [detailScores, setDetailScores] = useState<Record<string, number> | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [consistency, setConsistency] = useState<string | null>(null);
  const [confidenceReason, setConfidenceReason] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isLast = currentIndex === questions.length - 1;
  const isMC = questionType === "multiple_choice";

  function selectAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const url =
        engineVersion === "v2" && sessionId
          ? "/api/assessments/v2/session"
          : "/api/assessments";
      const body =
        engineVersion === "v2" && sessionId
          ? { sessionId, answers }
          : { assessmentId, answers };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const scoreVal = data.score ?? data.result?.normalizedScore;
        setScore(scoreVal);
        setDetailScores(data.detailScores ?? data.result?.detailScores ?? null);
        setConfidence(data.result?.confidenceLevel ?? data.confidenceLevel ?? null);
        setConsistency(data.result?.consistencyLevel ?? data.consistencyLevel ?? null);
        setConfidenceReason(data.result?.confidenceReason ?? data.confidenceReason ?? null);
        setComplete(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (isLast && isAnswered) handleSubmit();
    else if (!isLast) setCurrentIndex((i) => i + 1);
  }

  if (complete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-50 mb-2">Assessment Complete</h2>
        <p className="text-zinc-400 mb-2">{title}</p>
        <p className="text-4xl font-bold text-violet-400 mb-2">{score}/100</p>
        {confidence && (
          <div className="text-sm text-zinc-400 mb-4 max-w-md">
            <p>
              Confidence: <span className="text-teal-400 capitalize">{confidence}</span>
              {consistency && (
                <> · Consistency: <span className="capitalize">{consistency}</span></>
              )}
            </p>
            {confidenceReason && <p className="text-xs mt-1">{confidenceReason}</p>}
          </div>
        )}
        {detailScores?.iqMid && (
          <p className="text-sm text-teal-400 mb-4">
            IQ Estimate: {detailScores.iqEstimateLow}–{detailScores.iqEstimateHigh}
          </p>
        )}
        {detailScores?.openness !== undefined && (
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-6 w-full">
            {Object.entries(detailScores)
              .filter(([k]) => !k.startsWith("iq"))
              .slice(0, 5)
              .map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/8 px-3 py-2 capitalize">
                  {k}: <span className="text-zinc-200">{Math.round(v)}</span>
                </div>
              ))}
          </div>
        )}
        <div className="flex gap-3 flex-wrap justify-center">
          <Button variant="secondary" onClick={() => router.push("/testing-hub")}>
            Testing Hub
          </Button>
          <Button onClick={() => router.push("/potential")}>View HPI</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-zinc-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-xl font-medium text-zinc-100 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 mb-8">
            {isMC
              ? currentQuestion.options?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => selectAnswer(opt.value)}
                    className={cn(
                      "w-full flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all",
                      answers[currentQuestion.id] === opt.value
                        ? "border-violet-500/50 bg-violet-500/10 text-zinc-100"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/15"
                    )}
                  >
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))
              : LIKERT_LABELS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => selectAnswer(value)}
                    className={cn(
                      "w-full flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all",
                      answers[currentQuestion.id] === value
                        ? "border-violet-500/50 bg-violet-500/10 text-zinc-100"
                        : "border-white/8 bg-white/3 text-zinc-400 hover:border-white/15"
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                      answers[currentQuestion.id] === value ? "bg-violet-600 text-white" : "bg-white/5 text-zinc-500"
                    )}>
                      {value}
                    </span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={!isAnswered || submitting}>
          {submitting ? "Submitting..." : isLast ? "Submit" : "Next"}
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
