"use client";

import { useRef, useState } from "react";
import { ImageDown, FileDown, Loader2, FileImage, Download } from "lucide-react";
import { exportReport, type ExportFormat } from "@/lib/export/report-export";

interface Props {
  /** 导出的目标区域 ref 对应的 id */
  contentId: string;
}

export function ExportPanel({ contentId }: Props) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    const el = document.getElementById(contentId);
    if (!el) {
      setMessage("未找到报告内容，无法导出");
      return;
    }
    setLoading(format);
    setMessage(null);
    try {
      await exportReport(el, format);
      setMessage("导出成功，已开始下载");
    } catch (e) {
      console.error("导出失败:", e);
      setMessage("导出失败，请重试");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink-900">导出报告</h3>
          <p className="text-xs text-ink-600">
            将您的长寿评估报告保存为高清图片或 PDF，便于分享与留存
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <button
          onClick={() => handleExport("png")}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-6 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
        >
          {loading === "png" ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          ) : (
            <ImageDown className="h-8 w-8 text-brand-600 transition-transform group-hover:scale-110" />
          )}
          <div className="text-sm font-semibold text-ink-900">PNG 图片</div>
          <div className="text-xs text-ink-400">高清无损，适合分享</div>
        </button>

        <button
          onClick={() => handleExport("jpeg")}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-6 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
        >
          {loading === "jpeg" ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          ) : (
            <FileImage className="h-8 w-8 text-brand-600 transition-transform group-hover:scale-110" />
          )}
          <div className="text-sm font-semibold text-ink-900">JPEG 图片</div>
          <div className="text-xs text-ink-400">体积更小，方便传输</div>
        </button>

        <button
          onClick={() => handleExport("pdf")}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-6 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
        >
          {loading === "pdf" ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          ) : (
            <FileDown className="h-8 w-8 text-brand-600 transition-transform group-hover:scale-110" />
          )}
          <div className="text-sm font-semibold text-ink-900">PDF 文档</div>
          <div className="text-xs text-ink-400">适合打印与归档</div>
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
    </div>
  );
}
