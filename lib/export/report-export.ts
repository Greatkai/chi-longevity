import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { AssessmentResult } from "@/lib/chli-model";

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

/** 网页版导出（PDF / 网页截图） */
export async function exportReport(
  element: HTMLElement,
  format: ExportFormat,
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

  // PDF：先将整个内容转为一张长图，再切成多页
  const dataUrl = await captureImage(element, "png");
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const imgWidth = img.width;
  const imgHeight = img.height;
  const pageWidth = 794; // A4 @ 96dpi
  const pageHeight = 1123;
  const ratio = pageWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  const pdf = new jsPDF("p", "pt", "a4");
  let position = 0;
  let remaining = scaledHeight;

  pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, scaledHeight);

  // 分页
  while (remaining > pageHeight) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, scaledHeight);
    remaining -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

/* ==================== 手机端分享长图 ==================== */

/** 构造手机分享用的竖版卡片 DOM，并转成图片下载 */
export async function exportShareImage(
  result: AssessmentResult,
  siteUrl = "https://chi-longevity.bmaxkai.me"
): Promise<void> {
  // 生成二维码 dataURL
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 280,
    margin: 1,
    color: { dark: "#063D70", light: "#FFFFFF" },
  });

  const levelColor = LEVEL_COLORS[result.level] || "#3186D8";
  const dims = [...result.dimensions];

  // 构建竖版卡片 DOM
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;left:-9999px;top:0;width:750px;background:#F0F6FC;font-family:'PingFang SC','Noto Sans SC','Microsoft YaHei',sans-serif;color:#12232E;";

  // 顶部品牌渐变区
  const header = document.createElement("div");
  header.style.cssText =
    "background:linear-gradient(135deg,#042A4D 0%,#0A5BA8 45%,#3186D8 100%);padding:44px 40px;color:#fff;text-align:center;";
  header.innerHTML = `
    <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);border-radius:999px;padding:8px 18px;font-size:14px;font-weight:600;backdrop-filter:blur(6px);">
      <span style="font-size:18px;">🏥</span> 百岁白皮书 · 长寿指数评估
    </div>
    <div style="font-size:15px;color:rgba(255,255,255,0.85);margin-top:16px;">中国百岁健康标准指数（CHLI）</div>
  `;

  // 综合指数区
  const scoreBlock = document.createElement("div");
  scoreBlock.style.cssText =
    "background:linear-gradient(135deg,#042A4D 0%,#0A5BA8 60%,#3186D8 100%);padding:10px 40px 40px;color:#fff;text-align:center;";
  const score = Math.round(result.chliScore);
  scoreBlock.innerHTML = `
    <div style="font-size:17px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,0.92);">综合长寿指数</div>
    <div style="margin:14px 0 6px;">
      <span style="font-size:86px;font-weight:800;line-height:1;">${score}</span>
      <span style="font-size:28px;font-weight:500;color:rgba(255,255,255,0.8);"> / 100</span>
    </div>
    <span style="display:inline-block;background:${levelColor};border-radius:999px;padding:6px 22px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2);">${result.label}</span>
  `;

  // 内容主体
  const body = document.createElement("div");
  body.style.cssText = "background:#F0F6FC;padding:34px 32px 20px;";

  // 维度得分
  const dimHtml = dims
    .map((d) => {
      const c = LEVEL_COLORS[d.level] || "#3186D8";
      const s = Math.round(d.score);
      return `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
        <div style="width:120px;flex-shrink:0;font-size:15px;font-weight:600;color:#12232E;">${d.key} · ${d.name}</div>
        <div style="flex:1;height:14px;background:#DCE9F8;border-radius:999px;overflow:hidden;">
          <div style="width:${s}%;height:100%;background:${c};border-radius:999px;"></div>
        </div>
        <div style="width:52px;text-align:right;font-size:17px;font-weight:700;color:#12232E;">${s}</div>
      </div>`;
    })
    .join("");

  body.innerHTML = `
    <div style="background:#fff;border-radius:18px;padding:26px;box-shadow:0 4px 20px rgba(6,61,112,0.08);">
      <div style="font-size:16px;font-weight:700;color:#12232E;margin-bottom:18px;">六大维度得分</div>
      ${dimHtml}
    </div>
  `;

  // 底部：二维码 + 网址
  const footer = document.createElement("div");
  footer.style.cssText = "background:#fff;padding:28px 32px 36px;text-align:center;";
  footer.innerHTML = `
    <div style="display:inline-flex;align-items:center;gap:18px;border:1px solid #DCE9F8;border-radius:16px;padding:16px 22px;">
      <img src="${qrDataUrl}" style="width:96px;height:96px;border-radius:8px;" alt="二维码" />
      <div style="text-align:left;">
        <div style="font-size:14px;font-weight:700;color:#0A5BA8;">扫码查看完整报告</div>
        <div style="font-size:13px;color:#8494A6;margin-top:6px;">百岁白皮书 · CHLI 长寿评估</div>
        <div style="font-size:12px;color:#55677A;margin-top:6px;word-break:break-all;max-width:240px;">${siteUrl}</div>
      </div>
    </div>
    <div style="font-size:12px;color:#8494A6;margin-top:18px;">健康数据仅供参考，不构成医疗建议 · 请及时就医</div>
  `;

  el.appendChild(header);
  el.appendChild(scoreBlock);
  el.appendChild(body);
  el.appendChild(footer);

  // 放入文档以便测量
  document.body.appendChild(el);

  try {
    const dataUrl = await toPng(el, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "长寿指数分享.png";
    link.href = dataUrl;
    link.click();
  } finally {
    document.body.removeChild(el);
  }
}
