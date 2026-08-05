"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  ClipboardList,
  TestTube,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIMENSIONS,
  QUESTIONS,
  LAB_CHECKLIST,
} from "@/lib/questionnaire-data";
import { calculateCHLI } from "@/lib/chli-model";
import { QuestionField } from "@/components/questionnaire/QuestionField";
import { AIFillPanel } from "@/components/questionnaire/AIFillPanel";
import { useAssessment } from "@/store/assessment-store";

export default function QuestionnairePage() {
  const router = useRouter();
  const { data, setValue, setResult } = useAssessment();
  // step: 0=检验检查清单, 1-6=六个维度
  const [step, setStep] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const isLabStep = step === 0;
  const totalSteps = DIMENSIONS.length + 1;
  const currentDim = isLabStep ? null : DIMENSIONS[step - 1];
  const dimQuestions = currentDim
    ? QUESTIONS.filter((q) => q.dimension === currentDim.key)
    : [];

  /** 读取当前路径值 */
  const getValue = (path: string): number | null => {
    const keys = path.split(".");
    let cur: Record<string, unknown> = data as unknown as Record<string, unknown>;
    for (const k of keys) {
      if (cur == null) return null;
      cur = cur[k] as Record<string, unknown>;
    }
    return typeof cur === "number" ? (cur as number) : null;
  };

  /** 读取 lab 值（available + value） */
  const getLabValue = (path: string): { available: boolean; value: number | null } => {
    // path 形如 bio.epigeneticAge.value，去掉 .value 得到 LabValue 对象路径
    const labPath = path.replace(/\.value$/, "");
    const obj = getRaw(labPath) as { available?: boolean; value?: number | null } | null;
    return { available: !!obj?.available, value: obj?.value ?? null };
  };

  const getRaw = (path: string): unknown => {
    const keys = path.split(".");
    let cur: Record<string, unknown> = data as unknown as Record<string, unknown>;
    for (const k of keys) {
      if (cur == null) return null;
      cur = cur[k] as Record<string, unknown>;
    }
    return cur;
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

  /** 步骤指示条上的步骤序号（0=检查, 1-6=维度） */
  const stepItems = [
    { key: "LAB", label: "检查", icon: FileSearch },
    ...DIMENSIONS.map((d) => ({ key: d.key, label: d.key, icon: d.icon })),
  ];

  /** 检验项到 available 路径的映射 */
  const labAvailablePaths: Record<string, string> = {
    B2: "bio.epigeneticAge.available",
    B3: "bio.inflammation.available",
    M1: "metabolic.hba1c.available",
    M2: "metabolic.ldl.available",
    M5: "metabolic.liverKidney.available",
    F2: "functional.gaitSpeed.available",
    F3: "functional.gripStrength.available",
    F4: "functional.balance.available",
    F5: "functional.cognitiveTest.available",
    D3: "digital.improvingTrend.available",
  };

  /** 检验项是否已勾选 */
  const checkActive = (subKey: string): boolean => {
    const p = labAvailablePaths[subKey];
    if (!p) return false;
    return getValue(p) === 1;
  };

  /** 切换检验项勾选 */
  const toggleLab = (subKey: string) => {
    const p = labAvailablePaths[subKey];
    if (!p) return;
    const current = getValue(p) === 1;
    setValue(p, current ? 0 : 1);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="relative min-h-screen bg-brand-soft pt-16">
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
            先确认您已有的检验报告，再完成各维度填写，或使用 AI 智能填写快速录入
          </p>
        </div>

        {/* 进度条 */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="flex items-center justify-between text-sm">
            <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">
              {isLabStep ? "检验检查" : `第 ${step} / ${DIMENSIONS.length} 步`}
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
          <div className="mt-7 grid grid-cols-4 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
            {stepItems.map((item, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={item.key}
                  onClick={() => setStep(i)}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all duration-300",
                    active
                      ? "border-brand-500 bg-gradient-to-br from-brand-50 to-white text-brand-700 shadow-soft"
                      : done
                      ? "border-brand-200 bg-white text-brand-600 hover:border-brand-300 hover:shadow-sm"
                      : "border-brand-100 bg-white text-ink-400 hover:border-brand-200 hover:text-ink-600"
                  )}
                >
                  <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
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

          {isLabStep ? (
            /* ===== 检验检查清单 ===== */
            <div className="card card-accent animate-fade-up overflow-hidden">
              <div className="flex items-center gap-4 border-b border-brand-100 bg-gradient-to-r from-brand-50/80 to-white p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-lg">
                  <TestTube className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      检验检查
                    </span>
                    <h2 className="text-xl font-bold text-ink-900">您手头有哪些检查报告？</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    选择您已有的检验/检查项目，有检验数据将获得更精确的评估；没有的项目我们将用科学估算替代。
                  </p>
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-2 md:p-8">
                {LAB_CHECKLIST.map((item) => {
                  const active = checkActive(item.subKey);
                  return (
                    <button
                      key={item.subKey}
                      type="button"
                      onClick={() => toggleLab(item.subKey)}
                      className={cn(
                        "group flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                        active
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-brand-100 bg-white hover:border-brand-300"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                          active ? "border-brand-500 bg-brand-500" : "border-brand-200"
                        )}
                      >
                        {active && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink-900">{item.name}</span>
                          {item.recommended && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                              推荐
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-400">{item.desc}</span>
                        <span className="mt-0.5 block text-[11px] text-brand-600">{item.tests}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ===== 当前维度卡片 ===== */
            <div key={step} className="card card-accent animate-fade-up overflow-hidden">
              <div className="flex items-center gap-4 border-b border-brand-100 bg-gradient-to-r from-brand-50/80 to-white p-6">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${currentDim?.color} text-white shadow-lg`}
                >
                  {currentDim && <currentDim.icon className="h-8 w-8" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {currentDim?.key}
                    </span>
                    <h2 className="text-xl font-bold text-ink-900">{currentDim?.title}</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    {currentDim?.name} · 权重 {currentDim?.weight}
                  </p>
                </div>
              </div>

              <div className="space-y-8 p-6 md:p-8">
                {dimQuestions.map((q) =>
                  q.type === "lab" ? (
                    <div key={q.id}>
                      <div className="mb-3">
                        <label className="text-base font-semibold text-ink-900">{q.label}</label>
                        {q.hint && <p className="mt-0.5 text-xs text-ink-400">{q.hint}</p>}
                      </div>
                      <QuestionField
                        question={q}
                        value={getLabValue(q.path).value}
                        available={getLabValue(q.path).available}
                        onAvailableChange={(av) =>
                          setValue(q.path.replace(/\.value$/, ".available"), av ? 1 : 0)
                        }
                        onChange={(v) => setValue(q.path, v)}
                      />
                    </div>
                  ) : (
                    <div key={q.id}>
                      <div className="mb-3">
                        <label className="text-base font-semibold text-ink-900">{q.label}</label>
                        {q.hint && <p className="mt-0.5 text-xs text-ink-400">{q.hint}</p>}
                      </div>
                      <QuestionField
                        question={q}
                        value={getValue(q.path)}
                        onChange={(v) => setValue(q.path, v)}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

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
              <Link href="/" className="text-sm text-ink-400 hover:text-brand-600">
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
              恭喜完成所有填写！点击「生成评估报告」即可查看您的长寿指数分析。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
