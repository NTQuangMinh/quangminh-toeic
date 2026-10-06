import { db } from "@/lib/db";

/**
 * Returns today's ISO date string in Vietnam timezone (UTC+7).
 * Ensures consistency so early morning study (5:00 - 6:59 AM) is correctly recorded as today.
 */
export function getVietnamTodayDate(): string {
  const now = new Date();
  // Vietnam is UTC+7
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vietnamTime = new Date(utc + 7 * 3600000);
  return vietnamTime.toISOString().split("T")[0];
}

/**
 * Records study activity for a user:
 * 1. Updates or creates DailyGoal (increments learnedWords)
 * 2. Updates or creates StudyLog (increments wordsCount for streak and activity charts)
 */
export async function recordStudyActivity(userId: string, count: number = 1) {
  try {
    const todayStr = getVietnamTodayDate();
    const now = new Date().toISOString();

    const user = await db.user.findUnique({ where: { id: userId } });
    const target = user?.dailyGoalTarget || 20;

    const currentGoal = await db.dailyGoal.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });

    const newLearned = (currentGoal?.learnedWords || 0) + count;
    const isCompleted = newLearned >= target;

    const updatedGoal = await db.dailyGoal.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        targetWords: target,
        learnedWords: count,
        completed: count >= target,
      },
      update: {
        learnedWords: newLearned,
        completed: isCompleted,
      },
    });

    // Update StudyLog for streak and weekly activity chart
    const updatedLog = await db.studyLog.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        wordsCount: count,
      },
      update: {
        wordsCount: { increment: count },
      },
    });

    return {
      dailyGoal: updatedGoal,
      studyLog: updatedLog,
      justCompletedGoal: isCompleted && !currentGoal?.completed,
    };
  } catch (error) {
    console.error("Error recording study activity:", error);
    return null;
  }
}
