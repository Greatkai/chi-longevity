import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { AssessmentResult } from "@/lib/chli-model";
import { RISK_META } from "@/lib/chli-model";
import { generateRuleInsights } from "@/lib/ai/rule-insights";

export type ExportFormat = "png" | "jpeg" | "pdf";

/** 风险等级颜色映射 */
const LEVEL_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#3186D8",
  moderate: "#F59E0B",
  risk: "#F97316",
  highRisk: "#EF4444",
};

/** 生成报告区域的高清图片 */
async function captureImage(element: HTMLElement, format: "png" | "jpeg"): Promise<string> {
  const width = Math.max(element.scrollWidth, 900);
  const options = {
    quality: 1,
    pixelRatio: 2,
    width,
    style: {
      transform: "scale(1)",
    },
  };
  return format === "png" ? toPng(element, options) : toJpeg(element, options);
}

/** 网页版导出（PNG / JPEG 网页截图；PDF 为 A4 排版设计版） */
export async function exportReport(
  element: HTMLElement,
  format: ExportFormat,
  result?: AssessmentResult,
  filename = "长寿评估报告"
): Promise<void> {
  if (format === "png" || format === "jpeg") {
    const dataUrl = await captureImage(element, format);
    const link = document.createElement("a");
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
    return;
  }

  // PDF：基于 A4 纸重新排版设计（非网页截图）
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const pages = await generateA4Pages(result, siteUrl);
  const pdf = new jsPDF("p", "pt", "a4");
  pages.forEach((dataUrl, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, 0, 794, 1123);
  });
  pdf.save(`${filename}.pdf`);
}

/* ==================== 手机端分享长图（Canvas 绘制） ==================== */

/** 圆角矩形路径 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 绘制多行文本（自动换行），返回结束 y */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const chars = Array.from(text);
  let line = "";
  let cy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

/** 用 Canvas 原生绘制手机分享长图，彻底避免 html-to-image 空白问题 */
export async function exportShareImage(
  result: AssessmentResult,
  siteUrl = "https://chi-longevity.bmaxkai.me"
): Promise<void> {
  const W = 750;
  // 固定各区块高度
  const headerH = 220;
  const bodyH = 560;
  const footerH = 300;
  const H = headerH + bodyH + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 不支持");

  const levelColor = LEVEL_COLORS[result.level] || "#3186D8";
  const score = Math.round(result.chliScore);
  const dims = result.dimensions;

  /* ---------- 顶部渐变区 ---------- */
  const grad = ctx.createLinearGradient(0, 0, W, headerH);
  grad.addColorStop(0, "#042A4D");
  grad.addColorStop(0.45, "#0A5BA8");
  grad.addColorStop(1, "#3186D8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerH);

  // 品牌徽标（胶囊）
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundRect(ctx, W / 2 - 165, 40, 330, 46, 23);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 24px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("百岁白皮书 · 长寿指数评估", W / 2, 70);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "20px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("中国百岁健康标准指数（CHLI）", W / 2, 108);

  // 综合指数
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("综合长寿指数", W / 2, 152);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 96px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText(String(score), W / 2 - 40, 208);
  ctx.font = "500 30px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("/ 100", W / 2 + 90, 200);

  /* ---------- 内容主体 ---------- */
  ctx.fillStyle = "#F0F6FC";
  ctx.fillRect(0, headerH, W, bodyH);

  // 白色卡片
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(6,61,112,0.10)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, 32, headerH + 30, W - 64, bodyH - 60, 18);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = "#12232E";
  ctx.font = "700 26px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("六大维度得分", 56, headerH + 74);

  // 维度条形
  const barStartX = 210;
  const barW = W - 64 - barStartX - 80 - 20;
  const rowH = 74;
  const startY = headerH + 108;
  ctx.font = "600 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  dims.forEach((d, i) => {
    const c = LEVEL_COLORS[d.level] || "#3186D8";
    const s = Math.round(d.score);
    const y = startY + i * rowH;

    // 维度名
    ctx.fillStyle = "#12232E";
    ctx.textAlign = "left";
    ctx.fillText(`${d.key} · ${d.name}`, 56, y);

    // 条形背景
    ctx.fillStyle = "#DCE9F8";
    roundRect(ctx, barStartX, y - 16, barW, 22, 11);
    ctx.fill();
    // 条形填充
    ctx.fillStyle = c;
    const fillW = Math.max(0, (s / 100) * barW);
    if (fillW > 0) {
      roundRect(ctx, barStartX, y - 16, fillW, 22, 11);
      ctx.fill();
    }
    // 分数
    ctx.fillStyle = "#12232E";
    ctx.textAlign = "right";
    ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(String(s), W - 64, y);
  });

  /* ---------- 底部：二维码 ---------- */
  ctx.fillStyle = "#F0F6FC";
  ctx.fillRect(0, headerH + bodyH, W, footerH);
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 100, headerH + bodyH + 24, W - 200, footerH - 68, 18);
  ctx.fill();

  // 加载二维码图片并绘制
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 220,
    margin: 1,
    color: { dark: "#063D70", light: "#FFFFFF" },
  });
  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => resolve();
    qrImg.src = qrDataUrl;
  });

  const qrY = headerH + bodyH + 52;
  ctx.drawImage(qrImg, 130, qrY, 180, 180);

  ctx.textAlign = "left";
  ctx.fillStyle = "#0A5BA8";
  ctx.font = "700 26px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("扫码查看完整报告", 340, qrY + 46);

  ctx.fillStyle = "#8494A6";
  ctx.font = "20px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("百岁白皮书 · CHLI 长寿评估", 340, qrY + 84);

  ctx.fillStyle = "#55677A";
  ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
  wrapText(ctx, siteUrl, 340, qrY + 120, W - 340 - 60, 26);

  // 免责声明
  ctx.fillStyle = "#8494A6";
  ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("健康数据仅供参考，不构成医疗建议 · 请及时就医", W / 2, headerH + bodyH + footerH - 24);

  // 导出
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "长寿指数分享.png";
  link.href = dataUrl;
  link.click();
}

/* ==================== A4 PDF 排版（Canvas 绘制） ==================== */

const A4W = 794;
const A4H = 1123;
const SCALE = 2; // 高清

/** 创建一个 A4 比例的画布 */
function createA4Canvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = A4W * SCALE;
  canvas.height = A4H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  return { canvas, ctx };
}

/** 绘制 A4 页面页眉 */
function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string, page: number) {
  // 顶部品牌渐变条
  const grad = ctx.createLinearGradient(0, 0, A4W, 0);
  grad.addColorStop(0, "#042A4D");
  grad.addColorStop(0.5, "#0A5BA8");
  grad.addColorStop(1, "#3186D8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, A4W, 108);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("百岁白皮书 · 长寿指数评估报告", 48, 52);
  ctx.font = "14px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("中国百岁健康标准指数（CHLI）", 48, 82);
  ctx.textAlign = "right";
  ctx.fillText(`${page}`, A4W - 48, 52);

  // 页面标题
  ctx.fillStyle = "#0A5BA8";
  ctx.font = "700 26px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 48, 160);
  ctx.fillStyle = "#8494A6";
  ctx.font = "14px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText(subtitle, 48, 188);
  // 标题下划线
  ctx.strokeStyle = "rgba(49,134,216,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 202);
  ctx.lineTo(A4W - 48, 202);
  ctx.stroke();
}

/** 绘制 A4 页脚 */
function drawFooter(ctx: CanvasRenderingContext2D, page: number) {
  ctx.fillStyle = "#8494A6";
  ctx.font = "12px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("本报告由「百岁白皮书」系统自动生成 · 仅供参考，不构成医疗诊断建议", A4W / 2, A4H - 36);
  ctx.fillText(`第 ${page} 页 · © 2026 百岁白皮书`, A4W / 2, A4H - 18);
}

/** 生成 A4 排版的多页图片（供 jsPDF 使用） */
export async function generateA4Pages(
  result?: AssessmentResult,
  siteUrl = ""
): Promise<string[]> {
  if (!result) return [];
  const meta = RISK_META[result.level];
  const levelColor = LEVEL_COLORS[result.level] || "#3186D8";
  const score = Math.round(result.chliScore);
  const dims = result.dimensions;
  const pages: string[] = [];

  /* ========== 第 1 页：封面 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#F4F8FC";
    ctx.fillRect(0, 0, A4W, A4H);

    // 顶部大渐变区
    const grad = ctx.createLinearGradient(0, 0, A4W, 0);
    grad.addColorStop(0, "#042A4D");
    grad.addColorStop(0.5, "#0A5BA8");
    grad.addColorStop(1, "#3186D8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, A4W, 360);

    // 品牌
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    roundRect(ctx, 48, 48, 320, 46, 23);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 20px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🏥 百岁白皮书 · 长寿指数评估", 68, 78);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("中国百岁健康标准指数（CHLI）评估报告", 48, 112);

    // 报告标题
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 40px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("综合长寿指数", A4W / 2, 210);

    // 综合指数大数字
    ctx.font = "800 140px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(String(score), A4W / 2 - 70, 330);
    ctx.font = "500 36px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("/ 100", A4W / 2 + 150, 320);

    // 等级标签
    ctx.fillStyle = levelColor;
    roundRect(ctx, A4W / 2 - 80, 345, 160, 44, 22);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 20px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(`健康等级：${result.label}`, A4W / 2, 373);

    // 生物年龄对比
    ctx.textAlign = "left";
    ctx.fillStyle = "#12232E";
    ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("生物年龄对比", 48, 430);

    const cardW = (A4W - 48 * 2 - 24) / 2;
    const cardY = 450;
    const cardH = 150;
    // 实际年龄卡
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(6,61,112,0.1)";
    ctx.shadowBlur = 12;
    roundRect(ctx, 48, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#8494A6";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("实际年龄", 48 + cardW / 2, cardY + 48);
    ctx.fillStyle = "#12232E";
    ctx.font = "700 52px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(String(result.bioAge.actualAge), 48 + cardW / 2 - 30, cardY + 120);
    ctx.font = "22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillStyle = "#8494A6";
    ctx.fillText("岁", 48 + cardW / 2 + 70, cardY + 112);

    // 生物年龄卡
    ctx.fillStyle = `${levelColor}12`;
    roundRect(ctx, 48 + cardW + 24, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.fillStyle = "#8494A6";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("生物年龄", 48 + cardW + 24 + cardW / 2, cardY + 48);
    ctx.fillStyle = levelColor;
    ctx.font = "700 52px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText(String(result.bioAge.biologicalAge), 48 + cardW + 24 + cardW / 2 - 30, cardY + 120);
    ctx.fillStyle = "#8494A6";
    ctx.font = "22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("岁", 48 + cardW + 24 + cardW / 2 + 70, cardY + 112);

    // 年龄差说明
    const gap = result.bioAge.ageGap;
    ctx.textAlign = "left";
    ctx.fillStyle = levelColor;
    ctx.font = "600 18px 'PingFang SC','Microsoft YaHei',sans-serif";
    const gapText =
      gap < 0
        ? `您的生物年龄比实际年龄年轻 ${Math.abs(gap)} 岁，衰老速度较慢，健康潜力良好。`
        : gap > 2
        ? `您的生物年龄比实际年龄大 ${gap} 岁，提示衰老速度偏快，建议加强健康干预。`
        : `您的生物年龄与实际年龄相当，处于正常衰老轨道。`;
    ctx.fillText(gapText, 48, 660);

    // 描述
    ctx.fillStyle = "#55677A";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    wrapText(ctx, meta.description, 48, 700, A4W - 96, 28);

    // 底部二维码 + 网址
    const qrDataUrl = await QRCode.toDataURL(siteUrl, {
      width: 160,
      margin: 1,
      color: { dark: "#063D70", light: "#FFFFFF" },
    });
    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => resolve();
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, 48, 780, 110, 110);
    ctx.fillStyle = "#0A5BA8";
    ctx.font = "700 18px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("扫码查看完整报告", 180, 830);
    ctx.fillStyle = "#55677A";
    ctx.font = "14px 'PingFang SC','Microsoft YaHei',sans-serif";
    wrapText(ctx, siteUrl, 180, 862, A4W - 180 - 60, 24);

    // 免责声明
    ctx.fillStyle = "#8494A6";
    ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("本报告由系统自动生成，仅供参考，不构成医疗诊断建议 · 如有健康问题请及时就医", A4W / 2, A4H - 30);

    pages.push(canvas.toDataURL("image/png"));
  }

  /* ========== 第 2 页：维度得分 + 优势/关注 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#F4F8FC";
    ctx.fillRect(0, 0, A4W, A4H);
    drawHeader(ctx, "六大维度得分", "各维度得分与风险等级（满分 100 分）", 2);

    const barStartX = 200;
    const barW = A4W - 48 * 2 - barStartX - 80;
    const rowH = 88;
    const startY = 260;
    dims.forEach((d, i) => {
      const c = LEVEL_COLORS[d.level] || "#3186D8";
      const s = Math.round(d.score);
      const y = startY + i * rowH;

      ctx.fillStyle = "#12232E";
      ctx.font = "600 18px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${d.key} · ${d.name}`, 48, y);

      // 背景条
      ctx.fillStyle = "#DCE9F8";
      roundRect(ctx, barStartX, y - 16, barW, 26, 13);
      ctx.fill();
      // 填充
      ctx.fillStyle = c;
      const fillW = Math.max(0, (s / 100) * barW);
      if (fillW > 0) {
        roundRect(ctx, barStartX, y - 16, fillW, 26, 13);
        ctx.fill();
      }
      // 分数
      ctx.fillStyle = "#12232E";
      ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(s), A4W - 48, y);
    });

    // 优势 / 重点关注
    const sorted = [...dims].sort((a, b) => b.score - a.score);
    const strong = sorted[0];
    const weak = sorted[sorted.length - 1];

    let y = startY + dims.length * rowH + 40;
    // 优势
    ctx.fillStyle = "#10B981";
    ctx.font = "700 20px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("优势维度", 48, y);
    ctx.fillStyle = "#55677A";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    wrapText(ctx, `得分最高的维度是「${strong.name}」（${strong.score.toFixed(1)} 分），是您健康寿命的重要支撑。`, 48, y + 30, A4W - 96, 26);

    y += 110;
    // 关注
    ctx.fillStyle = "#F59E0B";
    ctx.font = "700 20px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("重点关注", 48, y);
    ctx.fillStyle = "#55677A";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    wrapText(ctx, `相对薄弱的维度是「${weak.name}」（${weak.score.toFixed(1)} 分），建议优先改善以提升整体指数。`, 48, y + 30, A4W - 96, 26);

    drawFooter(ctx, 2);
    pages.push(canvas.toDataURL("image/png"));
  }

  /* ========== 第 3 页：改善建议 + 解读 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#F4F8FC";
    ctx.fillRect(0, 0, A4W, A4H);
    drawHeader(ctx, "个性化改善建议", "基于您的评估结果生成的重点行动建议", 3);

    const insights = generateRuleInsights(result);
    const lines = insights.split("\n");
    let y = 250;
    ctx.textAlign = "left";
    const maxW = A4W - 96;
    for (const line of lines) {
      if (y > A4H - 120) break;
      if (line.startsWith("## ")) {
        y += 24;
        ctx.fillStyle = "#0A5BA8";
        ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText(line.replace("## ", ""), 48, y);
        y += 14;
      } else if (line.startsWith("> ")) {
        y += 6;
        ctx.fillStyle = "#8494A6";
        ctx.font = "14px 'PingFang SC','Microsoft YaHei',sans-serif";
        y = wrapText(ctx, line.replace("> ", ""), 48, y, maxW, 24);
        y += 10;
      } else if (/^\d+\.\s/.test(line)) {
        y += 4;
        ctx.fillStyle = "#55677A";
        ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
        y = wrapText(ctx, line, 48, y, maxW, 26);
        y += 8;
      } else if (line.trim() === "") {
        y += 16;
      } else if (line.startsWith("- ")) {
        y += 4;
        ctx.fillStyle = "#55677A";
        ctx.font = "15px 'PingFang SC','Microsoft YaHei',sans-serif";
        y = wrapText(ctx, line, 48, y, maxW, 26);
        y += 6;
      } else {
        ctx.fillStyle = "#55677A";
        ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
        y = wrapText(ctx, line, 48, y, maxW, 26);
        y += 6;
      }
      if (y > A4H - 140) {
        // 已满，进入下一页（简化：停止）
        break;
      }
    }

    drawFooter(ctx, 3);
    pages.push(canvas.toDataURL("image/png"));
  }

  return pages;
}
