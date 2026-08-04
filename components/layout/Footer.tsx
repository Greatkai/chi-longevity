import Link from "next/link";
import { Stethoscope, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-900 text-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold">百岁白皮书 · 长寿评估</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            基于「中国百岁健康标准指数（CHLI）」评估体系，从生物年龄、功能健康、代谢慢病、
            生活方式、心理社交与数字健康六大维度，科学评估个体健康寿命，助力实现健康长寿百岁愿景。
          </p>
          <div className="mt-4 flex items-start gap-2 text-xs text-white/50">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              本评估工具仅供健康管理参考，不构成医疗诊断建议。如有健康问题请及时就医。
            </span>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white/90">快速导航</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                首页
              </Link>
            </li>
            <li>
              <Link href="/questionnaire" className="transition-colors hover:text-white">
                开始评估
              </Link>
            </li>
            <li>
              <Link href="/history" className="transition-colors hover:text-white">
                我的报告
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-white">
                登录 / 注册
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white/90">联系我们</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> service@chi-health.cn
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> 400-000-0000
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 北京市昌平区中关村生命科学园
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-4 text-center text-xs text-white/40">
          © 2026 百岁白皮书 · 中国百岁健康标准指数评估系统 版权所有
        </div>
      </div>
    </footer>
  );
}
