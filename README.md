# 百岁白皮书 · 中国百岁健康标准指数（CHLI）评估网站

基于「中国百岁健康标准指数（CHLI）」评估体系，开发的长寿指数评估响应式网站。用户可通过结构化问卷或 AI 智能填写输入健康信息，系统自动按 CHLI 模型计算六大维度得分与综合长寿指数，生成包含可视化图表、风险等级、AI 智能解读与个性化建议、可导出（PNG/JPEG/PDF）的长寿指数分析报告。

## 核心功能

- **六大维度问卷评估**：生物年龄（B）、功能健康（F）、代谢慢病（M）、生活方式（L）、心理认知（P）、数字健康（D）
- **AI 智能填写**：粘贴健康描述文本，自动提取并填充问卷
- **CHLI 综合评分**：`CHLI = 0.20×B + 0.20×F + 0.20×M + 0.15×L + 0.10×P + 0.15×D`
- **可视化报告**：综合指数环形图、六维雷达图、维度柱状图、风险等级卡片、生物年龄对比、FSHI 附加模块
- **AI 智能解读**：基于评分生成个性化风险解读与改善建议（AI 优先 + 规则兜底）
- **报告导出**：高清 PNG / JPEG 图片与 PDF 文档
- **用户权限管理**：邮箱注册/登录（JWT）、普通用户/管理员角色、历史报告保存与查看、管理员后台用户管理

## 技术栈

- **框架**：Next.js 14（App Router）+ TypeScript
- **样式**：Tailwind CSS + Framer Motion，医疗蓝品牌风格
- **图表**：Recharts（雷达图/柱状图/环形图）
- **导出**：html-to-image + jsPDF
- **认证与存储**：better-sqlite3（SQLite）+ bcryptjs + jose（JWT）
- **AI**：OpenAI 兼容接口（可选，未配置时使用规则兜底）

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.local.example .env.local

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

默认管理员账号（可在 `.env.local` 修改）：
- 邮箱：`admin@chi.cn`
- 密码：`admin123456`

## 生产部署

### 方式一：Docker（推荐）

```bash
# 构建并启动
JWT_SECRET=$(openssl rand -hex 32) docker-compose up -d --build
```

### 方式二：直接运行

```bash
npm run build
npm start
```

### 方式三：云主机 / 内网

使用 Next.js standalone 输出，或直接运行 `npm start` 并配合 Nginx 反向代理。

> **重要提示**：本系统使用 SQLite 数据库，依赖持久化磁盘存储，请确保数据目录（`/app/data` 或项目 `data/` 目录）持久化。**不适用于** Vercel / EdgeOne Pages 等无持久文件系统的 serverless 平台。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `JWT_SECRET` | JWT 签名密钥，生产环境务必替换为强随机字符串 | `dev-secret-change-in-production` |
| `ADMIN_EMAIL` | 管理员初始邮箱 | `admin@chi.cn` |
| `ADMIN_PASSWORD` | 管理员初始密码 | `admin123456` |
| `DATABASE_PATH` | SQLite 数据库文件路径 | `data/chi.db` |
| `OPENAI_API_KEY` | OpenAI 兼容接口密钥（可选） | 空 |
| `OPENAI_BASE_URL` | OpenAI 接口地址（可选） | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | AI 模型名称（可选） | `gpt-4o-mini` |

## 目录结构

```
chi-longevity-app/
├── app/                    # Next.js 路由（首页/问卷/报告/登录/历史/管理后台 + API）
│   ├── middleware.ts       # JWT 路由守卫与角色控制
│   └── api/                # auth/reports/admin/extract/insights 接口
├── components/             # 布局、问卷、报告、认证、管理后台组件
├── lib/
│   ├── chli-model/         # CHLI 评分引擎（公式/标准化/风险等级）
│   ├── db/                 # SQLite 数据层
│   ├── auth/               # JWT 会话
│   ├── ai/                 # AI 提取与解读 + 规则兜底
│   └── export/             # 报告导出
├── store/                  # 认证与评估状态管理
└── public/                 # 静态资源
```

## 免责声明

本评估工具仅供健康管理参考，不构成医疗诊断建议。如有健康问题请及时就医。
