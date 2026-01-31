# GitHub Pages 部署指南

## 前端部署到 GitHub Pages

### 1. 在 GitHub 上创建仓库

创建一个名为 `vue-notespace` 的仓库（或使用你自己的仓库名）

### 2. 修改 vite.config.ts 中的 base 路径

如果仓库名不是 `vue-notespace`，需要修改 `vite.config.ts` 中的 base 路径：

```typescript
base: '/你的仓库名/'
```

### 3. 在 GitHub 仓库中配置 Secrets

进入仓库 Settings → Secrets and variables → Actions → New repository secret

添加以下 Secret：
- Name: `API_BASE_URL`
- Value: 你的后端 API 地址（例如：`https://你的后端.onrender.com`）

### 4. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择：GitHub Actions

### 5. 推送代码到 GitHub

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

推送后，GitHub Actions 会自动构建并部署到 GitHub Pages。

### 6. 访问你的网站

部署完成后，访问地址为：`https://你的用户名.github.io/vue-notespace/`

---

## 后端部署（推荐 Render 或 Railway）

### Render 部署

1. 访问 [render.com](https://render.com)
2. 连接 GitHub 账号
3. 点击 "New +" → "Web Service"
4. 选择你的后端仓库
5. 配置：
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/notespace-serve-0.0.1-SNAPSHOT.jar`
   - 添加环境变量（数据库连接等）

### Railway 部署

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的后端仓库
4. Railway 会自动检测 Spring Boot 并配置

---

## 数据库部署（推荐 PlanetScale 或 Supabase）

### PlanetScale（MySQL）

1. 访问 [planetscale.com](https://planetscale.com)
2. 创建数据库
3. 获取连接字符串
4. 在后端部署平台配置环境变量

### Supabase（PostgreSQL）

1. 访问 [supabase.com](https://supabase.com)
2. 创建项目
3. 获取数据库连接信息
4. 注意：Supabase 是 PostgreSQL，需要修改后端配置
