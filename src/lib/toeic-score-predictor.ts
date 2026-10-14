/**
 * TOEIC Score Predictor Algorithm
 * Estimates current TOEIC score bracket based on vocabulary mastery, quiz accuracy, and consistency.
 */

export interface ScorePrediction {
  minScore: number;
  maxScore: number;
  avgScore: number;
  bandLabel: string;
  color: string;
  badgeBg: string;
  advice: string;
  nextMilestone: number;
  wordsNeededForNextMilestone: number;
  readinessPercentage: number;
}

export function predictToeicScore(params: {
  masteredWords: number;
  learningWords: number;
  totalLearned: number;
  quizAccuracy: number;
  streak: number;
  targetGoal?: number;
}): ScorePrediction {
  const {
    masteredWords,
    learningWords,
    totalLearned,
    quizAccuracy,
    streak,
    targetGoal = 750,
  } = params;

  // Base score starts at 300 for beginner
  let baseScore = 320;

  // 1. Contribution from Mastered Words (up to +380 points)
  // Assuming 150+ mastered words covers high-frequency core
  const masteredWeight = Math.min(1, masteredWords / 80);
  baseScore += masteredWeight * 340;

  // 2. Contribution from Learning Words (up to +90 points)
  const learningWeight = Math.min(1, learningWords / 100);
  baseScore += learningWeight * 90;

  // 3. Contribution from Quiz Accuracy (scale factor 0.85 to 1.15)
  const accuracyFactor = Math.max(0.8, Math.min(1.15, quizAccuracy / 80));
  baseScore = baseScore * accuracyFactor;

  // 4. Streak consistency boost (up to +40 points)
  const streakBoost = Math.min(40, streak * 4);
  baseScore += streakBoost;

  // Clamp within realistic TOEIC range (10 - 990, rounded to 5)
  const rawAvg = Math.max(300, Math.min(990, Math.round(baseScore / 5) * 5));
  const minScore = Math.max(250, rawAvg - 25);
  const maxScore = Math.min(990, rawAvg + 30);
  const avgScore = rawAvg;

  let bandLabel = "Band 450 - Cơ bản";
  let color = "text-emerald-600";
  let badgeBg = "bg-emerald-50 border-emerald-200";

  if (avgScore >= 850) {
    bandLabel = "Band 850+ - Chinh phục Điểm Cao";
    color = "text-purple-600";
    badgeBg = "bg-purple-50 border-purple-200";
  } else if (avgScore >= 750) {
    bandLabel = "Band 750+ - Giao tiếp Công sở Thành thạo";
    color = "text-blue-600";
    badgeBg = "bg-blue-50 border-blue-200";
  } else if (avgScore >= 650) {
    bandLabel = "Band 650+ - Bứt phá Điểm Thi";
    color = "text-indigo-600";
    badgeBg = "bg-indigo-50 border-indigo-200";
  } else if (avgScore >= 500) {
    bandLabel = "Band 500+ - Trung cấp";
    color = "text-amber-600";
    badgeBg = "bg-amber-50 border-amber-200";
  }

  // Next Milestone calculation
  let nextMilestone = 650;
  if (avgScore >= 850) nextMilestone = 990;
  else if (avgScore >= 750) nextMilestone = 850;
  else if (avgScore >= 650) nextMilestone = 750;
  else if (avgScore >= 500) nextMilestone = 650;
  else nextMilestone = 500;

  const scoreGap = Math.max(0, nextMilestone - avgScore);
  const wordsNeededForNextMilestone = Math.max(5, Math.ceil(scoreGap / 3.5));

  let advice = "";
  if (avgScore >= 850) {
    advice = "Phong độ xuất sắc! Hãy tập trung vào các bẫy từ đồng nghĩa và thành ngữ trong Part 7 để chạm mốc tuyệt đối 990.";
  } else if (avgScore >= 750) {
    advice = `Bạn đang ở ngưỡng 750+ rất tốt. Nạp thêm ~${wordsNeededForNextMilestone} từ vựng nâng cao để bứt phá lên mốc 850+.`;
  } else if (avgScore >= 650) {
    advice = `Mức điểm hiện tại đủ tiêu chuẩn tốt nghiệp và nộp hồ sơ đa quốc gia. Luyện thêm nghe Part 1 & 2 để vươn tới 750+.`;
  } else {
    advice = `Tiếp tục duy trì học đều đặn mỗi ngày 10-15 từ để nhanh chóng vượt ngưỡng 650 TOEIC.`;
  }

  const readinessPercentage = Math.min(100, Math.round((avgScore / targetGoal) * 100));

  return {
    minScore,
    maxScore,
    avgScore,
    bandLabel,
    color,
    badgeBg,
    advice,
    nextMilestone,
    wordsNeededForNextMilestone,
    readinessPercentage,
  };
}

export function getMilestones(currentScore: number) {
  return [
    { target: 500, label: "Cơ bản", reached: currentScore >= 500 },
    { target: 650, label: "Đạt chuẩn", reached: currentScore >= 650 },
    { target: 750, label: "Bứt phá", reached: currentScore >= 750 },
    { target: 850, label: "Nâng cao", reached: currentScore >= 850 },
    { target: 900, label: "Chuyên gia", reached: currentScore >= 900 },
  ];
}
