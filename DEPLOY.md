# ÉCLAT 部署指南

## 方案一：部署到 EdgeOne Pages（推荐）

ÉCLAT 为 EdgeOne 做了专门适配，部署后可使用全部 18 个后端 API 端点。

### 前置条件

- 腾讯云账号（注册：cloud.tencent.com）
- EdgeOne 已开通（免费额度足够小型站点）

### 步骤

1. **登录 EdgeOne 控制台** → https://console.cloud.tencent.com/edgeone

2. **进入 Pages** → 选择"从 Git 仓库创建"或"上传文件创建"
   - Git 方式：将代码推送到 GitHub/Gitee，连接仓库
   - 文件方式：先执行 `npm run build`，上传 `dist/` + `edge-functions/` 目录

3. **构建配置**（edgeone.json 已配好，通常自动识别）：
   ```
   构建命令：npm run build
   输出目录：dist
   Node 版本：20
   ```

4. **环境变量**（可选）：
   - 如果需要 AI 聊天功能，在 Pages 设置中添加环境变量：
     - `AI_API_KEY` = 你的 AI 接口密钥
   - 不配置 AI Key 不影响推荐系统和电商核心功能

5. **部署完成** → 获得 `https://你的项目.edgeone.app` 域名

6. **绑定自定义域名**（可选）：
   - 在 Pages 设置中添加自定义域名
   - 按 EdgeOne 提示完成 DNS 解析

---

## 方案二：部署到任意静态服务器（Vercel/Netlify/Nginx）

使用此方案只能使用前端功能 + 本地规则推荐，后端 API 不可用。

### 步骤

1. **构建**：
   ```bash
   npm install
   npm run build
   ```
   产出在 `dist/` 目录。

2. **上传 dist/ 目录**到你的服务器。

3. **Vercel**：
   ```bash
   npx vercel --prod
   ```
   选择 `dist/` 作为输出目录。

4. **Netlify**：
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

5. **Nginx**：
   ```nginx
   server {
     listen 80;
     root /path/to/dist;
     index index.html;
     location / { try_files $uri $uri/ /index.html; }
   }
   ```

---

## 方案三：本地预览

```bash
npm install
npm run dev      # 开发模式，支持热更新
# 或
npm run build && npm run preview  # 生产模式预览
```

---

## 部署后验证清单

| 检查项 | 方法 |
|--------|------|
| 首页正常加载 | 打开域名，首页渲染无空白 |
| 产品展示正常 | 滚动到臻选产品区域，9 个产品卡片正常显示 |
| 产品预览正常 | 点击产品图片/快速鉴赏，弹出预览弹窗 |
| 推荐系统正常 | 浏览产品后回到首页，"为您甄选"区域显示同类推荐+推荐理由 |
| 分类筛选正常 | 点击珠宝臻品/香水雅韵/奢华手袋，产品列表自动筛选 |
| 购物车正常 | 加购 → 打开购物车 → 结账流程完整 |
| 心愿单正常 | 收藏产品 → 打开心愿单 → 产品在列表中 |
| 用户注册登录 | EdgeOne 部署后可用；本地开发模式下 API 返回错误不影响浏览体验 |
| AI 聊天（可选） | 需要 AI_API_KEY 配置，否则会降级为预设回复 |

---

## 常见问题

### Q: 部署后页面空白？
A: 检查 Node.js 版本（≥18），确认 `npm install` 完整执行，重新 `npm run build`。

### Q: 推荐区域不显示？
A: 本地规则推荐需要用户先浏览产品。首次访问是冷启动模式，显示热门产品。点击产品预览后回到首页，推荐会更新。

### Q: 后端 API 不工作？
A: 后端 API 需要 EdgeOne 部署。静态服务器部署只能使用前端功能 + 本地规则推荐。

### Q: 图片不显示？
A: 产品图片路径在 `src/data/products.ts` 中指向 `/images/`。确保 `public/images/` 目录中有对应图片文件，或修改路径指向你的图片 URL。
