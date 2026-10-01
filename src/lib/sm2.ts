export type SM2Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface SM2State {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
}

export interface SM2Result {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewAt: Date;
  status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
  isCorrect: boolean;
}

/**
 * SuperMemo SM-2 algorithm implementation
 * @param current Current state (repetitions, interval, easeFactor)
 * @param rating User rating: AGAIN, HARD, GOOD, EASY
 * @returns Updated interval, repetitions, easeFactor, nextReviewAt, and status
 */
export function calculateSM2(
  current: {
    repetitions?: number;
    interval?: number;
    easeFactor?: number;
  },
  rating: SM2Rating
): SM2Result {
  let repetitions = current.repetitions || 0;
  let interval = current.interval || 0;
  let easeFactor = current.easeFactor || 2.5;

  const now = new Date();
  let isCorrect = true;

  switch (rating) {
    case "AGAIN": {
      // Failed recall: reset repetitions and interval to 1 day (or immediate review)
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      isCorrect = false;
      break;
    }
    case "HARD": {
      // Recalled with significant effort: increase interval slightly, reduce ease factor
      if (repetitions === 0) {
        interval = 1;
      } else {
        interval = Math.max(1, Math.round(interval * 1.2));
      }
      repetitions += 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      isCorrect = true;
      break;
    }
    case "GOOD": {
      // Successful recall: standard SM-2 progression
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      // standard SM-2 ease factor delta for quality = 4
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)));
      isCorrect = true;
      break;
    }
    case "EASY": {
      // Effortless recall: boost interval and increase ease factor
      if (repetitions === 0) {
        interval = 2;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      repetitions += 1;
      easeFactor = Math.max(1.3, easeFactor + 0.15);
      isCorrect = true;
      break;
    }
  }

  // Next review date
  const nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  // Status mapping
  let status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" = "LEARNING";
  if (interval >= 21) {
    status = "MASTERED";
  } else if (interval >= 3) {
    status = "REVIEW";
  } else {
    status = "LEARNING";
  }

  return {
    repetitions,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100, // round to 2 decimals
    nextReviewAt,
    status,
    isCorrect,
  };
}
