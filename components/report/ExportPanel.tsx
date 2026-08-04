"use client";

import { useRef, useState } from "react";
import {
  ImageDown,
  FileDown,
  Loader2,
  FileImage,
  Download,
  Share2,
  Smartphone,
} from "lucide-react";
import { exportReport, exportShareImage, type ExportFormat } from "@/lib/export/report-export";
import type { AssessmentResult } from "@/lib/chli-model";

interface Props {
  /** 导出的目标区域 ref 对应的 id */
  contentId: string;
  /** 评估结果（用于生成手机分享长图） */
  result: AssessmentResult;
}

export function ExportPanel({ contentId, result }: Props) {
  const [loading, setLoading] = useState<ExportFormat | "share" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = async (format: ExportFormat) => {
    const el = document.getElementById(contentId);
    if (!el) {
      setMessage({ type: "error", text: "未找到报告内容，无法导出" });
      return;
    }
    setLoading(format);
    setMessage(null);
    try {
      await exportReport(el, format);
      setMessage({ type: "success", text: "导出成功，已开始下载" });
    } catch (e) {
      console.error("导出失败:", e);
      setMessage({ type: "error", text: "导出失败，请重试" });
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    setLoading("share");
    setMessage(null);
    try {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      await exportShareImage(result, siteUrl);
      setMessage({ type: "success", text: "手机分享图已生成，正在下载" });
    } catch (e) {
      console.error("分享图生成失败:", e);
      setMessage({ type: "error", text: "生成分享图失败，请重试" });
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
            将您的长寿评估报告保存为分享图片、高清图片或 PDF
          </p>
        </div>
      </div>

      {/* 手机分享版（重点突出） */}
      <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/70 to-white p-6">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-brand-600" />
          <h4 className="text-sm font-bold text-brand-700">手机分享长图</h4>
          <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
            推荐
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          专为手机端生成竖版分享图，含综合指数、维度得分与网站二维码，方便发送到微信、朋友圈等。
        </p>
        <button
          onClick={handleShare}
          disabled={loading !== null}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-glow active:scale-[0.98] disabled:opacity-50"
        >
          {loading === "share" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Smartphone className="h-5 w-5" />
          )}
          {loading === "share" ? "正在生成..." : "生成手机分享长图"}
        </button>
      </div>

      {/* 网页版导出 */}
      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-ink-700">网页版导出</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => handleExport("png")}
            disabled={loading !== null}
            className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-5 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            {loading === "png" ? (
              <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            ) : (
              <ImageDown className="h-7 w-7 text-brand-600 transition-transform group-hover:scale-110" />
            )}
            <div className="text-sm font-semibold text-ink-900">PNG 图片</div>
            <div className="text-xs text-ink-400">高清无损</div>
          </button>

          <button
            onClick={() => handleExport("jpeg")}
            disabled={loading !== null}
            className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-5 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            {loading === "jpeg" ? (
              <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            ) : (
              <FileImage className="h-7 w-7 text-brand-600 transition-transform group-hover:scale-110" />
            )}
            <div className="text-sm font-semibold text-ink-900">JPEG 图片</div>
            <div className="text-xs text-ink-400">体积更小</div>
          </button>

          <button
            onClick={() => handleExport("pdf")}
            disabled={loading !== null}
            className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white p-5 transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            {loading === "pdf" ? (
              <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            ) : (
              <FileDown className="h-7 w-7 text-brand-600 transition-transform group-hover:scale-110" />
            )}
            <div className="text-sm font-semibold text-ink-900">PDF 文档</div>
            <div className="text-xs text-ink-400">打印归档</div>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
