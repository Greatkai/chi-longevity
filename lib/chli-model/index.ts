import type {
  AssessmentInput,
  AssessmentResult,
  DimensionScore,
  RiskLevel,
} from "./types";
import {
  scoreBioAge,
  scoreFunctional,
  scoreMetabolic,
  scoreLifestyle,
  scorePsychosocial,
  scoreDigital,
  buildDimension,
} from "./scorer";
import { clampScore, levelFromScore, RISK_META } from "./normalization";

/** 六大维度权重 */
export const CHLI_WEIGHTS: Record<string, number> = {
  B: 0.2,
  F: 0.2,
  M: 0.2,
  L: 0.15,
  P: 0.1,
  D: 0.15,
};

/** 附加模块 FSHI 权重 */
export const FSHI_WEIGHT = 0.2;

/**
 * 计算 CHLI 综合长寿指数
 * CHLI = 0.20×B + 0.20×F + 0.20×M + 0.15×L + 0.10×P + 0.15×D
 */
export function calculateCHLI(input: AssessmentInput): AssessmentResult {
  // 六维得分
  const bio = scoreBioAge(input.bio);
  const functional = scoreFunctional(input.functional);
  const metabolic = scoreMetabolic(input.metabolic);
  const lifestyle = scoreLifestyle(input.lifestyle);
  const psychosocial = scorePsychosocial(input.psychosocial);
  const digital = scoreDigital(input.digital);

  const dimensions: DimensionScore[] = [
    buildDimension("B", bio.score, bio.details, CHLI_WEIGHTS.B),
    buildDimension("F", functional.score, functional.details, CHLI_WEIGHTS.F),
    buildDimension("M", metabolic.score, metabolic.details, CHLI_WEIGHTS.M),
    buildDimension("L", lifestyle.score, lifestyle.details, CHLI_WEIGHTS.L),
    buildDimension("P", psychosocial.score, psychosocial.details, CHLI_WEIGHTS.P),
    buildDimension("D", digital.score, digital.details, CHLI_WEIGHTS.D),
  ];

  // 综合加权得分
  const chliScore = clampScore(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  // FSHI 功能与感觉健康指数（附加模块）：基于功能健康 + 生活方式 + 心理的组合评估
  const fshiScore = clampScore(
    functional.score * 0.5 + lifestyle.score * 0.3 + psychosocial.score * 0.2
  );
  const fshi: DimensionScore = {
    key: "FSHI",
    name: "功能与感觉健康指数",
    score: fshiScore,
    weight: FSHI_WEIGHT,
    level: levelFromScore(fshiScore) as RiskLevel,
    details: { ...functional.details, ...psychosocial.details },
  };

  const level = levelFromScore(chliScore) as RiskLevel;

  return {
    chliScore,
    level,
    label: RISK_META[level].label,
    dimensions,
    bioAge: bio.result,
    fshi,
    createdAt: new Date().toISOString(),
  };
}

/** 获取评估标签 */
export function getAssessmentLabel(chliScore: number): string {
  return RISK_META[levelFromScore(chliScore) as RiskLevel].label;
}

export * from "./types";
export * from "./scorer";
export { RISK_META, RISK_LEVELS, clampScore, levelFromScore } from "./normalization";
