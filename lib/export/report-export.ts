import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

export type ExportFormat = "png" | "jpeg" | "pdf";

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

/** 导出报告 */
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
