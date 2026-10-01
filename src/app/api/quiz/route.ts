import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export interface QuizQuestionItem {
  id: string;
  wordId: string;
  word: string;
  type: "fill_blank" | "meaning" | "en_to_vi" | "vi_to_en" | "listening";
  questionText: string;
  audioPrompt?: string; // word or sentence to play
  options: string[];
  correctIndex: number;
  explanation: string;
  collocations?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const size = Math.min(30, Math.max(5, parseInt(searchParams.get("size") || "10")));
    const topic = searchParams.get("topic") || "";
    const toeicPart = searchParams.get("toeicPart") || "";

    const where: any = {};
    if (topic && topic !== "all") {
      where.topic = topic;
    }
    if (toeicPart && toeicPart !== "all") {
      where.toeicParts = { contains: toeicPart };
    }

    let vocabList = await db.vocabulary.findMany({ where });

    // Fallback if filter returns too few items
    if (vocabList.length < 4) {
      vocabList = await db.vocabulary.findMany({ take: 50 });
    }

    // Shuffle vocabulary list
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random());
    const selectedVocab = shuffled.slice(0, size);

    const questionTypes: Array<"fill_blank" | "meaning" | "en_to_vi" | "vi_to_en" | "listening"> = [
      "fill_blank",
      "meaning",
      "en_to_vi",
      "vi_to_en",
      "listening",
    ];

    const questions: QuizQuestionItem[] = selectedVocab.map((vocab, idx) => {
      const qType = questionTypes[idx % questionTypes.length];
      const otherVocab = vocabList.filter((v) => v.id !== vocab.id);
      const distractors = otherVocab.sort(() => 0.5 - Math.random()).slice(0, 3);

      let questionText = "";
      let options: string[] = [];
      let correctIndex = 0;
      let audioPrompt: string | undefined = undefined;

      switch (qType) {
        case "fill_blank": {
          const regex = new RegExp(`\\b${vocab.word}\\w*\\b`, "i");
          let blankSentence = vocab.exampleSentence.replace(regex, "______");
          if (!blankSentence.includes("______")) {
            blankSentence = `The department decided to ______ the operational procedures.`;
          }
          questionText = blankSentence;
          const rawOptions = [vocab.word, ...distractors.map((d) => d.word)];
          const shuffledOpts = [...rawOptions].sort(() => 0.5 - Math.random());
          options = shuffledOpts;
          correctIndex = shuffledOpts.indexOf(vocab.word);
          break;
        }

        case "meaning": {
          questionText = `What is the most accurate Vietnamese meaning of "${vocab.word}" (${vocab.partOfSpeech})?`;
          const rawOptions = [vocab.meaningVi, ...distractors.map((d) => d.meaningVi)];
          const shuffledOpts = [...rawOptions].sort(() => 0.5 - Math.random());
          options = shuffledOpts;
          correctIndex = shuffledOpts.indexOf(vocab.meaningVi);
          break;
        }

        case "en_to_vi": {
          questionText = `Chọn nghĩa tiếng Việt chính xác của từ: "${vocab.word.toUpperCase()}"`;
          const rawOptions = [vocab.meaningVi, ...distractors.map((d) => d.meaningVi)];
          const shuffledOpts = [...rawOptions].sort(() => 0.5 - Math.random());
          options = shuffledOpts;
          correctIndex = shuffledOpts.indexOf(vocab.meaningVi);
          break;
        }

        case "vi_to_en": {
          questionText = `Từ tiếng Anh nào mang nghĩa: "${vocab.meaningVi}"?`;
          const rawOptions = [vocab.word, ...distractors.map((d) => d.word)];
          const shuffledOpts = [...rawOptions].sort(() => 0.5 - Math.random());
          options = shuffledOpts;
          correctIndex = shuffledOpts.indexOf(vocab.word);
          break;
        }

        case "listening": {
          questionText = `🎧 Nghe phát âm và chọn nghĩa tiếng Việt của từ:`;
          audioPrompt = vocab.word;
          const rawOptions = [vocab.meaningVi, ...distractors.map((d) => d.meaningVi)];
          const shuffledOpts = [...rawOptions].sort(() => 0.5 - Math.random());
          options = shuffledOpts;
          correctIndex = shuffledOpts.indexOf(vocab.meaningVi);
          break;
        }
      }

      return {
        id: `q_${idx + 1}`,
        wordId: vocab.id,
        word: vocab.word,
        type: qType,
        questionText,
        audioPrompt,
        options,
        correctIndex,
        explanation: `Từ "${vocab.word}" (${vocab.partOfSpeech}, phát âm ${vocab.pronunciation}) mang nghĩa: "${vocab.meaningVi}". Ví dụ: "${vocab.exampleSentence}"`,
        collocations: vocab.collocations || undefined,
      };
    });

    return NextResponse.json({
      total: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json({ error: "Không thể tạo bài kiểm tra." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const body = await req.json();
    const { questions, userAnswers, topic } = body as {
      questions: QuizQuestionItem[];
      userAnswers: number[]; // user-selected index for each question
      topic?: string;
    };

    if (!questions || !userAnswers || questions.length === 0) {
      return NextResponse.json({ error: "Dữ liệu bài làm không hợp lệ." }, { status: 400 });
    }

    let correctCount = 0;
    const evaluatedQuestions = questions.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        wordId: q.wordId,
        questionText: q.questionText,
        optionsJson: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        selectedIndex: selected,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = questions.length;
    const wrongCount = totalQuestions - correctCount;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Save QuizResult to DB
    const quizResult = await db.quizResult.create({
      data: {
        userId,
        score,
        totalQuestions,
        correctCount,
        wrongCount,
        topic: topic || null,
        questions: {
          create: evaluatedQuestions,
        },
      },
    });

    // Update user vocabulary stats (increment correctCount / wrongCount)
    const now = new Date().toISOString();
    for (const eq of evaluatedQuestions) {
      if (eq.wordId) {
        const existingUV = await db.userVocabulary.findUnique({
          where: { userId_wordId: { userId, wordId: eq.wordId } },
        });

        if (existingUV) {
          await db.userVocabulary.upsert({
            where: { userId_wordId: { userId, wordId: eq.wordId } },
            create: {
              userId,
              wordId: eq.wordId,
              correctCount: eq.isCorrect ? 1 : 0,
              wrongCount: eq.isCorrect ? 0 : 1,
              status: eq.isCorrect ? "LEARNING" : "LEARNING",
              lastReviewedAt: now,
            },
            update: {
              correctCount: existingUV.correctCount + (eq.isCorrect ? 1 : 0),
              wrongCount: existingUV.wrongCount + (eq.isCorrect ? 0 : 1),
              lastReviewedAt: now,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        id: quizResult.id,
        score,
        totalQuestions,
        correctCount,
        wrongCount,
        evaluatedQuestions,
      },
    });
  } catch (error) {
    console.error("Quiz POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu kết quả bài làm." }, { status: 500 });
  }
}
