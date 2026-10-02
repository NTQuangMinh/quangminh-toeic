import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Select topic-diverse words to avoid alphabetical clustering and ensure variety across topics
function selectTopicDiverseWords<T extends { id: string; topic: string }>(words: T[], limit: number): T[] {
  if (words.length <= limit) {
    return shuffleArray(words);
  }

  // 1. Group words by topic
  const topicMap = new Map<string, T[]>();
  for (const w of words) {
    const t = w.topic || "General";
    if (!topicMap.has(t)) {
      topicMap.set(t, []);
    }
    topicMap.get(t)!.push(w);
  }

  // 2. Shuffle words within each topic
  for (const [t, list] of topicMap.entries()) {
    topicMap.set(t, shuffleArray(list));
  }

  // 3. Shuffle the list of topics
  const topics = shuffleArray(Array.from(topicMap.keys()));

  // 4. Round-robin pick across topics to ensure maximum diversity of topics & letters
  const result: T[] = [];
  let addedInRound = true;

  while (result.length < limit && addedInRound) {
    addedInRound = false;
    for (const t of topics) {
      const list = topicMap.get(t);
      if (list && list.length > 0) {
        result.push(list.shift()!);
        addedInRound = true;
        if (result.length >= limit) break;
      }
    }
  }

  // Final shuffle so topics are interwoven naturally
  return shuffleArray(result);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001"; // Fallback to demo user if unauthenticated preview

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "";
    const toeicPart = searchParams.get("toeicPart") || "";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Find words already in user's review or mastered list
    const userWords = await db.userVocabulary.findMany({
      where: { userId },
    });
    const learnedWordIds = new Set(userWords.map((uw) => uw.wordId));

    // Get user's bookmarks for quick indicator
    const bookmarks = await db.bookmark.findMany({
      where: { userId },
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.wordId));

    // Filter vocabulary
    const where: any = {};
    if (topic && topic !== "all") {
      where.topic = topic;
    }
    if (toeicPart && toeicPart !== "all") {
      where.toeicParts = { contains: toeicPart };
    }

    const allMatching = await db.vocabulary.findMany({ where });

    // Prioritize unlearned words first, then learning words
    const unlearnedWords = allMatching.filter((w) => !learnedWordIds.has(w.id));
    const learningWords = allMatching.filter((w) => {
      const uw = userWords.find((u) => u.wordId === w.id);
      return uw && uw.status === "LEARNING";
    });

    let wordsToLearn: typeof allMatching = [];

    // If specific topic is chosen: shuffle randomly within that topic
    if (topic && topic !== "all") {
      const pool =
        unlearnedWords.length > 0
          ? unlearnedWords
          : learningWords.length > 0
          ? learningWords
          : allMatching;
      wordsToLearn = shuffleArray(pool).slice(0, limit);
    } else {
      // "All topics": pick words across diverse topics using round-robin sampling
      if (unlearnedWords.length >= limit) {
        wordsToLearn = selectTopicDiverseWords(unlearnedWords, limit);
      } else {
        const remainingLimit = limit - unlearnedWords.length;
        const additionalLearning = selectTopicDiverseWords(learningWords, remainingLimit);
        wordsToLearn = shuffleArray([...unlearnedWords, ...additionalLearning]);

        // If still fewer than limit, sample from allMatching
        if (wordsToLearn.length < limit) {
          const needed = limit - wordsToLearn.length;
          const selectedIds = new Set(wordsToLearn.map((w) => w.id));
          const rest = allMatching.filter((w) => !selectedIds.has(w.id));
          wordsToLearn = shuffleArray([...wordsToLearn, ...selectTopicDiverseWords(rest, needed)]);
        }
      }
    }

    const items = wordsToLearn.map((w) => ({
      ...w,
      isBookmarked: bookmarkedIds.has(w.id),
      userStatus: userWords.find((u) => u.wordId === w.id)?.status || "NEW",
    }));

    return NextResponse.json({
      items,
      totalQueue: items.length,
    });
  } catch (error) {
    console.error("Learn GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách bài học." }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const body = await req.json();
    const { wordId } = body;

    if (!wordId) {
      return NextResponse.json({ error: "Thiếu wordId." }, { status: 400 });
    }

    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const now = new Date().toISOString();
    const todayStr = now.split("T")[0];

    // Upsert into UserVocabulary
    const userVocab = await db.userVocabulary.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId,
        wordId,
        status: "LEARNING",
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReviewAt: tomorrow,
        lastReviewedAt: now,
        correctCount: 1,
        wrongCount: 0,
      },
      update: {
        lastReviewedAt: now,
        nextReviewAt: tomorrow,
        repetitions: 1,
        status: "LEARNING",
      },
    });

    // Update Daily Goal
    const user = await db.user.findUnique({ where: { id: userId } });
    const target = user?.dailyGoalTarget || 20;

    const currentGoal = await db.dailyGoal.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });

    const newLearned = (currentGoal?.learnedWords || 0) + 1;
    const isCompleted = newLearned >= target;

    const updatedGoal = await db.dailyGoal.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        targetWords: target,
        learnedWords: 1,
        completed: 1 >= target,
      },
      update: {
        learnedWords: newLearned,
        completed: isCompleted,
      },
    });

    // Update StudyLog for activity chart
    await db.studyLog.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        wordsCount: 1,
      },
      update: {
        wordsCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      userVocab,
      dailyGoal: updatedGoal,
      justCompletedGoal: isCompleted && !currentGoal?.completed,
    });
  } catch (error) {
    console.error("Learn POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu tiến độ học." }, { status: 500 });
  }
}
