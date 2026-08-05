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

/** 网页版导出（PNG / JPEG 网页截图；PDF 为 A4 文档排版） */
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

  // PDF：A4 文档式排版
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const pages = await generateA4Pages(result, siteUrl);
  const pdf = new jsPDF("p", "pt", "a4");
  pages.forEach((dataUrl, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "JPEG", 0, 0, 794, 1123);
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
  const headerH = 480;
  const bodyH = 580;
  const footerH = 340;
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
  grad.addColorStop(1, "#3186D6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerH);

  // 装饰网格纹理
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, headerH);
    ctx.stroke();
  }
  for (let y = 0; y < headerH; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // 装饰光晕
  const glowGrad = ctx.createRadialGradient(W / 2, 270, 30, W / 2, 270, 180);
  glowGrad.addColorStop(0, "rgba(255,255,255,0.18)");
  glowGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(W / 2, 270, 180, 0, Math.PI * 2);
  ctx.fill();

  // 品牌徽标（去掉医疗十字标，纯文字居中）
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  roundRect(ctx, W / 2 - 200, 50, 400, 56, 28);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 26px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("百岁白皮书 · 长寿指数评估", W / 2, 79);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("中国百岁健康标准指数（CHLI）", W / 2, 132);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("综合长寿指数", W / 2, 180);

  // 大数字（精确居中）
  const slashGap = 14;
  ctx.font = "800 120px 'PingFang SC','Microsoft YaHei',sans-serif";
  const scoreText = String(score);
  const scoreW = ctx.measureText(scoreText).width;
  ctx.font = "500 34px 'PingFang SC','Microsoft YaHei',sans-serif";
  const slashText = "/ 100";
  const slashW = ctx.measureText(slashText).width;
  const totalW = scoreW + slashGap + slashW;
  const startX = (W - totalW) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "800 120px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(scoreText, startX, 300);
  ctx.font = "500 34px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(slashText, startX + scoreW + slashGap, 286);

  // 等级标签
  ctx.font = "700 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  const labelText = `健康等级 · ${result.label}`;
  const labelTextW = ctx.measureText(labelText).width;
  const tagW = labelTextW + 40;
  ctx.fillStyle = levelColor;
  roundRect(ctx, (W - tagW) / 2, 332, tagW, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labelText, W / 2, 358);

  // 分享金句
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "italic 22px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`「 ${pickShareQuote(result)} 」`, W / 2, 418);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "17px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("—— 测一测你的长寿指数，扫码测一测 ——", W / 2, 452);

  /* ---------- 内容主体 ---------- */
  ctx.fillStyle = "#F0F6FC";
  ctx.fillRect(0, headerH, W, bodyH);

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
  ctx.font = "700 28px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("六大维度得分", 56, headerH + 78);

  const labelW = 280;
  const barStartX = 56 + labelW + 24;
  const scoreW2 = 80;
  const barW = W - 56 * 2 - labelW - 24 - scoreW2;
  const rowH = 72;
  const startY = headerH + 116;
  dims.forEach((d, i) => {
    const c = LEVEL_COLORS[d.level] || "#3186D8";
    const s = Math.round(d.score);
    const y = startY + i * rowH;

    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(40, y - 6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#12232E";
    ctx.font = "600 22px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${d.key} · ${d.name}`, 56, y);

    ctx.fillStyle = "#DCE9F8";
    roundRect(ctx, barStartX, y - 18, barW, 24, 12);
    ctx.fill();
    ctx.fillStyle = c;
    const fillW = Math.max(0, (s / 100) * barW);
    if (fillW > 0) {
      roundRect(ctx, barStartX, y - 18, fillW, 24, 12);
      ctx.fill();
    }
    ctx.fillStyle = "#12232E";
    ctx.font = "700 24px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(s), W - 56, y);
  });

  /* ---------- 底部：二维码 ---------- */
  ctx.fillStyle = "#F0F6FC";
  ctx.fillRect(0, headerH + bodyH, W, footerH);

  const cardW = W - 160;
  const cardX = 80;
  const cardY = headerH + bodyH + 36;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(6,61,112,0.10)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, cardX, cardY, cardW, footerH - 92, 18);
  ctx.fill();
  ctx.shadowColor = "transparent";

  const qrUrl = `${siteUrl}/questionnaire`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#063D70", light: "#FFFFFF" },
  });
  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => resolve();
    qrImg.src = qrDataUrl;
  });

  const qrSize = 180;
  const qrPadTop = 30;
  ctx.drawImage(qrImg, cardX + 40, cardY + qrPadTop, qrSize, qrSize);

  const textX = cardX + 40 + qrSize + 32;
  const textCenterY = cardY + qrPadTop + qrSize / 2;
  ctx.textBaseline = "alphabetic";

  ctx.textAlign = "left";
  ctx.fillStyle = "#0A5BA8";
  ctx.font = "700 30px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("扫码立即测试", textX, textCenterY - 36);

  ctx.fillStyle = "#55677A";
  ctx.font = "20px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.fillText("你也来测一测自己的", textX, textCenterY - 6);
  ctx.fillText("健康寿命指数", textX, textCenterY + 22);

  ctx.fillStyle = "#8494A6";
  ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
  const urlMaxW = cardX + cardW - 40 - textX;
  wrapText(ctx, qrUrl, textX, textCenterY + 58, urlMaxW, 22);

  ctx.fillStyle = "#8494A6";
  ctx.font = "17px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("健康数据仅供参考，不构成医疗建议 · 请及时就医", W / 2, headerH + bodyH + footerH - 32);

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "长寿指数分享.png";
  link.href = dataUrl;
  link.click();
}

/** 根据综合指数与等级挑选一条分享金句 */
function pickShareQuote(r: AssessmentResult): string {
  if (r.level === "excellent") return "健康长寿，由点滴积累而成";
  if (r.level === "good") return "今天的好习惯，是明天的健康资产";
  if (r.level === "moderate") return "读懂身体信号，开启改善之旅";
  if (r.level === "highRisk") return "健康管理，从一次评估开始";
  return "好的身体，是最值得投资的长寿";
}

/* ==================== A4 PDF 文档排版（Canvas 绘制） ==================== */

const A4W = 794;
const A4H = 1123;
const SCALE = 1.5;
const MARGIN = 56;

function createA4Canvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = A4W * SCALE;
  canvas.height = A4H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  return { canvas, ctx };
}

/** 文档页眉 */
function drawDocHeader(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0A5BA8";
  ctx.fillRect(0, 0, A4W, 6);
  ctx.fillStyle = "#55677A";
  ctx.font = "11px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("百岁白皮书 · 长寿指数评估报告", MARGIN, 32);
  ctx.textAlign = "right";
  ctx.fillText("CHLI 健康评估", A4W - MARGIN, 32);
  ctx.strokeStyle = "#DCE9F8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, 42);
  ctx.lineTo(A4W - MARGIN, 42);
  ctx.stroke();
}

/** 文档页脚 */
function drawDocFooter(ctx: CanvasRenderingContext2D, page: number, total: number, dateStr: string) {
  const fy = A4H - 40;
  ctx.strokeStyle = "#DCE9F8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, fy - 12);
  ctx.lineTo(A4W - MARGIN, fy - 12);
  ctx.stroke();
  ctx.fillStyle = "#8494A6";
  ctx.font = "10px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`生成日期：${dateStr}`, MARGIN, fy);
  ctx.textAlign = "center";
  ctx.fillText("本报告仅供参考，不构成医疗诊断建议", A4W / 2, fy);
  ctx.textAlign = "right";
  ctx.fillText(`第 ${page} 页 / 共 ${total} 页`, A4W - MARGIN, fy);
}

/** 章节标题（带编号方块） */
function drawSectionTitle(ctx: CanvasRenderingContext2D, num: string, title: string, y: number): number {
  ctx.fillStyle = "#0A5BA8";
  roundRect(ctx, MARGIN, y - 18, 32, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 16px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(num, MARGIN + 16, y - 4);
  ctx.fillStyle = "#12232E";
  ctx.font = "700 20px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(title, MARGIN + 44, y);
  ctx.strokeStyle = "#0A5BA8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y + 12);
  ctx.lineTo(A4W - MARGIN, y + 12);
  ctx.stroke();
  return y + 36;
}

/** 段落正文（首行缩进） */
function drawParagraph(ctx: CanvasRenderingContext2D, text: string, y: number, indent = true): number {
  ctx.fillStyle = "#2B3A48";
  ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const prefix = indent ? "    " : "";
  return wrapText(ctx, prefix + text, MARGIN, y, A4W - MARGIN * 2, 24);
}

/** 表格行 */
function drawTableRow(
  ctx: CanvasRenderingContext2D,
  cols: { text: string; x: number; align: "left" | "center" | "right" }[],
  y: number,
  rowH: number,
  isHeader = false,
  isAlt = false
) {
  ctx.fillStyle = isHeader ? "#0A5BA8" : isAlt ? "#F0F6FC" : "#FFFFFF";
  ctx.fillRect(MARGIN, y, A4W - MARGIN * 2, rowH);
  ctx.fillStyle = isHeader ? "#FFFFFF" : "#2B3A48";
  ctx.font = isHeader ? "600 13px 'PingFang SC','Microsoft YaHei',sans-serif" : "13px 'PingFang SC','Microsoft YaHei',sans-serif";
  ctx.textBaseline = "middle";
  cols.forEach((col) => {
    ctx.textAlign = col.align;
    ctx.fillText(col.text, col.x, y + rowH / 2);
  });
  ctx.strokeStyle = "#DCE9F8";
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN, y, A4W - MARGIN * 2, rowH);
}

/** 生成 A4 文档式排版的多页图片 */
export async function generateA4Pages(
  result?: AssessmentResult,
  siteUrl = ""
): Promise<string[]> {
  if (!result) return [];
  const meta = RISK_META[result.level];
  const levelColor = LEVEL_COLORS[result.level] || "#3186D8";
  const score = Math.round(result.chliScore);
  const dims = result.dimensions;
  const dateStr = new Date(result.createdAt || Date.now()).toLocaleDateString("zh-CN");
  const pages: string[] = [];
  const TOTAL = 4;

  /* ========== 第 1 页：封面 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4W, A4H);

    // 顶部品牌色块
    const grad = ctx.createLinearGradient(0, 0, 0, 450);
    grad.addColorStop(0, "#042A4D");
    grad.addColorStop(0.6, "#0A5BA8");
    grad.addColorStop(1, "#3186D8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, A4W, 450);

    // 品牌标识（去掉医疗十字，纯文字）
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 16px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("百岁白皮书 · CHLI", MARGIN, 62);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("中国百岁健康标准指数", A4W - MARGIN, 62);

    // 主标题
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 44px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("长寿指数评估报告", A4W / 2, 200);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "18px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("Longevity Health Assessment Report", A4W / 2, 236);

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(A4W / 2 - 120, 270);
    ctx.lineTo(A4W / 2 + 120, 270);
    ctx.stroke();

    // 综合指数
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "16px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("综合长寿指数", A4W / 2, 310);

    ctx.font = "800 90px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillStyle = "#FFFFFF";
    const numW = ctx.measureText(String(score)).width;
    ctx.fillText(String(score), A4W / 2, 390);
    ctx.font = "500 28px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "left";
    ctx.fillText("/ 100", A4W / 2 + numW / 2 + 8, 386);

    // 等级标签
    ctx.textAlign = "center";
    ctx.font = "700 18px 'PingFang SC','Microsoft YaHei',sans-serif";
    const lvText = `健康等级：${result.label}`;
    const lvW = ctx.measureText(lvText).width;
    ctx.fillStyle = levelColor;
    roundRect(ctx, (A4W - lvW - 40) / 2, 410, lvW + 40, 32, 16);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(lvText, A4W / 2, 431);

    // 信息表格
    let y = 500;
    ctx.fillStyle = "#12232E";
    ctx.font = "700 18px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("报告信息", MARGIN, y);
    ctx.strokeStyle = "#DCE9F8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y + 8);
    ctx.lineTo(A4W - MARGIN, y + 8);
    ctx.stroke();

    y += 30;
    const infoRows: [string, string][] = [
      ["报告名称", "长寿指数评估报告"],
      ["评估模型", "中国百岁健康标准指数（CHLI）"],
      ["生成日期", dateStr],
      ["综合指数", `${score} / 100`],
      ["健康等级", result.label],
      ["实际年龄", `${result.bioAge.actualAge} 岁`],
      ["生物年龄", `${result.bioAge.biologicalAge} 岁`],
    ];
    infoRows.forEach((row, i) => {
      const ry = y + i * 32;
      ctx.fillStyle = i % 2 === 0 ? "#F8FBFD" : "#FFFFFF";
      ctx.fillRect(MARGIN, ry, A4W - MARGIN * 2, 32);
      ctx.fillStyle = "#8494A6";
      ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(row[0], MARGIN + 16, ry + 16);
      ctx.fillStyle = "#12232E";
      ctx.font = "600 13px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.fillText(row[1], MARGIN + 160, ry + 16);
      ctx.strokeStyle = "#E8F0FA";
      ctx.strokeRect(MARGIN, ry, A4W - MARGIN * 2, 32);
    });

    // 保密说明
    y = A4H - 120;
    ctx.fillStyle = "#F0F6FC";
    roundRect(ctx, MARGIN, y, A4W - MARGIN * 2, 70, 8);
    ctx.fill();
    ctx.fillStyle = "#55677A";
    ctx.font = "12px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    wrapText(ctx, "保密说明：本报告含个人健康评估信息，仅供本人参考。报告由「百岁白皮书」系统基于 CHLI 模型自动生成，不构成医疗诊断建议，如有健康问题请及时就医。", MARGIN + 16, y + 26, A4W - MARGIN * 2 - 32, 20);

    pages.push(canvas.toDataURL("image/jpeg", 0.92));
  }

  /* ========== 第 2 页：综合评估结果 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4W, A4H);
    drawDocHeader(ctx);

    let y = 80;
    y = drawSectionTitle(ctx, "一", "综合评估结果", y);
    y = drawParagraph(ctx, `根据中国百岁健康标准指数（CHLI）评估模型，您的综合长寿指数为 ${score} 分（满分 100 分），健康等级评定为「${result.label}」。${meta.description}`, y + 6);
    y += 16;

    ctx.fillStyle = "#0A5BA8";
    ctx.font = "700 15px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("1.1 生物年龄对比", MARGIN, y);
    y += 24;

    const bioRows = [
      [{ text: "指标", x: MARGIN + 100, align: "center" as const }, { text: "数值", x: MARGIN + 280, align: "center" as const }, { text: "说明", x: MARGIN + 480, align: "center" as const }],
      [{ text: "实际年龄", x: MARGIN + 100, align: "center" as const }, { text: `${result.bioAge.actualAge} 岁`, x: MARGIN + 280, align: "center" as const }, { text: "出生至今的实际年限", x: MARGIN + 480, align: "center" as const }],
      [{ text: "生物年龄", x: MARGIN + 100, align: "center" as const }, { text: `${result.bioAge.biologicalAge} 岁`, x: MARGIN + 280, align: "center" as const }, { text: "基于生物标志物测算", x: MARGIN + 480, align: "center" as const }],
      [{ text: "年龄差值", x: MARGIN + 100, align: "center" as const }, { text: `${result.bioAge.ageGap > 0 ? "+" : ""}${result.bioAge.ageGap} 岁`, x: MARGIN + 280, align: "center" as const }, { text: result.bioAge.ageGap < 0 ? "生物年龄更年轻" : result.bioAge.ageGap > 2 ? "衰老速度偏快" : "基本相当", x: MARGIN + 480, align: "center" as const }],
    ];
    const bioRowH = 34;
    bioRows.forEach((row, i) => {
      drawTableRow(ctx, row, y + i * bioRowH, bioRowH, i === 0, i % 2 === 0 && i !== 0);
    });
    y += bioRows.length * bioRowH + 16;

    const gap = result.bioAge.ageGap;
    const gapDesc = gap < -2
      ? `您的生物年龄比实际年龄年轻 ${Math.abs(gap)} 岁，表明身体衰老速度较慢，细胞功能与身体机能处于同龄人优秀水平，这是长期健康生活方式的积极回报。`
      : gap > 2
      ? `您的生物年龄比实际年龄大 ${gap} 岁，提示身体衰老速度相对偏快，通常是生活方式、代谢状态或慢性压力长期累积的结果，但也意味着有较大的改善空间。`
      : `您的生物年龄与实际年龄基本相当，处于正常衰老轨道，基础健康状况良好。`;
    y = drawParagraph(ctx, gapDesc, y);
    y += 20;

    ctx.fillStyle = "#0A5BA8";
    ctx.font = "700 15px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("1.2 健康等级说明", MARGIN, y);
    y += 24;
    y = drawParagraph(ctx, `您当前的健康等级为「${result.label}」。${meta.description} 建议结合下方各维度分析，针对性改善薄弱环节，巩固优势维度，持续提升综合健康水平。`, y);

    drawDocFooter(ctx, 2, TOTAL, dateStr);
    pages.push(canvas.toDataURL("image/jpeg", 0.92));
  }

  /* ========== 第 3 页：六大维度分析 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4W, A4H);
    drawDocHeader(ctx);

    let y = 80;
    y = drawSectionTitle(ctx, "二", "六大维度分析", y);
    y = drawParagraph(ctx, "CHLI 综合指数由六大维度加权计算：生物年龄（20%）、功能健康（20%）、代谢慢病（20%）、生活方式（15%）、心理认知（10%）、数字健康（15%）。各维度得分如下：", y + 6);
    y += 12;

    const dimRowH = 36;
    const headerCols = [
      { text: "维度", x: MARGIN + 80, align: "center" as const },
      { text: "权重", x: MARGIN + 220, align: "center" as const },
      { text: "得分", x: MARGIN + 320, align: "center" as const },
      { text: "等级", x: MARGIN + 420, align: "center" as const },
      { text: "状态", x: MARGIN + 560, align: "center" as const },
    ];
    drawTableRow(ctx, headerCols, y, dimRowH, true);
    y += dimRowH;

    const sorted = [...dims].sort((a, b) => b.score - a.score);
    const strong = sorted[0];
    const weak = sorted[sorted.length - 1];
    dims.forEach((d, i) => {
      const dMeta = RISK_META[d.level];
      const levelLabel = d.level === "excellent" ? "优" : d.level === "good" ? "良" : d.level === "moderate" ? "中" : d.level === "risk" ? "风险" : "高风险";
      const rows = [
        { text: `${d.key} · ${d.name}`, x: MARGIN + 80, align: "center" as const },
        { text: `${(d.weight * 100).toFixed(0)}%`, x: MARGIN + 220, align: "center" as const },
        { text: `${Math.round(d.score)}`, x: MARGIN + 320, align: "center" as const },
        { text: levelLabel, x: MARGIN + 420, align: "center" as const },
        { text: dMeta.label, x: MARGIN + 560, align: "center" as const },
      ];
      drawTableRow(ctx, rows, y + i * dimRowH, dimRowH, false, i % 2 === 1);
    });
    y += dims.length * dimRowH + 20;

    ctx.fillStyle = "#10B981";
    ctx.font = "700 15px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("● 优势维度", MARGIN, y);
    y += 24;
    y = drawParagraph(ctx, `得分最高的维度是「${strong.name}」（${strong.score.toFixed(1)} 分），是您健康寿命的重要支撑，建议继续保持当前的健康行为模式。`, y);
    y += 16;

    ctx.fillStyle = "#F59E0B";
    ctx.font = "700 15px 'PingFang SC','Microsoft YaHei',sans-serif";
    ctx.fillText("● 重点关注", MARGIN, y);
    y += 24;
    y = drawParagraph(ctx, `相对薄弱的维度是「${weak.name}」（${weak.score.toFixed(1)} 分），建议优先改善以提升整体指数。具体改善建议见下一章节。`, y);

    drawDocFooter(ctx, 3, TOTAL, dateStr);
    pages.push(canvas.toDataURL("image/jpeg", 0.92));
  }

  /* ========== 第 4 页：改善建议 + AI 解读 ========== */
  {
    const { canvas, ctx } = createA4Canvas();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A4W, A4H);
    drawDocHeader(ctx);

    let y = 80;
    y = drawSectionTitle(ctx, "三", "个性化改善建议", y);
    y = drawParagraph(ctx, "基于您的评估结果，以下是为您生成的重点行动建议，建议以 90 天为一个改善周期执行：", y + 6);
    y += 8;

    const insights = generateRuleInsights(result);
    const lines = insights.split("\n");
    let inTips = false;
    let tipNum = 0;
    for (const line of lines) {
      if (y > A4H - 180) break;
      if (line.startsWith("## 改善建议")) {
        inTips = true;
        continue;
      }
      if (line.startsWith("## 健康展望")) {
        // 进入 AI 解读章节
        y += 16;
        y = drawSectionTitle(ctx, "四", "AI 智能解读", y - 12);
        y = drawParagraph(ctx, "以下是系统基于您的评估结果生成的智能解读分析：", y + 6);
        y += 8;
        continue;
      }
      if (inTips && /^\d+\.\s/.test(line)) {
        tipNum++;
        const text = line.replace(/^\d+\.\s/, "");
        ctx.fillStyle = "#0A5BA8";
        ctx.beginPath();
        ctx.arc(MARGIN + 12, y - 4, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 12px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(tipNum), MARGIN + 12, y - 4);
        ctx.fillStyle = "#2B3A48";
        ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        y = wrapText(ctx, text, MARGIN + 32, y, A4W - MARGIN * 2 - 32, 22);
        y += 10;
      } else if (line.startsWith("## ")) {
        y += 10;
        ctx.fillStyle = "#0A5BA8";
        ctx.font = "700 15px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(line.replace("## ", ""), MARGIN, y);
        y += 22;
      } else if (line.startsWith("> ")) {
        y += 4;
        ctx.fillStyle = "#8494A6";
        ctx.font = "12px 'PingFang SC','Microsoft YaHei',sans-serif";
        y = wrapText(ctx, line.replace("> ", ""), MARGIN + 16, y, A4W - MARGIN * 2 - 16, 20);
        y += 8;
      } else if (line.startsWith("- ")) {
        ctx.fillStyle = "#55677A";
        ctx.font = "13px 'PingFang SC','Microsoft YaHei',sans-serif";
        ctx.fillText("•", MARGIN + 8, y);
        y = wrapText(ctx, line.replace("- ", ""), MARGIN + 24, y, A4W - MARGIN * 2 - 24, 22);
        y += 6;
      } else if (line.trim() === "") {
        y += 10;
      } else {
        y = drawParagraph(ctx, line, y, false);
        y += 6;
      }
    }

    // 底部二维码
    if (y < A4H - 160) {
      const qrUrl = `${siteUrl}/questionnaire`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
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
      const qrY = A4H - 130;
      ctx.drawImage(qrImg, MARGIN, qrY, 80, 80);
      ctx.fillStyle = "#0A5BA8";
      ctx.font = "700 14px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("扫码立即测试评估", MARGIN + 96, qrY + 30);
      ctx.fillStyle = "#8494A6";
      ctx.font = "11px 'PingFang SC','Microsoft YaHei',sans-serif";
      ctx.fillText("你也来测一测自己的健康寿命指数", MARGIN + 96, qrY + 52);
      ctx.fillText(qrUrl, MARGIN + 96, qrY + 70);
    }

    drawDocFooter(ctx, 4, TOTAL, dateStr);
    pages.push(canvas.toDataURL("image/jpeg", 0.92));
  }

  return pages;
}
