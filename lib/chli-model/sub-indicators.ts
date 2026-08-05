import type { SubIndicator } from "./types";

/**
 * CHLI 二级指标体系配置
 * 每个一级维度由若干二级指标加权构成，权重和为 1。
 * needsLab 标记该二级指标需要检验/专项检查数据。
 */
export const SUB_INDICATORS: SubIndicator[] = [
  /* -------- B 生物年龄 -------- */
  { key: "B1", dimension: "B", name: "生物年龄差值", weight: 0.4, needsLab: false, desc: "基于生物标志物测算的生物年龄与实际年龄的差值" },
  { key: "B2", dimension: "B", name: "表观遗传/衰老时钟", weight: 0.25, needsLab: true, desc: "第3代衰老时钟，基于 DNA 甲基化等分子标志" },
  { key: "B3", dimension: "B", name: "炎症负荷", weight: 0.2, needsLab: true, desc: "hs-CRP、IL-6、TNF-α 等炎症标志物" },
  { key: "B4", dimension: "B", name: "免疫年龄/免疫功能", weight: 0.15, needsLab: false, desc: "免疫细胞亚群与免疫应答能力" },

  /* -------- F 功能健康 -------- */
  { key: "F1", dimension: "F", name: "日常活动能力", weight: 0.25, needsLab: false, desc: "ADL/IADL 日常生活自理与工具性活动" },
  { key: "F2", dimension: "F", name: "步速/步行能力", weight: 0.2, needsLab: true, desc: "步速测试、6 分钟步行试验" },
  { key: "F3", dimension: "F", name: "握力/肌肉力量", weight: 0.2, needsLab: true, desc: "握力计测量、上肢肌力" },
  { key: "F4", dimension: "F", name: "平衡能力/跌倒风险", weight: 0.15, needsLab: true, desc: "单腿站立、Berg 平衡量表" },
  { key: "F5", dimension: "F", name: "认知功能", weight: 0.2, needsLab: true, desc: "MoCA/MMSE 认知筛查量表" },

  /* -------- M 代谢与慢病 -------- */
  { key: "M1", dimension: "M", name: "血糖代谢", weight: 0.25, needsLab: true, desc: "糖化血红蛋白 HbA1c、空腹血糖" },
  { key: "M2", dimension: "M", name: "血脂与动脉粥样硬化", weight: 0.25, needsLab: true, desc: "LDL-C、ApoB、非 HDL-C" },
  { key: "M3", dimension: "M", name: "血压与心血管风险", weight: 0.2, needsLab: true, desc: "收缩压/舒张压、脉压差" },
  { key: "M4", dimension: "M", name: "体成分", weight: 0.15, needsLab: false, desc: "BMI、腰围、体脂率" },
  { key: "M5", dimension: "M", name: "肝肾与基础慢病", weight: 0.15, needsLab: true, desc: "肝肾功能指标、慢病数量与控制" },

  /* -------- L 生活方式 -------- */
  { key: "L1", dimension: "L", name: "运动水平", weight: 0.3, needsLab: false, desc: "规律运动频率与强度" },
  { key: "L2", dimension: "L", name: "睡眠质量", weight: 0.25, needsLab: false, desc: "睡眠时长与质量" },
  { key: "L3", dimension: "L", name: "饮食质量", weight: 0.25, needsLab: false, desc: "膳食均衡与地中海式饮食" },
  { key: "L4", dimension: "L", name: "烟酒习惯", weight: 0.1, needsLab: false, desc: "吸烟与饮酒情况" },
  { key: "L5", dimension: "L", name: "体重管理与依从性", weight: 0.1, needsLab: false, desc: "体重控制与健康行为依从" },

  /* -------- P 心理认知 -------- */
  { key: "P1", dimension: "P", name: "抑郁焦虑压力", weight: 0.25, needsLab: false, desc: "情绪状态与心理压力" },
  { key: "P2", dimension: "P", name: "认知健康与记忆", weight: 0.25, needsLab: false, desc: "自我认知与记忆功能" },
  { key: "P3", dimension: "P", name: "社会连接与孤独感", weight: 0.2, needsLab: false, desc: "孤独感与社会联结" },
  { key: "P4", dimension: "P", name: "生活目标感/韧性", weight: 0.15, needsLab: false, desc: "目标感、心理韧性" },
  { key: "P5", dimension: "P", name: "社交参与", weight: 0.15, needsLab: false, desc: "社会活动参与频率" },

  /* -------- D 数字健康轨迹 -------- */
  { key: "D1", dimension: "D", name: "健康数据完整性", weight: 0.25, needsLab: false, desc: "连续健康数据的完整程度" },
  { key: "D2", dimension: "D", name: "设备数据质量", weight: 0.2, needsLab: false, desc: "可穿戴设备数据质量" },
  { key: "D3", dimension: "D", name: "指标改善趋势", weight: 0.25, needsLab: true, desc: "历史健康指标的改善趋势" },
  { key: "D4", dimension: "D", name: "AI 风险预测", weight: 0.2, needsLab: true, desc: "基于 AI 的疾病风险预测结果" },
  { key: "D5", dimension: "D", name: "管理依从性", weight: 0.1, needsLab: false, desc: "健康管理计划依从程度" },
];

/** 按维度分组 */
export const SUB_BY_DIMENSION: Record<string, SubIndicator[]> = SUB_INDICATORS.reduce(
  (acc, s) => {
    (acc[s.dimension] = acc[s.dimension] || []).push(s);
    return acc;
  },
  {} as Record<string, SubIndicator[]>
);

/** 所有需要检验/检查的二级指标 */
export const LAB_SUB_INDICATORS = SUB_INDICATORS.filter((s) => s.needsLab);

/** 可选的检验/检查项清单（用于评估开始前询问用户有哪些报告） */
export interface LabCheckItem {
  /** 关联的二级指标 key */
  subKey: string;
  /** 名称 */
  name: string;
  /** 所属维度 */
  dimension: string;
  /** 说明 */
  desc: string;
  /** 涉及的具体检验指标 */
  tests: string;
  /** 是否推荐（强烈建议做） */
  recommended: boolean;
}

export const LAB_CHECKLIST: LabCheckItem[] = [
  { subKey: "B2", dimension: "B", name: "表观遗传/衰老时钟检测", desc: "基于 DNA 甲基化的生物年龄评估", tests: "DNA甲基化检测、端粒长度", recommended: true },
  { subKey: "B3", dimension: "B", name: "炎症标志物检测", desc: "评估慢性炎症水平", tests: "hs-CRP、IL-6、TNF-α", recommended: true },
  { subKey: "M1", dimension: "M", name: "血糖代谢检测", desc: "评估糖代谢与糖尿病风险", tests: "空腹血糖、糖化血红蛋白 HbA1c", recommended: true },
  { subKey: "M2", dimension: "M", name: "血脂检测", desc: "评估动脉粥样硬化风险", tests: "LDL-C、ApoB、总胆固醇、甘油三酯", recommended: true },
  { subKey: "M3", dimension: "M", name: "血压测量", desc: "评估心血管风险", tests: "收缩压、舒张压", recommended: false },
  { subKey: "M5", dimension: "M", name: "肝肾功能检测", desc: "评估代谢与脏器功能", tests: "ALT、AST、肌酐、eGFR、尿酸", recommended: true },
  { subKey: "F2", dimension: "F", name: "步速/步行测试", desc: "评估躯体运动功能", tests: "6分钟步行、步速", recommended: false },
  { subKey: "F3", dimension: "F", name: "握力测量", desc: "评估肌肉力量", tests: "握力计", recommended: false },
  { subKey: "F4", dimension: "F", name: "平衡能力测试", desc: "评估跌倒风险", tests: "单腿站立、Berg量表", recommended: false },
  { subKey: "F5", dimension: "F", name: "认知功能筛查", desc: "评估认知能力", tests: "MoCA、MMSE", recommended: true },
  { subKey: "D3", dimension: "D", name: "历史健康数据", desc: "既往体检指标趋势", tests: "连续 2-3 年体检报告", recommended: false },
];
