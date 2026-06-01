import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import {
  demoAddCommunityPost,
  demoAddTimelineEvent,
  demoGetAchievements,
  demoGetAllUserResults,
  demoGetCommunityPosts,
  demoGetFutureSelfScenarios,
  demoGetHPISnapshots,
  demoGetTimeline,
  demoSaveFutureSelf,
  demoSaveHPISnapshot,
  demoUnlockAchievements,
} from "@/lib/demo/store";
import {
  getAssessmentResults,
  getChallengeProgress,
  getFlourishingData,
  getMoodLogs,
} from "@/lib/data/user-data";
import { generateHumanBlueprint } from "@/lib/engines/blueprint-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";
import {
  ACHIEVEMENT_DEFINITIONS,
  computeAchievements,
  getNewlyUnlocked,
} from "@/lib/engines/achievement-engine";
import { buildDigitalTwin } from "@/lib/engines/digital-twin-engine";
import { simulateFutureSelf } from "@/lib/engines/future-self-engine";
import {
  generateMonthlyRoadmap,
  generateWeeklyPlan,
} from "@/lib/engines/life-architect-engine";
import { computeResearchStats } from "@/lib/engines/research-engine";
import {
  sbGetAchievements,
  sbGetCommunity,
  sbGetHPISnapshots,
  sbGetTimeline,
  sbInsertTimeline,
  sbPostCommunity,
  sbSaveFutureSelf,
  sbSaveHPISnapshot,
  sbUnlockAchievements,
} from "@/lib/services/supabase-upgrade";
import type { FutureSelfInput, HPIDimensions } from "@/types";

const achievementTitles = Object.fromEntries(
  ACHIEVEMENT_DEFINITIONS.map((a) => [a.id, a.title])
);

export async function getUpgradeContext() {
  const user = await getSessionUser();
  if (!user) return null;

  const [results, moods, challenges, flourishing] = await Promise.all([
    getAssessmentResults(),
    getMoodLogs(),
    getChallengeProgress(),
    getFlourishingData(),
  ]);

  const blueprint = generateHumanBlueprint(results, moods);
  const hpi = calculateHPI(results, moods);
  const unlocked = isDemoMode()
    ? demoGetAchievements(user.id)
    : await sbGetAchievements(user.id);
  const achievements = computeAchievements(results, moods, challenges, unlocked);

  return { user, results, moods, challenges, flourishing, blueprint, hpi, achievements };
}

export async function recordHPIIfNeeded(userId: string) {
  const results = await getAssessmentResults();
  const moods = await getMoodLogs();
  const hpi = calculateHPI(results, moods);
  const dims = hpi.dimensions as unknown as Record<string, number>;

  if (isDemoMode()) {
    const snapshots = demoGetHPISnapshots(userId) ?? [];
    const today = new Date().toISOString().split("T")[0];
    if (!snapshots.some((s) => s.recorded_at?.startsWith(today))) {
      demoSaveHPISnapshot(userId, hpi.overall, dims);
    }
  } else {
    await sbSaveHPISnapshot(userId, hpi.overall, dims);
  }
  return hpi;
}

export async function syncAchievements(userId: string) {
  const results = await getAssessmentResults();
  const moods = await getMoodLogs();
  const challenges = await getChallengeProgress();
  const prev = isDemoMode() ? demoGetAchievements(userId) : await sbGetAchievements(userId);
  const newly = getNewlyUnlocked(results, moods, challenges, prev);

  if (newly.length) {
    if (isDemoMode()) {
      demoUnlockAchievements(userId, newly);
      for (const id of newly) {
        demoAddTimelineEvent(userId, {
          event_type: "achievement",
          title: `Achievement: ${achievementTitles[id] ?? id}`,
          recorded_at: new Date().toISOString(),
        });
      }
    } else {
      await sbUnlockAchievements(userId, newly, achievementTitles);
      for (const id of newly) {
        await sbInsertTimeline(userId, {
          event_type: "achievement",
          title: `Achievement: ${achievementTitles[id] ?? id}`,
        });
      }
    }
  }
  return newly;
}

export async function addTimelineEvent(
  userId: string,
  event: { event_type: string; title: string; value?: number }
) {
  if (isDemoMode()) {
    demoAddTimelineEvent(userId, { ...event, recorded_at: new Date().toISOString() });
  } else {
    await sbInsertTimeline(userId, event);
  }
}

export async function runFutureSelfSimulation(input: FutureSelfInput) {
  const user = await getSessionUser();
  if (!user) return null;
  const results = await getAssessmentResults();
  const moods = await getMoodLogs();
  const scenario = simulateFutureSelf(input, results, moods);
  if (isDemoMode()) {
    demoSaveFutureSelf(user.id, input, scenario);
  } else {
    await sbSaveFutureSelf(user.id, input, scenario);
  }
  return scenario;
}

export async function getDigitalTwinData() {
  const ctx = await getUpgradeContext();
  if (!ctx) return null;
  return buildDigitalTwin(ctx.blueprint, ctx.flourishing.scores, ctx.results, ctx.moods);
}

export async function getGrowthTimeline() {
  const user = await getSessionUser();
  if (!user) return [];

  if (isDemoMode()) {
    return demoGetTimeline(user.id) ?? [];
  }
  return sbGetTimeline(user.id);
}

export async function getLifeArchitectPlan() {
  const ctx = await getUpgradeContext();
  if (!ctx) return null;
  return {
    weekly: generateWeeklyPlan(ctx.flourishing.scores, ctx.results, ctx.moods),
    monthly: generateMonthlyRoadmap(ctx.flourishing.scores),
  };
}

export async function getResearchDashboard() {
  if (isDemoMode()) {
    return computeResearchStats(demoGetAllUserResults());
  }
  return computeResearchStats([]);
}

export async function postCommunityMessage(topic: string, content: string) {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) {
    return demoAddCommunityPost(user.id, topic, content);
  }
  return sbPostCommunity(user.id, topic, content);
}

export async function getCommunityMessages(topic?: string) {
  if (isDemoMode()) return demoGetCommunityPosts(topic) ?? [];
  return sbGetCommunity(topic);
}

export async function getHPITrend(userId: string) {
  if (isDemoMode()) return demoGetHPISnapshots(userId) ?? [];
  return sbGetHPISnapshots(userId);
}

export async function getFutureSelfHistory() {
  const user = await getSessionUser();
  if (!user) return [];
  if (isDemoMode()) return demoGetFutureSelfScenarios(user.id) ?? [];
  return [];
}

export type { HPIDimensions };
