# ÉCLAT · 奢侈品电商平台

> 一套开箱即用的高端电商解决方案 —— React 18 + Vite 5 + EdgeOne Edge Functions，内置 AI 智能推荐系统。

## 这是什么

ÉCLAT 是一个完整的奢侈品电商平台源码，包含前端 + 后端 API + AI 推荐系统。购买后你可以：

- 部署成自己的电商站点（卖你自己的产品）
- 改产品数据直接上线（改一个文件即可）
- 二次开发定制功能

## 核心功能

| 模块 | 功能 |
|------|------|
| **AI 智能推荐** | 3 屄规则引擎：浏览历史推荐 → 收藏偏好推荐 → 冷启动热门推荐，附中文推荐理由 |
| **商品展示** | 分类筛选、排序、分页、产品预览弹窗、悬停快速鉴赏 |
| **购物流程** | 购物车、结账、省市级联、订单管理 |
| **用户系统** | 注册/登录、心愿单、用户中心、个人资料 |
| **AI 聊天** | 内置 AI 客服接口（可接入 EdgeOne AI Gateway） |
| **视觉设计** | 暗色玻璃拟态 + 渐变金紫配色 + Framer Motion 沉浸式动画 |
| **后端 API** | 18 个 Edge Functions 端点（认证/商品/订单/推荐/评论/追踪） |
| **部署** | 一键部署到 EdgeOne Pages，或任意静态服务器 |

## 技术栈

- **前端**：React 19 + Vite 5 + TypeScript 5.6 + Tailwind CSS 3 + Framer Motion 12
- **后端**：EdgeOne Edge Functions（JavaScript，无需服务器）
- **图标**：Lucide React
- **状态管理**：React Context（App/Product/User/Toast 四层）

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# → 打开 http://localhost:5173

# 3. 构建生产版本
npm run build
# → 输出到 dist/ 目录

# 4. 本地预览构建结果
npm run preview
```

### 自定义产品数据

**只需改一个文件**：`src/data/products.ts`

```typescript
export const allProducts: Product[] = [
  {
    id: 'yueguang',
    name: '月光之泪项链',      // ← 改成你的产品名
    category: '珠宝臻品',       // ← 改分类（珠宝臻品/香水雅韵/奢华手袋）
    price: 12800,               // ← 改价格（单位：元）
    rating: 4.9,                // ← 改评分
    img: '/images/yueguang.jpg', // ← 改图片路径（放图片到 public/images/）
    desc: '...',                 // ← 改描述
    tag: '畅销',                // ← 标签（畅销/新品/限定，可选）
  },
  // 添加更多产品...
];
```

### 自定义品牌信息

品牌名、Logo、配色等分散在以下文件：

| 配置项 | 文件位置 |
|--------|---------|
| 品牌名/导航栏 | `src/components/NavBar.tsx` |
| 首页大标题/文案 | `src/components/HeroSection.tsx` |
| 分类卡片 | `src/components/CategorySection.tsx` |
| 品牌故事 | `src/components/BrandStorySection.tsx` |
| 底部信息 | `src/components/Footer.tsx` |
| 配色方案 | `tailwind.config.js`（搜索 `colors`） |
| 省市级联数据 | `src/data/regions.ts` |

## 项目结构

```
eclat-luxury/
├── src/
│   ├── components/      # 22 个 UI 组件
│   ├── context/         # 4 个状态管理（App/Product/User/Toast）
│   ├── hooks/           # 3 个自定义 Hook（useAuth/useOrders/useLazyVideo）
│   ├── data/            # 产品数据 + 省市数据（改这里就能上线）
│   ├── services/        # API 服务层
│   ├── utils/           # 工具函数
│   └── App.tsx          # 主入口
├── edge-functions/      # 18 个后端 API 端点（EdgeOne 部署用）
├── public/images/       # 产品图片
├── edgeone.json         # EdgeOne 部署配置
└── DEPLOY.md            # 部署指南
```

## AI 推荐系统说明

推荐系统包含 **本地规则引擎**（开箱即用）和 **Edge Functions API**（部署后可用）两种模式：

| 模式 | 触发条件 | 推荐策略 |
|------|---------|---------|
| 浏览历史推荐 | 用户浏览过产品 | 取浏览产品的分类，推荐同分类其他产品 |
| 收藏偏好推荐 | 用户收藏过产品 | 取收藏产品的分类+标签，推荐同风格产品 |
| 冷启动推荐 | 无浏览/收藏数据 | 推荐畅销标签或评分≥4.8的产品 |

本地开发时自动使用规则引擎（无需后端）。部署到 EdgeOne 后可接入 AI API 实现更智能推荐。

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

## 许可证

详见 [LICENSE](./LICENSE)。购买后可商用、可修改、可部署，但不可再分发/转售源码。
