/**
 * CHLI（中国百岁健康标准指数）评分引擎类型定义
 * 综合公式：CHLI = 0.20×B + 0.20×F + 0.20×M + 0.15×L + 0.10×P + 0.15×D
 */

/** 风险等级 */
export type RiskLevel = "excellent" | "good" | "moderate" | "risk" | "highRisk";

/** 性别 */
export type Gender = "male" | "female";

/* ------------------------- 输入数据模型 ------------------------- */

/** B 生物年龄数据 */
export interface BioAgeInput {
  actualAge: number;
  /** 生物年龄（可由体检标志物评估，若未知传 null） */
  biologicalAge: number | null;
}

/** F 功能健康数据 */
export interface FunctionalInput {
  /** 自评躯体功能 1-5（1 很差 ~ 5 很好） */
  bodyFunction: number;
  /** 自评认知功能 1-5 */
  cognition: number;
  /** 生活自理能力 1-5 */
  selfCare: number;
  /** 每周运动天数 0-7 */
  exerciseDays: number;
}

/** M 代谢与慢病数据 */
export interface MetabolicInput {
  /** BMI 体重指数 */
  bmi: number;
  /** 收缩压 mmHg */
  systolicBP: number;
  /** 舒张压 mmHg */
  diastolicBP: number;
  /** 空腹血糖 mmol/L */
  fastingGlucose: number;
  /** 血脂（LDL-C mmol/L） */
  ldl: number;
  /** 慢病数量 0-6+ */
  chronicCount: number;
  /** 慢病控制是否良好（0 差 / 1 一般 / 2 良好） */
  chronicControl: number;
}

/** L 生活方式数据 */
export interface LifestyleInput {
  /** 饮食健康度 0-10 */
  diet: number;
  /** 每日睡眠时长 小时 */
  sleepHours: number;
  /** 睡眠质量 1-5 */
  sleepQuality: number;
  /** 每周运动次数 0-7 */
  weeklyExercise: number;
  /** 吸烟（0 从不 / 1 已戒 / 2 偶尔 / 3 经常） */
  smoking: number;
  /** 饮酒（0 从不 / 1 少量 / 2 经常） */
  alcohol: number;
  /** 压力水平 1-5（1 极低 ~ 5 极高） */
  stress: number;
}

/** P 心理认知与社交数据 */
export interface PsychosocialInput {
  /** 情绪状态 1-5（1 很差 ~ 5 很好） */
  mood: number;
  /** 认知训练频率（0 从不 ~ 5 每天） */
  cognitiveActivity: number;
  /** 社交参与频率（0 从不 ~ 5 每天） */
  socialActivity: number;
  /** 孤独感 1-5（1 无 ~ 5 严重） */
  loneliness: number;
}

/** D 数字健康轨迹数据 */
export interface DigitalHealthInput {
  /** 是否定期体检（0 否 / 1 是） */
  regularCheckup: number;
  /** 可穿戴设备使用（0 不使用 / 1 偶尔 / 2 经常） */
  wearable: number;
  /** 健康数据记录连续性 0-10 */
  recordContinuity: number;
  /** 每年健康监测次数 */
  monitorTimes: number;
}

/** 完整评估输入 */
export interface AssessmentInput {
  gender: Gender;
  bio: BioAgeInput;
  functional: FunctionalInput;
  metabolic: MetabolicInput;
  lifestyle: LifestyleInput;
  psychosocial: PsychosocialInput;
  digital: DigitalHealthInput;
}

/* ------------------------- 维度得分模型 ------------------------- */

/** 单维度得分结果 */
export interface DimensionScore {
  /** 维度标识 */
  key: string;
  /** 维度名称 */
  name: string;
  /** 0-100 得分 */
  score: number;
  /** 权重 */
  weight: number;
  /** 风险等级 */
  level: RiskLevel;
  /** 子项明细 */
  details: Record<string, number>;
}

/** 生物年龄结果 */
export interface BioAgeResult {
  actualAge: number;
  biologicalAge: number;
  /** 生物年龄 - 实际年龄（正值=衰老快，负值=衰老慢） */
  ageGap: number;
}

/** 综合评估结果 */
export interface AssessmentResult {
  /** 综合 CHLI 得分 0-100 */
  chliScore: number;
  /** 综合等级 */
  level: RiskLevel;
  /** 评估标签 */
  label: string;
  /** 各维度得分 */
  dimensions: DimensionScore[];
  /** 生物年龄对比 */
  bioAge: BioAgeResult;
  /** 附加模块 FSHI（功能与感觉健康） */
  fshi: DimensionScore | null;
  /** 生成时间 */
  createdAt: string;
}

/** 风险等级元数据 */
export interface RiskMeta {
  level: RiskLevel;
  label: string;
  color: string;
  description: string;
}
