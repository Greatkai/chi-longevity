import type { LucideIcon } from "lucide-react";
import { Dna, HeartPulse, Activity, UtensilsCrossed, Brain, LineChart } from "lucide-react";

export type QuestionType = "number" | "select" | "radio" | "range";

export interface Option {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  dimension: string;
  type: QuestionType;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: Option[];
  /** 关联到 AssessmentInput 的路径 */
  path: string;
}

export interface DimensionConfig {
  key: string;
  title: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  weight: string;
}

export const DIMENSIONS: DimensionConfig[] = [
  {
    key: "B",
    title: "生物年龄",
    name: "生物学年岭指数",
    icon: Dna,
    description: "评估生物年龄与实际年龄的差异，判断身体衰老速度。",
    color: "from-brand-600 to-brand-400",
    weight: "20%",
  },
  {
    key: "F",
    title: "功能健康",
    name: "功能健康指数",
    icon: HeartPulse,
    description: "评估躯体功能、认知功能、生活自理与运动能力。",
    color: "from-teal-500 to-emerald-400",
    weight: "20%",
  },
  {
    key: "M",
    title: "代谢慢病",
    name: "代谢与慢病风险指数",
    icon: Activity,
    description: "评估 BMI、血压、血糖、血脂与慢病风险。",
    color: "from-orange-500 to-amber-400",
    weight: "20%",
  },
  {
    key: "L",
    title: "生活方式",
    name: "生活方式与行为指数",
    icon: UtensilsCrossed,
    description: "评估饮食、睡眠、运动、烟酒与压力管理。",
    color: "from-sky-500 to-cyan-400",
    weight: "15%",
  },
  {
    key: "P",
    title: "心理认知",
    name: "心理认知与社交参与指数",
    icon: Brain,
    description: "评估情绪、认知活动、社交参与与孤独感。",
    color: "from-violet-500 to-purple-400",
    weight: "10%",
  },
  {
    key: "D",
    title: "数字健康",
    name: "数字健康轨迹指数",
    icon: LineChart,
    description: "评估健康监测的连续性与规律性。",
    color: "from-rose-500 to-pink-400",
    weight: "15%",
  },
];

const scale5 = [
  { value: 1, label: "很差" },
  { value: 2, label: "较差" },
  { value: 3, label: "一般" },
  { value: 4, label: "较好" },
  { value: 5, label: "很好" },
];

const freq6 = [
  { value: 0, label: "从不" },
  { value: 1, label: "偶尔" },
  { value: 2, label: "每月几次" },
  { value: 3, label: "每周几次" },
  { value: 4, label: "经常" },
  { value: 5, label: "每天" },
];

export const QUESTIONS: Question[] = [
  /* ---------------- B 生物年龄 ---------------- */
  {
    id: "actualAge",
    dimension: "B",
    type: "number",
    label: "您的实际年龄？",
    hint: "评估范围 25-105 岁",
    min: 25,
    max: 105,
    suffix: "岁",
    path: "bio.actualAge",
  },
  {
    id: "biologicalAge",
    dimension: "B",
    type: "number",
    label: "您的生物年龄（如做过评估）？",
    hint: "可根据体检标志物评估得出，若不明确可留空",
    min: 20,
    max: 120,
    suffix: "岁",
    path: "bio.biologicalAge",
  },

  /* ---------------- F 功能健康 ---------------- */
  {
    id: "bodyFunction",
    dimension: "F",
    type: "radio",
    label: "您的躯体功能状态如何？",
    hint: "如活动耐力、行走、爬楼等能力",
    options: scale5,
    path: "functional.bodyFunction",
  },
  {
    id: "cognition",
    dimension: "F",
    type: "radio",
    label: "您的记忆力与认知功能如何？",
    options: scale5,
    path: "functional.cognition",
  },
  {
    id: "selfCare",
    dimension: "F",
    type: "radio",
    label: "您的日常生活自理能力如何？",
    options: scale5,
    path: "functional.selfCare",
  },
  {
    id: "exerciseDays",
    dimension: "F",
    type: "number",
    label: "您每周坚持体力活动的天数？",
    min: 0,
    max: 7,
    suffix: "天",
    path: "functional.exerciseDays",
  },

  /* ---------------- M 代谢慢病 ---------------- */
  {
    id: "bmi",
    dimension: "M",
    type: "number",
    label: "您的身体质量指数（BMI）？",
    hint: "BMI = 体重(kg) ÷ 身高(m)²，理想范围 18.5-24",
    min: 14,
    max: 45,
    step: 0.1,
    path: "metabolic.bmi",
  },
  {
    id: "systolicBP",
    dimension: "M",
    type: "number",
    label: "您的收缩压（高压）？",
    hint: "理想值约 110-120 mmHg",
    min: 80,
    max: 220,
    suffix: "mmHg",
    path: "metabolic.systolicBP",
  },
  {
    id: "diastolicBP",
    dimension: "M",
    type: "number",
    label: "您的舒张压（低压）？",
    hint: "理想值约 70-80 mmHg",
    min: 50,
    max: 140,
    suffix: "mmHg",
    path: "metabolic.diastolicBP",
  },
  {
    id: "fastingGlucose",
    dimension: "M",
    type: "number",
    label: "您的空腹血糖？",
    hint: "理想值 < 6.1 mmol/L",
    min: 3,
    max: 15,
    step: 0.1,
    suffix: "mmol/L",
    path: "metabolic.fastingGlucose",
  },
  {
    id: "ldl",
    dimension: "M",
    type: "number",
    label: "您的低密度脂蛋白（LDL-C）？",
    hint: "理想值 < 3.4 mmol/L",
    min: 1,
    max: 8,
    step: 0.1,
    suffix: "mmol/L",
    path: "metabolic.ldl",
  },
  {
    id: "chronicCount",
    dimension: "M",
    type: "number",
    label: "您目前患有的慢性病数量？",
    hint: "如高血压、糖尿病、高血脂、冠心病等",
    min: 0,
    max: 6,
    path: "metabolic.chronicCount",
  },
  {
    id: "chronicControl",
    dimension: "M",
    type: "radio",
    label: "慢性病控制情况如何？",
    options: [
      { value: 0, label: "控制较差" },
      { value: 1, label: "控制一般" },
      { value: 2, label: "控制良好" },
    ],
    path: "metabolic.chronicControl",
  },

  /* ---------------- L 生活方式 ---------------- */
  {
    id: "diet",
    dimension: "L",
    type: "range",
    label: "您的饮食健康程度（0-10）？",
    hint: "0=很不健康，10=非常均衡健康",
    min: 0,
    max: 10,
    path: "lifestyle.diet",
  },
  {
    id: "sleepHours",
    dimension: "L",
    type: "number",
    label: "您平均每天睡眠时长？",
    hint: "理想 7-8 小时",
    min: 3,
    max: 12,
    step: 0.5,
    suffix: "小时",
    path: "lifestyle.sleepHours",
  },
  {
    id: "sleepQuality",
    dimension: "L",
    type: "radio",
    label: "您的睡眠质量如何？",
    options: scale5,
    path: "lifestyle.sleepQuality",
  },
  {
    id: "weeklyExercise",
    dimension: "L",
    type: "number",
    label: "您每周进行中等强度运动的次数？",
    min: 0,
    max: 7,
    suffix: "次",
    path: "lifestyle.weeklyExercise",
  },
  {
    id: "smoking",
    dimension: "L",
    type: "radio",
    label: "您的吸烟情况？",
    options: [
      { value: 0, label: "从不吸烟" },
      { value: 1, label: "已戒烟" },
      { value: 2, label: "偶尔吸烟" },
      { value: 3, label: "经常吸烟" },
    ],
    path: "lifestyle.smoking",
  },
  {
    id: "alcohol",
    dimension: "L",
    type: "radio",
    label: "您的饮酒情况？",
    options: [
      { value: 0, label: "从不饮酒" },
      { value: 1, label: "少量/偶尔" },
      { value: 2, label: "经常饮酒" },
    ],
    path: "lifestyle.alcohol",
  },
  {
    id: "stress",
    dimension: "L",
    type: "radio",
    label: "您目前的压力水平？",
    options: [
      { value: 1, label: "很低" },
      { value: 2, label: "较低" },
      { value: 3, label: "中等" },
      { value: 4, label: "较高" },
      { value: 5, label: "很高" },
    ],
    path: "lifestyle.stress",
  },

  /* ---------------- P 心理认知 ---------------- */
  {
    id: "mood",
    dimension: "P",
    type: "radio",
    label: "您近期的情绪状态如何？",
    options: scale5,
    path: "psychosocial.mood",
  },
  {
    id: "cognitiveActivity",
    dimension: "P",
    type: "radio",
    label: "您进行阅读、学习等认知训练的频率？",
    options: freq6,
    path: "psychosocial.cognitiveActivity",
  },
  {
    id: "socialActivity",
    dimension: "P",
    type: "radio",
    label: "您参与社交活动的频率？",
    options: freq6,
    path: "psychosocial.socialActivity",
  },
  {
    id: "loneliness",
    dimension: "P",
    type: "radio",
    label: "您感觉孤独的程度？",
    options: [
      { value: 1, label: "没有" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "一般" },
      { value: 4, label: "较常" },
      { value: 5, label: "经常" },
    ],
    path: "psychosocial.loneliness",
  },

  /* ---------------- D 数字健康 ---------------- */
  {
    id: "regularCheckup",
    dimension: "D",
    type: "radio",
    label: "您是否定期参加健康体检？",
    options: [
      { value: 0, label: "否" },
      { value: 1, label: "是" },
    ],
    path: "digital.regularCheckup",
  },
  {
    id: "wearable",
    dimension: "D",
    type: "radio",
    label: "您是否使用可穿戴健康设备？",
    options: [
      { value: 0, label: "不使用" },
      { value: 1, label: "偶尔使用" },
      { value: 2, label: "经常使用" },
    ],
    path: "digital.wearable",
  },
  {
    id: "recordContinuity",
    dimension: "D",
    type: "range",
    label: "您的健康数据记录连续性（0-10）？",
    hint: "0=从不记录，10=长期规律记录",
    min: 0,
    max: 10,
    path: "digital.recordContinuity",
  },
  {
    id: "monitorTimes",
    dimension: "D",
    type: "number",
    label: "您每年进行健康监测的次数？",
    min: 0,
    max: 12,
    suffix: "次",
    path: "digital.monitorTimes",
  },
];

/** 每个维度的默认初始值 */
export const DEFAULT_ASSESSMENT = {
  gender: "male" as const,
  bio: { actualAge: 40, biologicalAge: null as number | null },
  functional: { bodyFunction: 3, cognition: 3, selfCare: 3, exerciseDays: 3 },
  metabolic: {
    bmi: 23,
    systolicBP: 120,
    diastolicBP: 80,
    fastingGlucose: 5.5,
    ldl: 3,
    chronicCount: 0,
    chronicControl: 1,
  },
  lifestyle: {
    diet: 7,
    sleepHours: 7,
    sleepQuality: 3,
    weeklyExercise: 3,
    smoking: 0,
    alcohol: 0,
    stress: 3,
  },
  psychosocial: {
    mood: 3,
    cognitiveActivity: 3,
    socialActivity: 3,
    loneliness: 2,
  },
  digital: {
    regularCheckup: 1,
    wearable: 1,
    recordContinuity: 6,
    monitorTimes: 2,
  },
};
