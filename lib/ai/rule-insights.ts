import type { AssessmentResult } from "@/lib/chli-model";
import { RISK_META } from "@/lib/chli-model";

/** 基于规则的本地解读生成（AI 不可用时的兜底） */
export function generateRuleInsights(r: AssessmentResult): string {
  const meta = RISK_META[r.level];
  const lines: string[] = [];

  // 总体评估
  lines.push(`## 总体评估`);
  lines.push(
    `您的综合长寿指数为 **${r.chliScore.toFixed(1)} 分**，健康等级为 **「${r.label}」**。${meta.description}`
  );
  lines.push("");

  // 生物年龄
  const gap = r.bioAge.ageGap;
  lines.push(`## 生物年龄分析`);
  if (gap < -2) {
    lines.push(`您的生物年龄（${r.bioAge.biologicalAge} 岁）比实际年龄年轻 **${Math.abs(gap)} 岁**，表明身体衰老速度较慢，处于积极状态，请继续保持健康的生活方式。`);
  } else if (gap > 2) {
    lines.push(`您的生物年龄（${r.bioAge.biologicalAge} 岁）比实际年龄大 **${gap} 岁**，提示衰老速度相对偏快，建议重点从作息、运动与代谢入手进行干预。`);
  } else {
    lines.push(`您的生物年龄（${r.bioAge.biologicalAge} 岁）与实际年龄基本相当，处于正常衰老轨道，可通过优化生活方式进一步延缓衰老。`);
  }
  lines.push("");

  // 维度排序
  const sorted = [...r.dimensions].sort((a, b) => b.score - a.score);
  const strength = sorted[0];
  const weak = sorted[sorted.length - 1];

  lines.push(`## 优势维度`);
  lines.push(`得分最高的维度是 **${strength.name}**（${strength.score.toFixed(1)} 分），这是您健康寿命的重要支撑，值得肯定与保持。`);
  lines.push("");

  lines.push(`## 重点关注`);
  if (weak.score < 55) {
    lines.push(`当前最需关注的维度是 **${weak.name}**（${weak.score.toFixed(1)} 分），该维度对整体健康影响较大，建议优先改善。`);
  } else if (weak.score < 70) {
    lines.push(`相对薄弱的维度是 **${weak.name}**（${weak.score.toFixed(1)} 分），仍有提升空间，可结合自身情况针对性优化。`);
  } else {
    lines.push(`各维度表现较为均衡，${weak.name}（${weak.score.toFixed(1)} 分）为相对较低项，可适当加强。`);
  }
  lines.push("");

  // 建议
  lines.push(`## 改善建议`);
  const tips = buildTips(weak.key, sorted.map((s) => s.key));
  tips.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  lines.push("");

  // 结束语
  lines.push(`## 健康展望`);
  lines.push(
    `长寿并非单一因素决定，而是多系统协同的结果。坚持科学管理、定期监测，多数可干预的风险因素都能得到改善。愿您以健康之姿，从容走向高质量百岁人生。`
  );
  lines.push("");
  lines.push(`> 温馨提示：本报告由系统自动生成，仅供参考，不构成医疗诊断建议。`);

  return lines.join("\n");
}

function buildTips(weakKey: string, keys: string[]): string[] {
  const tips: Record<string, string[]> = {
    B: [
      "每年进行一次全面的生物标志物检测（血压、血糖、血脂、炎症因子等），追踪身体年龄变化",
      "通过规律运动、优质睡眠和抗炎饮食，从根源延缓生物衰老",
    ],
    F: [
      "保持每周至少 150 分钟的中等强度运动（快走、游泳、骑行等），增强心肺与肌肉功能",
      "进行力量训练与平衡训练（如深蹲、单腿站立），预防肌肉流失与跌倒风险",
      "坚持认知训练（阅读、拼图、学习新技能），维护大脑活力",
    ],
    M: [
      "将 BMI 控制在 18.5-24 的理想范围，减少内脏脂肪",
      "严格管理血压、血糖、血脂，遵医嘱用药并定期复查",
      "采用地中海式饮食（全谷物、蔬果、优质蛋白、健康脂肪），控制钠盐与精制糖摄入",
    ],
    L: [
      "保证每晚 7-8 小时高质量睡眠，固定作息时间",
      "戒烟限酒，减少压力源，练习正念或冥想舒缓情绪",
      "坚持均衡饮食，减少高油、高糖、高盐加工食品",
    ],
    P: [
      "保持积极情绪，建立规律的社交活动，降低孤独感",
      "持续学习与思考，参加社区活动或兴趣小组，维护认知与心理活力",
    ],
    D: [
      "坚持每年 1 次体检，有慢病者遵医嘱增加监测频率",
      "善用可穿戴设备记录心率、睡眠、活动等健康数据，建立个人健康档案",
    ],
  };

  const primary = tips[weakKey] || [];
  const otherKeys = keys.filter((k) => k !== weakKey);
  const secondary = otherKeys.slice(0, 2).flatMap((k) => (tips[k] ? [tips[k][0]] : []));
  return [...primary, ...secondary].slice(0, 5);
}
