"use client";

import { useState } from "react";
import { ChevronDown, Calculator, FunctionSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentResult } from "@/lib/chli-model";
import { SUB_BY_DIMENSION } from "@/lib/chli-model/sub-indicators";

interface Props {
  result: AssessmentResult;
}

const DIM_LABELS: Record<string, string> = {
  B: "生物年龄指数",
  F: "功能健康指数",
  M: "代谢与慢病风险指数",
  L: "生活方式与行为指数",
  P: "心理认知与社交参与指数",
  D: "数字健康轨迹指数",
};

export function CalcDetails({ result }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 transition-colors hover:bg-brand-50/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md">
            <Calculator className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-ink-900">详细计算逻辑</div>
            <div className="text-xs text-ink-500">
              展开查看综合指数与各维度得分的计算公式
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-ink-400 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-brand-100 px-6 py-6">
            {/* 综合公式 */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-700">
                <FunctionSquare className="h-4 w-4" />
                综合指数公式
              </h4>
              <div className="rounded-xl bg-brand-50 p-4 font-mono text-sm leading-relaxed text-ink-700">
                CHLI = 0.20×B + 0.20×F + 0.20×M + 0.15×L + 0.10×P + 0.15×D
              </div>
              <div className="mt-2 text-xs text-ink-500">
                当前综合得分：<strong className="text-brand-700">{result.chliScore.toFixed(1)} 分</strong>
              </div>
            </div>

            {/* 各维度详细 */}
            {result.dimensions.map((dim) => {
              const subs = SUB_BY_DIMENSION[dim.key] || [];
              return (
                <div key={dim.key}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                      {dim.key}
                    </span>
                    <span className="text-sm font-bold text-ink-900">
                      {DIM_LABELS[dim.key] || dim.name}
                    </span>
                    <span className="text-xs text-ink-400">权重 {dim.weight * 100}%</span>
                    <span className="ml-auto text-lg font-bold text-brand-700">
                      {dim.score.toFixed(1)} 分
                    </span>
                  </div>

                  {/* 二级指标明细 */}
                  {subs.length > 0 && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-brand-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-xs text-ink-500">
                            <th className="px-4 py-2 font-semibold">二级指标</th>
                            <th className="px-4 py-2 text-center font-semibold">权重</th>
                            <th className="px-4 py-2 text-center font-semibold">得分</th>
                            <th className="px-4 py-2 text-center font-semibold">加权</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subs.map((sub) => {
                            const subScore = dim.details[sub.key] ?? 0;
                            const weighted = subScore * sub.weight;
                            return (
                              <tr
                                key={sub.key}
                                className="border-b border-brand-50 last:border-0"
                              >
                                <td className="px-4 py-2">
                                  <span className="text-xs font-semibold text-brand-600">
                                    {sub.key}
                                  </span>{" "}
                                  {sub.name}
                                  {sub.needsLab && (
                                    <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700">
                                      需检查
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-center text-ink-500">
                                  {(sub.weight * 100).toFixed(0)}%
                                </td>
                                <td className="px-4 py-2 text-center font-semibold text-ink-900">
                                  {subScore.toFixed(0)}
                                </td>
                                <td className="px-4 py-2 text-center text-brand-700">
                                  {(weighted).toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-brand-50/50">
                            <td className="px-4 py-2 font-semibold text-ink-900">加权合计</td>
                            <td className="px-4 py-2 text-center text-ink-500">100%</td>
                            <td className="px-4 py-2 text-center text-ink-400">—</td>
                            <td className="px-4 py-2 text-center font-bold text-brand-700">
                              {dim.score.toFixed(1)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 说明 */}
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              <strong>说明：</strong>各维度得分由若干二级指标按权重加权计算（二级指标满分 100 分）。
              需检验的二级指标若未提供检查数据，则采用科学估算替代值，因此与实际体检结果可能存在差异。
              本计算结果仅供参考，不构成医疗诊断建议。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
