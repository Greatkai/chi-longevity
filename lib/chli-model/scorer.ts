import type {
  AssessmentInput,
  BioAgeInput,
  FunctionalInput,
  MetabolicInput,
  LifestyleInput,
  PsychosocialInput,
  DigitalHealthInput,
  DimensionScore,
  BioAgeResult,
  RiskLevel,
} from "./types";
import { clampScore, linearMap, levelFromScore } from "./normalization";

/**
 * CHLI 各维度计分逻辑
 * 每维度输出 0-100 分，得分越高表示越健康。
 */

/** 1-5 李克特量表映射到 0-100 */
function scale1to5(v: number): number {
  return clampScore(linearMap(v, 1, 5, 0, 100));
}

/** 0-5 频率量表映射到 0-100 */
function freq0to5(v: number): number {
  return clampScore(linearMap(v, 0, 5, 0, 100));
}

/* ------------------- B 生物年龄指数 ------------------- */
export function scoreBioAge(input: BioAgeInput): {
  score: number;
  details: Record<string, number>;
  result: BioAgeResult;
} {
  const actualAge = input.actualAge;
  // 若未提供生物年龄，则根据实际年龄估算（假设与年龄同龄为中等偏上）
  let biologicalAge: number;
  if (input.biologicalAge !== null && input.biologicalAge > 0) {
    biologicalAge = input.biologicalAge;
  } else {
    biologicalAge = actualAge;
  }

  const ageGap = biologicalAge - actualAge;
  // 生物年龄比实际年龄小 => 更健康；大 => 衰老更快
  // 每年轻 1 岁约 +2 分，封顶；年长每岁约 -2.5 分
  let score = 60 - ageGap * 2.5;
  // 实际年龄对基础分微调：更年轻者基础分更高（寿命余量更大）
  score += Math.max(0, (80 - actualAge)) * 0.1;
  score = clampScore(score);

  return {
    score,
    details: {
      actualAge,
      biologicalAge,
      ageGap,
    },
    result: { actualAge, biologicalAge, ageGap },
  };
}

/* ------------------- F 功能健康指数 ------------------- */
export function scoreFunctional(input: FunctionalInput): {
  score: number;
  details: Record<string, number>;
} {
  const bodyFunction = scale1to5(input.bodyFunction);
  const cognition = scale1to5(input.cognition);
  const selfCare = scale1to5(input.selfCare);
  // 每周运动天数 0-7 => 得分（5 天以上满分）
  const exercise = clampScore(linearMap(input.exerciseDays, 0, 5, 0, 100));

  const score = clampScore(
    bodyFunction * 0.35 + cognition * 0.25 + selfCare * 0.2 + exercise * 0.2
  );

  return {
    score,
    details: { bodyFunction, cognition, selfCare, exercise },
  };
}

/* ------------------- M 代谢与慢病风险指数 ------------------- */
export function scoreMetabolic(input: MetabolicInput): {
  score: number;
  details: Record<string, number>;
} {
  // BMI：18.5-24 最佳
  let bmiScore: number;
  if (input.bmi >= 18.5 && input.bmi <= 24) bmiScore = 100;
  else if (input.bmi >= 24 && input.bmi <= 28) bmiScore = 75;
  else if (input.bmi < 18.5 || (input.bmi > 28 && input.bmi <= 32)) bmiScore = 50;
  else bmiScore = 25;

  // 血压：120/80 理想
  const sysScore = clampScore(linearMap(input.systolicBP, 140, 110, 0, 100));
  const diaScore = clampScore(linearMap(input.diastolicBP, 90, 75, 0, 100));
  const bpScore = clampScore(sysScore * 0.5 + diaScore * 0.5);

  // 空腹血糖：理想 <6.1
  const glucoseScore = clampScore(linearMap(input.fastingGlucose, 7.5, 5.5, 0, 100));

  // 血脂 LDL-C：理想 <3.4
  const ldlScore = clampScore(linearMap(input.ldl, 4.5, 2.5, 0, 100));

  // 慢病数量：0 个满分，每个 -20
  const chronicScore = clampScore(100 - input.chronicCount * 20);
  // 慢病控制：0 差 / 1 一般 / 2 良好
  const controlScore = clampScore(linearMap(input.chronicControl, 0, 2, 40, 100));

  // 若患慢病则控制项权重更高
  const hasChronic = input.chronicCount > 0;
  const score = hasChronic
    ? clampScore(
        bmiScore * 0.15 +
          bpScore * 0.15 +
          glucoseScore * 0.15 +
          ldlScore * 0.15 +
          chronicScore * 0.15 +
          controlScore * 0.25
      )
    : clampScore(
        bmiScore * 0.2 +
          bpScore * 0.25 +
          glucoseScore * 0.2 +
          ldlScore * 0.2 +
          chronicScore * 0.15
      );

  return {
    score,
    details: {
      bmiScore,
      bpScore,
      glucoseScore,
      ldlScore,
      chronicScore,
      controlScore,
    },
  };
}

/* ------------------- L 生活方式与行为指数 ------------------- */
export function scoreLifestyle(input: LifestyleInput): {
  score: number;
  details: Record<string, number>;
} {
  // 饮食健康度 0-10
  const dietScore = clampScore(linearMap(input.diet, 0, 10, 0, 100));
  // 睡眠：时长 7-8h 最佳，质量 1-5
  let sleepDurationScore: number;
  if (input.sleepHours >= 7 && input.sleepHours <= 8) sleepDurationScore = 100;
  else if (input.sleepHours >= 6 && input.sleepHours <= 9) sleepDurationScore = 75;
  else if (input.sleepHours >= 5 && input.sleepHours <= 10) sleepDurationScore = 50;
  else sleepDurationScore = 25;
  const sleepQualityScore = scale1to5(input.sleepQuality);
  const sleepScore = clampScore(sleepDurationScore * 0.5 + sleepQualityScore * 0.5);

  // 运动：每周 0-7 次
  const exerciseScore = clampScore(linearMap(input.weeklyExercise, 0, 5, 0, 100));
  // 吸烟：0 从不 / 1 已戒 / 2 偶尔 / 3 经常
  const smokingScore =
    input.smoking === 0 ? 100 : input.smoking === 1 ? 85 : input.smoking === 2 ? 55 : 20;
  // 饮酒：0 从不 / 1 少量 / 2 经常
  const alcoholScore = input.alcohol === 0 ? 100 : input.alcohol === 1 ? 75 : 30;
  // 压力：1-5，低压力更好
  const stressScore = clampScore(linearMap(input.stress, 5, 1, 0, 100));

  const score = clampScore(
    dietScore * 0.2 +
      sleepScore * 0.2 +
      exerciseScore * 0.2 +
      smokingScore * 0.15 +
      alcoholScore * 0.1 +
      stressScore * 0.15
  );

  return {
    score,
    details: {
      dietScore,
      sleepScore,
      exerciseScore,
      smokingScore,
      alcoholScore,
      stressScore,
    },
  };
}

/* ------------------- P 心理认知与社交参与指数 ------------------- */
export function scorePsychosocial(input: PsychosocialInput): {
  score: number;
  details: Record<string, number>;
} {
  const moodScore = scale1to5(input.mood);
  const cognitiveScore = freq0to5(input.cognitiveActivity);
  const socialScore = freq0to5(input.socialActivity);
  // 孤独感反向：1 无 ~ 5 严重
  const lonelinessScore = clampScore(linearMap(input.loneliness, 5, 1, 0, 100));

  const score = clampScore(
    moodScore * 0.3 +
      cognitiveScore * 0.2 +
      socialScore * 0.25 +
      lonelinessScore * 0.25
  );

  return {
    score,
    details: { moodScore, cognitiveScore, socialScore, lonelinessScore },
  };
}

/* ------------------- D 数字健康轨迹指数 ------------------- */
export function scoreDigital(input: DigitalHealthInput): {
  score: number;
  details: Record<string, number>;
} {
  const checkupScore = input.regularCheckup === 1 ? 100 : 30;
  const wearableScore =
    input.wearable === 0 ? 25 : input.wearable === 1 ? 60 : 100;
  const continuityScore = clampScore(linearMap(input.recordContinuity, 0, 10, 0, 100));
  const monitorScore = clampScore(linearMap(input.monitorTimes, 0, 4, 0, 100));

  const score = clampScore(
    checkupScore * 0.3 +
      wearableScore * 0.2 +
      continuityScore * 0.3 +
      monitorScore * 0.2
  );

  return {
    score,
    details: { checkupScore, wearableScore, continuityScore, monitorScore },
  };
}

/* ------------------- 维度元数据 ------------------- */
export const DIMENSION_NAMES: Record<string, string> = {
  B: "生物年龄指数",
  F: "功能健康指数",
  M: "代谢与慢病风险指数",
  L: "生活方式与行为指数",
  P: "心理认知与社交参与指数",
  D: "数字健康轨迹指数",
};

/** 构建单个维度得分对象 */
export function buildDimension(
  key: string,
  score: number,
  details: Record<string, number>,
  weight: number
): DimensionScore {
  const s = clampScore(score);
  return {
    key,
    name: DIMENSION_NAMES[key] || key,
    score: s,
    weight,
    level: levelFromScore(s) as RiskLevel,
    details,
  };
}
