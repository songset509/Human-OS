import { z } from "zod";

export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(6).max(128);
export const moodSchema = z.enum(["happy", "calm", "neutral", "stressed", "sad"]);
export const communityTopicSchema = z.enum([
  "loneliness", "confidence", "productivity", "relationships", "career", "purpose",
]);

export const assessmentSubmitSchema = z.object({
  assessmentId: z.string().min(1).max(64),
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
});

export const moodLogSchema = z.object({
  mood: moodSchema,
  note: z.string().max(2000).optional(),
  loggedAt: z.string().optional(),
});

export const coachMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  topic: z.string().max(64).optional(),
});

export const communityPostSchema = z.object({
  topic: communityTopicSchema,
  content: z.string().min(1).max(4000),
});

export const futureSelfSchema = z.object({
  habits: z.string().min(1).max(2000),
  goals: z.string().min(1).max(2000),
  lifestyle: z.string().max(2000).optional().default(""),
});

export const vaultEntrySchema = z.object({
  type: z.enum(["journal", "reflection", "lesson", "insight", "goal"]),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const lifeOsUpdateSchema = z.object({
  dimension: z.enum([
    "health", "career", "relationships", "learning", "finance", "purpose", "emotional",
  ]),
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export const relationshipNodeSchema = z.object({
  name: z.string().min(1).max(100),
  strength: z.number().int().min(1).max(5),
  category: z.enum(["family", "friend", "colleague", "partner", "other"]),
});

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { data: result.data };
}
