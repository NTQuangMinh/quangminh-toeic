export interface ReviewQuizItem {
  id: string;
  wordId: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation: string;
  audioUrl?: string | null;
  exampleSentence: string;
  exampleTranslation: string;
  topic: string;
  toeicParts: string;
  type: "en_to_vi" | "vi_to_en" | "fill_blank" | "listening";
  questionTitle: string;
  questionPrompt: string;
  audioPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isRetrying?: boolean;
  hasFailedOnce?: boolean;
}

export interface MinimalVocab {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation?: string;
  audioUrl?: string | null;
  exampleSentence: string;
  exampleTranslation?: string;
  topic?: string;
  toeicParts?: string;
}

/**
 * Generate a single quiz question item for a given vocabulary word
 */
export function createQuizQuestionForWord(
  target: MinimalVocab,
  pool: MinimalVocab[],
  forcedType?: "en_to_vi" | "vi_to_en" | "fill_blank" | "listening",
  isRetrying = false
): ReviewQuizItem {
  // Types of questions: en_to_vi (40%), fill_blank (35%), listening (25%)
  const availableTypes: Array<"en_to_vi" | "fill_blank" | "listening"> = [
    "en_to_vi",
    "fill_blank",
    "listening",
  ];
  const qType =
    forcedType ||
    availableTypes[Math.floor(Math.random() * availableTypes.length)];

  // Get distinct distractors that are not the target word
  const otherWords = pool.filter(
    (w) => w.id !== target.id && w.word.toLowerCase() !== target.word.toLowerCase()
  );
  const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
  const distractors = shuffledOthers.slice(0, 3);

  // Fallback if distractors are fewer than 3
  while (distractors.length < 3) {
    distractors.push({
      id: `fallback_${distractors.length}`,
      word: `alternative_${distractors.length}`,
      partOfSpeech: "noun",
      meaningVi: "phương án thay thế",
      exampleSentence: "This is a placeholder example sentence.",
      exampleTranslation: "Đây là câu ví dụ mẫu.",
    });
  }

  let questionTitle = "";
  let questionPrompt = "";
  let audioPrompt: string | undefined = undefined;
  let rawOptions: string[] = [];
  let correctOption = "";
  let explanation = "";

  switch (qType) {
    case "fill_blank": {
      questionTitle = "Điền từ thích hợp vào chỗ trống trong câu TOEIC:";
      // Replace target word in example sentence with ______
      const regex = new RegExp(`\\b${escapeRegExp(target.word)}\\w*\\b`, "i");
      let blankSentence = target.exampleSentence.replace(regex, "______");
      if (!blankSentence.includes("______")) {
        blankSentence = `The company management decided to ______ the new project proposal.`;
      }
      questionPrompt = blankSentence;
      correctOption = target.word;
      rawOptions = [target.word, ...distractors.map((d) => d.word)];
      explanation = `Đáp án đúng là "${target.word}" (${target.partOfSpeech}): ${target.meaningVi}. Câu hoàn chỉnh: "${target.exampleSentence}" (${target.exampleTranslation || ""}).`;
      break;
    }

    case "listening": {
      questionTitle = "🎧 Nghe phát âm và chọn nghĩa tiếng Việt chính xác:";
      questionPrompt = target.pronunciation
        ? `Nghe từ vựng [${target.pronunciation}]`
        : `Nghe phát âm từ vựng chuẩn ETS`;
      audioPrompt = target.word;
      correctOption = target.meaningVi;
      rawOptions = [target.meaningVi, ...distractors.map((d) => d.meaningVi)];
      explanation = `Từ phát âm là "${target.word}" (${target.partOfSpeech}): ${target.meaningVi}. Ví dụ: "${target.exampleSentence}"`;
      break;
    }

    case "en_to_vi":
    default: {
      questionTitle = "Chọn nghĩa tiếng Việt chính xác nhất của từ vựng:";
      questionPrompt = target.word;
      correctOption = target.meaningVi;
      rawOptions = [target.meaningVi, ...distractors.map((d) => d.meaningVi)];
      explanation = `"${target.word}" (${target.partOfSpeech}) có nghĩa là "${target.meaningVi}". Ví dụ trong đề thi TOEIC: "${target.exampleSentence}"`;
      break;
    }
  }

  // Shuffle options using Fisher-Yates
  const shuffledOptions = [...rawOptions];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  const correctIndex = shuffledOptions.indexOf(correctOption);

  return {
    id: `rq_${target.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    wordId: target.id,
    word: target.word,
    partOfSpeech: target.partOfSpeech,
    meaningVi: target.meaningVi,
    meaningEn: target.meaningEn || null,
    pronunciation: target.pronunciation || "",
    audioUrl: target.audioUrl || null,
    exampleSentence: target.exampleSentence,
    exampleTranslation: target.exampleTranslation || "",
    topic: target.topic || "General",
    toeicParts: target.toeicParts || "Part 5",
    type: qType,
    questionTitle,
    questionPrompt,
    audioPrompt,
    options: shuffledOptions,
    correctIndex,
    explanation,
    isRetrying,
    hasFailedOnce: isRetrying,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generate a full list of review quiz items from target words
 */
export function generateReviewQuizList(
  words: MinimalVocab[],
  pool: MinimalVocab[]
): ReviewQuizItem[] {
  // If pool is small, use words themselves as pool
  const effectivePool = pool && pool.length >= 4 ? pool : words;

  return words.map((w, index) => {
    // Distribute question types evenly
    const types: Array<"en_to_vi" | "fill_blank" | "listening"> = [
      "en_to_vi",
      "fill_blank",
      "listening",
    ];
    const qType = types[index % types.length];
    return createQuizQuestionForWord(w, effectivePool, qType, false);
  });
}
