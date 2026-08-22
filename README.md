# 光影助手 · 摄影师专属 AI 助手

专为独立摄影师及摄影工作室打造的全流程 AI 业务助理 Web 应用。

## 功能模块

| 模块 | 说明 |
|---|---|
| **AI 智能选片** | 上传原片/文件夹，自动检测清晰度、曝光、构图、人像表情，连拍去重，按「精修主推/套系保底/备选/建议淘汰」四级分类，支持文件夹批量导入 |
| **AI 修图工坊** | 6 大 AI 功能（一键增强、智能美颜、场景增强、AI 去雾、智能降噪、人像光效）+ 11 项手动调整 + 12 种富士胶片模拟滤镜，支持 JPG/PNG 导出 |
| **客片展示厅** | 按风格/类型分类浏览作品集，支持文件夹批量导入客片，网格/瀑布流展示 |
| **在线咨询** | AI 智能客服，自动回答套餐、价格、档期、精修、改期等常见问题 |
| **预约档期** | 日历选日期+时段，在线预约，摄影师端可确认/完成预约，查看拍摄准备清单 |
| **拍摄方案策划** | 5 种拍摄类型 × 6 种风格，生成包含地点、时段、服装、道具、流程、要点、配色的完整方案 |
| **摄影师工作台** | KPI 数据看板、ECharts 图表、订单/客户/FAQ 管理、AI 营销文案生成 |

## 富士胶片模拟滤镜（12 种）

Provia / Velvia / Astia / Classic Chrome / Pro Neg.Hi / Pro Neg.Std / Classic Neg / Eterna / Eterna Bleach Bypass / Acros / Monochrome / Sepia

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 + Radix UI (shadcn/ui)
- react-router-dom 7
- ECharts（数据图表）
- framer-motion（动画）
- sonner（通知）
- lucide-react（图标）

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:5173 即可访问。

## 构建

```bash
npm run build
npm run preview
```

## 身份切换

应用右上角可切换「客户」与「摄影师」身份，摄影师端密码为 `1234`。摄影师端可访问工作台数据管理功能。

## 说明

- 所有图片处理（选片分析、AI 修图、滤镜）均在浏览器端通过 Canvas API 完成，无需后端服务
- 业务数据使用内存 mock 数据，刷新后重置
- 客片/选片的文件夹导入功能基于 `webkitdirectory`，支持按子文件夹自动分组
