"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIMENSIONS,
  QUESTIONS,
} from "@/lib/questionnaire-data";
import { calculateCHLI } from "@/lib/chli-model";
import { QuestionField } from "@/components/questionnaire/QuestionField";
import { AIFillPanel } from "@/components/questionnaire/AIFillPanel";
import { useAssessment } from "@/store/assessment-store";

export default function QuestionnairePage() {
  const router = useRouter();
  const { data, setValue, setResult } = useAssessment();
  const [step, setStep] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const currentDim = DIMENSIONS[step];
  const dimQuestions = QUESTIONS.filter((q) => q.dimension === currentDim.key);
  const totalSteps = DIMENSIONS.length;

  /** 读取当前路径值 */
  const getValue = (path: string): number | null => {
    const keys = path.split(".");
    let cur: Record<string, unknown> = data as unknown as Record<string, unknown>;
    for (const k of keys) {
      cur = cur[k] as Record<string, unknown>;
    }
    const v = cur as unknown as number;
    return typeof v === "number" ? v : null;
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleGenerate();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenerate = () => {
    const result = calculateCHLI(data);
    setResult(result);
    router.push("/report");
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="relative min-h-screen bg-brand-soft pt-16">
      {/* 背景点阵 */}
      <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-50" />
      <div className="container-page relative py-10">
        {/* 头部 */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="section-tag">
            <Sparkles className="h-3.5 w-3.5" />
            长寿指数评估
          </span>
          <h1 className="mt-4 text-3xl font-bold text-ink-900 md:text-4xl">
            六大维度<span className="text-gradient">健康问卷</span>
          </h1>
          <p className="mt-3 text-ink-600">
            请依次完成各维度的信息填写，或使用 AI 智能填写快速录入
          </p>
        </div>

        {/* 进度条 */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex items-center justify-between text-sm">
            <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">
              第 {step + 1} / {totalSteps} 步
            </span>
            <span className="font-semibold text-brand-600">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-100 shadow-inner">
            <div
              className="h-full rounded-full bg-brand-gradient shadow-md transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 步骤指示器 */}
          <div className="mt-7 grid grid-cols-3 gap-2.5 md:grid-cols-6">
            {DIMENSIONS.map((dim, i) => (
              <button
                key={dim.key}
                onClick={() => setStep(i)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all duration-300",
                  i === step
                    ? "border-brand-500 bg-gradient-to-br from-brand-50 to-white text-brand-700 shadow-soft"
                    : i < step
                    ? "border-brand-200 bg-white text-brand-600 hover:border-brand-300 hover:shadow-sm"
                    : "border-brand-100 bg-white text-ink-400 hover:border-brand-200 hover:text-ink-600"
                )}
              >
                <dim.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xs font-medium">{dim.key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="mb-5 flex justify-end">
            <button
              onClick={() => setShowAI(!showAI)}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              {showAI ? "收起 AI 填写" : "AI 智能填写"}
            </button>
          </div>

          {showAI && (
            <div className="mb-8 animate-fade-in">
              <AIFillPanel onFilled={() => {}} />
            </div>
          )}

          {/* 当前维度卡片 */}
          <div key={step} className="card card-accent animate-fade-up overflow-hidden">
            <div className="flex items-center gap-4 border-b border-brand-100 bg-gradient-to-r from-brand-50/80 to-white p-6">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${currentDim.color} text-white shadow-lg`}
              >
                <currentDim.icon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {currentDim.key}
                  </span>
                  <h2 className="text-xl font-bold text-ink-900">
                    {currentDim.title}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-600">
                  {currentDim.name} · 权重 {currentDim.weight}
                </p>
              </div>
            </div>

            <div className="space-y-8 p-6 md:p-8">
              {dimQuestions.map((q) => (
                <div key={q.id}>
                  <div className="mb-3">
                    <label className="text-base font-semibold text-ink-900">
                      {q.label}
                    </label>
                    {q.hint && (
                      <p className="mt-0.5 text-xs text-ink-400">{q.hint}</p>
                    )}
                  </div>
                  <QuestionField
                    question={q}
                    value={getValue(q.path)}
                    onChange={(v) => setValue(q.path, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-5 w-5" />
              上一步
            </button>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-ink-400 hover:text-brand-600"
              >
                取消
              </Link>
              <button onClick={goNext} className="btn-primary">
                {step === totalSteps - 1 ? (
                  <>
                    <ClipboardList className="h-5 w-5" />
                    生成评估报告
                  </>
                ) : (
                  <>
                    下一步
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 完成校验提示 */}
          {step === totalSteps - 1 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              恭喜完成所有维度填写！点击「生成评估报告」即可查看您的长寿指数分析。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
