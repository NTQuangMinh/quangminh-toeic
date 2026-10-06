import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { recordStudyActivity } from "@/lib/study-tracker";

export const dynamic = "force-dynamic";

export interface MatchCard {
  id: string; // unique card id: `${wordId}_word` or `${wordId}_meaning`
  wordId: string;
  type: "word" | "meaning";
  text: string;
  subtext?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  difficulty: string;
  topic: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pairsCount = Math.min(10, Math.max(4, parseInt(searchParams.get("pairs") || "6")));
    const topic = searchParams.get("topic") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const toeicPart = searchParams.get("toeicPart") || "";

    const where: any = {};
    if (topic && topic !== "all") {
      where.topic = topic;
    }
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }
    if (toeicPart && toeicPart !== "all") {
      where.toeicParts = { contains: toeicPart };
    }

    let vocabList = await db.vocabulary.findMany({ where });

    // Fallback if filter returns too few items
    if (vocabList.length < pairsCount) {
      vocabList = await db.vocabulary.findMany({ take: 50 });
    }

    const selectedVocab = shuffleArray(vocabList).slice(0, pairsCount);

    const cards: MatchCard[] = [];
    selectedVocab.forEach((item) => {
      // Word card
      cards.push({
        id: `${item.id}_word`,
        wordId: item.id,
        type: "word",
        text: item.word,
        pronunciation: item.pronunciation,
        partOfSpeech: item.partOfSpeech,
        difficulty: item.difficulty,
        topic: item.topic,
      });

      // Meaning card
      cards.push({
        id: `${item.id}_meaning`,
        wordId: item.id,
        type: "meaning",
        text: item.meaningVi,
        difficulty: item.difficulty,
        topic: item.topic,
      });
    });

    // Shuffle all cards together
    const shuffledCards = shuffleArray(cards);

    return NextResponse.json({
      pairsCount: selectedVocab.length,
      cards: shuffledCards,
      vocabItems: selectedVocab,
    });
  } catch (error) {
    console.error("Match GET error:", error);
    return NextResponse.json({ error: "Không thể tạo bộ thẻ nối từ." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const body = await req.json();
    const { matchedPairs = 6, timeSpent = 0 } = body;

    // Record study progress (words learned / reviewed)
    const goalProgress = await recordStudyActivity(userId, matchedPairs);

    return NextResponse.json({
      success: true,
      message: `Đã hoàn thành màn chơi ghép ${matchedPairs} từ vựng!`,
      goalProgress,
      timeSpent,
    });
  } catch (error) {
    console.error("Match POST error:", error);
    return NextResponse.json({ error: "Không thể lưu kết quả ván chơi." }, { status: 500 });
  }
}
