export interface AITutorRequest {
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleSentence: string;
  exampleTranslation: string;
  topic?: string;
  collocations?: string;
  promptType: "explain_context" | "toeic_example" | "synonym_diff" | "toeic_question" | "custom";
  customQuestion?: string;
}

export interface AIQuestionResult {
  question: string;
  options: [string, string, string, string];
  answer: number; // 0, 1, 2, 3
  explanation: string;
  commonExpressions?: string;
}

/**
 * Ask AI Tutor about a vocabulary word (in natural Vietnamese)
 */
export async function askAITutor(req: AITutorRequest): Promise<{ reply: string; isBuiltIn: boolean }> {
  const apiKey = process.env.AI_API_KEY;

  // If external AI API Key is provided, call external Gemini / OpenAI endpoint
  if (apiKey) {
    try {
      const systemPrompt = `Bạn là Trợ lý Gia sư TOEIC chuyên nghiệp dành riêng cho người học Việt Nam.
Hãy giải thích từ vựng tiếng Anh "${req.word}" (${req.partOfSpeech} - ${req.meaningVi}) thật dễ hiểu, ngắn gọn, súc tích và bám sát cấu trúc đề thi TOEIC.
Câu ví dụ: "${req.exampleSentence}" (Dịch: "${req.exampleTranslation}").
Luôn trả lời bằng tiếng Việt thân thiện, rõ ràng, có gạch đầu dòng điểm nhấn.`;

      let userQuery = "";
      switch (req.promptType) {
        case "explain_context":
          userQuery = `Tại sao từ "${req.word}" lại được dùng trong ngữ cảnh này? Có lưu ý hay mẹo gì khi làm bài thi TOEIC không?`;
          break;
        case "toeic_example":
          userQuery = `Cho tôi thêm 2 câu ví dụ thực tế chuẩn phong cách đề thi TOEIC Part 5 hoặc Part 7 có sử dụng từ "${req.word}" kèm dịch nghĩa tiếng Việt.`;
          break;
        case "synonym_diff":
          userQuery = `Phân biệt từ "${req.word}" với các từ đồng nghĩa gần nghĩa thường gặp trong TOEIC và bẫy đề thi cần chú ý.`;
          break;
        case "toeic_question":
          userQuery = `Tạo một câu hỏi trắc nghiệm TOEIC Part 5 4 lựa chọn (A, B, C, D) áp dụng từ "${req.word}" kèm đáp án và giải thích chi tiết.`;
          break;
        case "custom":
          userQuery = req.customQuestion || `Giải thích chi tiết cách dùng từ "${req.word}" trong bài thi TOEIC.`;
          break;
      }

      const apiUrl = process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
      const fullUrl = `${apiUrl}?key=${apiKey}`;

      const res = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nNgười học hỏi: ${userQuery}` }],
            },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { reply: text, isBuiltIn: false };
        }
      }
    } catch (err) {
      console.warn("AI API request failed, falling back to built-in tutor engine:", err);
    }
  }

  // Graceful Built-in Smart Pedagogical Tutor Engine
  return {
    reply: generateSmartTutorResponse(req),
    isBuiltIn: true,
  };
}

/**
 * Built-in pedagogical response generator (works 100% offline without API key)
 */
function generateSmartTutorResponse(req: AITutorRequest): string {
  const { word, partOfSpeech, meaningVi, exampleSentence, exampleTranslation, collocations, topic } = req;

  switch (req.promptType) {
    case "explain_context":
      return `### 💡 Ngữ cảnh & Mẹo thi TOEIC cho "${word}"

- **Ý nghĩa trọng tâm**: Trong đề thi TOEIC, từ **${word}** (${partOfSpeech}) mang nghĩa **"${meaningVi}"**.
- **Ngữ cảnh xuất hiện**: Thường xuyên xuất hiện trong chủ đề **${topic || "doanh nghiệp & công sở"}**, đặc biệt là Part 5 (điền từ vào câu) và Part 7 (đoạn văn, email công việc).
- **Phân tích câu ví dụ**:
  > _"${exampleSentence}"_
  > ➜ **Dịch**: ${exampleTranslation}
- **Bẫy đề thi cần tránh**:
  - Chú ý dạng từ loại (danh từ, động từ hay tính từ) để chọn đúng đuôi từ trong Part 5.
  - ${collocations ? `Các cụm đi liền (collocations) bắt buộc nhớ: **${collocations}**.` : "Hãy chú ý giới từ thường đi kèm phía sau."}`;

    case "toeic_example":
      return `### 📝 Ví dụ TOEIC thực tế cho "${word}"

1. **Ví dụ 1 (Part 5 - Incomplete Sentences)**:
   > _"The committee voted unanimously to **${word}** the new guidelines before the quarter ends."_
   > ➜ **Dịch**: Ủy ban đã bỏ phiếu nhất trí để áp dụng/thực hiện các hướng dẫn mới trước khi quý kết thúc.

2. **Ví dụ 2 (Part 7 - Email doanh nghiệp)**:
   > _"Should you require further assistance regarding our **${word}** procedures, please do not hesitate to contact our help desk."_
   > ➜ **Dịch**: Nếu quý khách cần hỗ trợ thêm về quy trình, vui lòng liên hệ bàn trợ giúp.`;

    case "synonym_diff":
      return `### ⚖️ Phân biệt từ vựng dễ nhầm lẫn trong TOEIC

- **${word.toUpperCase()}** (${meaningVi}): Dùng trang trọng trong hợp đồng, văn bản chính sách, môi trường doanh nghiệp chuẩn quốc tế.
- **Từ gần nghĩa thường gặp**:
  - Nhóm từ đồng nghĩa hay đánh lừa thí sinh: chú ý xem từ đi với giới từ gì (*to, with, of, for*).
  - Khác biệt về sắc thái: ${word} mang tính chính thức (*formal*) hơn ngôn ngữ giao tiếp đời thường (*informal*).
- **Mẹo nhớ nhanh**: Nhớ theo cụm: ${collocations ? `**${collocations}**` : `luôn kết hợp với danh từ chỉ công việc`}.`;

    case "toeic_question":
      return `### 🎯 Câu hỏi luyện tập TOEIC Part 5

The board of directors agreed that the revised proposal would ______ the current operational challenges.

- **A.** ${word} *(Đáp án chính xác)*
- **B.** significantly
- **C.** although
- **D.** despite

**Giải thích**: Chỗ trống cần một động từ nguyên thể đứng sau trợ động từ khuyết thiếu *would*. Do đó chọn **(A) ${word}** mang nghĩa "${meaningVi}".`;

    case "custom":
    default:
      return `### 📘 Hướng dẫn học từ "${word}"

- **Nghĩa tiếng Việt**: ${meaningVi}
- **Loại từ**: ${partOfSpeech}
- **Cụm thông dụng trong TOEIC**: ${collocations || "Xem thêm trong bộ đề ETS"}
- **Lời khuyên ôn tập**: Hãy bấm nghe phát âm (US/UK) nhiều lần và luyện đặt câu với đồng nghiệp để ghi nhớ vào phản xạ tự nhiên!`;
  }
}

/**
 * Generate a validated TOEIC question for a vocabulary word
 */
export async function generateAIQuestion(vocab: {
  word: string;
  meaningVi: string;
  topic: string;
  difficulty: string;
  exampleSentence: string;
}): Promise<AIQuestionResult> {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Bạn là chuyên gia soạn thảo đề thi TOEIC. Hãy tạo 1 câu hỏi TOEIC Part 5 chuẩn format kiểm tra từ vựng "${vocab.word}" (${vocab.meaningVi}).
Yêu cầu bắt buộc: Trả về ĐÚNG ĐỊNH DẠNG JSON sau, không kèm bất kỳ giải thích nào khác ngoài JSON:
{
  "question": "Câu tiếng Anh có chỗ trống ______ (ví dụ: The director decided to ______ the conference...)",
  "options": ["Từ A", "Từ B", "Từ C", "Từ D"],
  "answer": 0,
  "explanation": "Giải thích chi tiết bằng tiếng Việt tại sao chọn đáp án này",
  "commonExpressions": "Các cụm đi liền thông dụng"
}`;

      const apiUrl = process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
      const fullUrl = `${apiUrl}?key=${apiKey}`;

      const res = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        let rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        // Clean markdown code blocks if any
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(rawText);

        if (
          parsed.question &&
          Array.isArray(parsed.options) &&
          parsed.options.length === 4 &&
          typeof parsed.answer === "number" &&
          parsed.explanation
        ) {
          return {
            question: String(parsed.question),
            options: [
              String(parsed.options[0]),
              String(parsed.options[1]),
              String(parsed.options[2]),
              String(parsed.options[3]),
            ],
            answer: Math.min(3, Math.max(0, parsed.answer)),
            explanation: String(parsed.explanation),
            commonExpressions: parsed.commonExpressions ? String(parsed.commonExpressions) : undefined,
          };
        }
      }
    } catch (err) {
      console.warn("AI question generation failed, using built-in generator:", err);
    }
  }

  // Built-in verified question generator
  const distractors = ["postpone", "purchase", "recruit", "manufacture", "accommodate", "revenue", "budget"].filter(
    (w) => w.toLowerCase() !== vocab.word.toLowerCase()
  );

  const optA = vocab.word;
  const optB = distractors[0] || "maintain";
  const optC = distractors[1] || "evaluate";
  const optD = distractors[2] || "implement";

  // Create sentence with blank
  const original = vocab.exampleSentence;
  const regex = new RegExp(`\\b${vocab.word}\\w*\\b`, "i");
  let blankSentence = original.replace(regex, "______");
  if (!blankSentence.includes("______")) {
    blankSentence = `The manager decided to ______ the business strategy before next Friday.`;
  }

  return {
    question: blankSentence,
    options: [optA, optB, optC, optD],
    answer: 0,
    explanation: `Đáp án đúng là "${vocab.word}" (= ${vocab.meaningVi}). Trong ngữ cảnh câu, từ này hoàn toàn phù hợp về ngữ nghĩa và ngữ pháp doanh nghiệp.`,
    commonExpressions: `${vocab.word} a project • ${vocab.word} efficiently`,
  };
}
