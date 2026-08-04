import Link from "next/link";
import {
  Dna,
  HeartPulse,
  Activity,
  UtensilsCrossed,
  Brain,
  LineChart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";

const dimensions = [
  {
    icon: Dna,
    key: "B",
    title: "生物年龄",
    name: "生物学年岭指数",
    desc: "基于生物标志物测算生物年龄与实际年龄的差值，评估身体衰老速度与生命活力。",
    color: "from-brand-600 to-brand-400",
  },
  {
    icon: HeartPulse,
    key: "F",
    title: "功能健康",
    name: "功能健康指数",
    desc: "评估躯体功能、认知功能、生活自理能力与运动能力，反映身体的日常运转质量。",
    color: "from-teal-500 to-emerald-400",
  },
  {
    icon: Activity,
    key: "M",
    title: "代谢慢病",
    name: "代谢与慢病风险指数",
    desc: "综合 BMI、血压、血糖、血脂与慢病数量及控制情况，评估代谢健康与慢病风险。",
    color: "from-orange-500 to-amber-400",
  },
  {
    icon: UtensilsCrossed,
    key: "L",
    title: "生活方式",
    name: "生活方式与行为指数",
    desc: "从饮食结构、睡眠质量、运动习惯、烟酒摄入与压力管理评估健康行为模式。",
    color: "from-sky-500 to-cyan-400",
  },
  {
    icon: Brain,
    key: "P",
    title: "心理认知",
    name: "心理认知与社交参与指数",
    desc: "评估情绪状态、认知水平、社会参与度与孤独感，守护心理健康与社交活力。",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: LineChart,
    key: "D",
    title: "数字健康",
    name: "数字健康轨迹指数",
    desc: "基于纵向健康监测数据的连续性与规律性，评估科学化健康管理意识。",
    color: "from-rose-500 to-pink-400",
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "填写健康信息",
    desc: "通过结构化问卷或 AI 智能填写，输入您的健康数据。",
  },
  {
    icon: Sparkles,
    title: "AI 智能评分",
    desc: "系统基于 CHLI 模型自动计算六大维度得分与综合长寿指数。",
  },
  {
    icon: FileText,
    title: "获取分析报告",
    desc: "生成可视化长寿报告，包含风险评估、AI 解读与个性化建议。",
  },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* 首屏 Banner */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-brand-300 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div className="container-page relative py-20 md:py-28">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <TrendingUp className="h-4 w-4" />
              基于「中国百岁健康标准指数」CHLI 评估体系
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              科学评估您的
              <span className="mx-2 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                健康寿命
              </span>
              <br />
              让百岁愿景有据可依
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              从生物年龄、功能健康、代谢慢病、生活方式、心理社交与数字健康六大维度，
              结合前沿健康科学研究，为您生成一份专属的长寿指数分析报告与个性化改善方案。
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              >
                <ClipboardList className="h-5 w-5" />
                立即开始评估
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#dimensions"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                了解评估体系
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-16">
            {[
              { num: "6", label: "大核心维度" },
              { num: "25-105", label: "适用年龄范围" },
              { num: "CHLI", label: "科学评估模型" },
              { num: "24h", label: "随时随地评估" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur transition-all hover:bg-white/15"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-2xl font-bold text-white md:text-3xl">
                  {stat.num}
                </div>
                <div className="mt-1 text-xs text-white/75 md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 六大维度 */}
      <section id="dimensions" className="bg-brand-soft py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              评估体系
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink-900 md:text-4xl">
              六大维度，全面评估
              <span className="text-gradient">健康寿命</span>
            </h2>
            <p className="mt-4 text-ink-600">
              CHLI 综合指数 = 0.20×生物年龄 + 0.20×功能健康 + 0.20×代谢慢病
              + 0.15×生活方式 + 0.10×心理认知 + 0.15×数字健康
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dimensions.map((dim) => (
              <div
                key={dim.key}
                className="card card-hover group p-6"
                style={{ animationDelay: "0s" }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${dim.color} text-white shadow-md`}
                  >
                    <dim.icon className="h-7 w-7" />
                  </div>
                  <span className="text-3xl font-black text-brand-100 transition-colors group-hover:text-brand-200">
                    {dim.key}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink-900">{dim.title}</h3>
                <p className="mt-1 text-sm font-medium text-brand-600">{dim.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 评估流程 */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              评估流程
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink-900 md:text-4xl">
              三步生成专属长寿报告
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="card card-hover flex h-full flex-col items-center p-8 text-center">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-white shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/questionnaire"
              className="btn-primary inline-flex text-lg"
            >
              开始我的长寿评估
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-400">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              您的健康数据将加密存储，仅您本人可见
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
