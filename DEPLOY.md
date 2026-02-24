# NoteSpace 部署指南

## 整体架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub Pages  │     │   Railway/Render│     │   PlanetScale   │
│   (前端 Vue3)   │────▶│   (后端 Spring) │────▶│   (数据库 MySQL)│
│                 │     │                 │     │                 │
│ vue-notespace   │     │ notespace-serve │     │   notespace-db  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 前端部署到 GitHub Pages

### 当前状态

✅ 前端已成功部署到：https://xpc254.github.io/vue-notespace/

### 配置后端 API 地址

部署后端后，需要更新前端的 API 地址：

1. 访问：https://github.com/xpc254/vue-notespace/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加：
   - **Name**: `API_BASE_URL`
   - **Value**: 你的后端地址（例如 `https://notespace-backend.up.railway.app`）

添加后 GitHub Actions 会自动重新部署前端。

---

## 后端部署（推荐 Railway）

### 为什么选择 Railway？

| 特性 | Railway | Render |
|------|---------|--------|
| 免费 MySQL | ✅ 内置 | ❌ 需外部 |
| 部署难度 | ⭐ 简单 | ⭐⭐ 中等 |
| 免费额度 | $5/月 | 750小时/月 |
| 休眠时间 | 无活动休眠 | 15分钟休眠 |

### 步骤 1: 准备后端代码

将 `notespace-serve` 目录推送到 GitHub 仓库：

```bash
cd notespace-serve
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/xpc254/notespace-serve.git
git push -u origin main
```

### 步骤 2: 部署到 Railway

1. 访问 [railway.app](https://railway.app) 并登录
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 `notespace-serve` 仓库
4. Railway 会自动检测 Spring Boot 项目

### 步骤 3: 添加 MySQL 数据库

1. 在 Railway 项目中点击 **New** → **Database**
2. 选择 **Add MySQL**
3. 数据库会自动创建并连接

### 步骤 4: 配置环境变量

在 Railway 项目中，点击后端服务 → **Variables**，添加：

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=production

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this

# 数据库配置通常由 Railway 自动注入，如需手动配置：
# SPRING_DATASOURCE_URL=jdbc:mysql://host:3306/dbname
# SPRING_DATASOURCE_USERNAME=username
# SPRING_DATASOURCE_PASSWORD=password
```

### 步骤 5: 初始化数据库

1. 在 Railway 中点击 MySQL 数据库
2. 点击 "Query" 标签
3. 执行以下 SQL（或执行 `db_migration_share.sql`）：

```sql
-- 添加 shareId 字段到 notes 表
ALTER TABLE notes ADD COLUMN share_id VARCHAR(36) UNIQUE DEFAULT NULL;
```

### 步骤 6: 获取 API 地址

1. 部署完成后，点击后端服务
2. 在 "Networking" 标签查看生成的域名
3. API 地址格式：`https://你的项目名.up.railway.app/api`

### 步骤 7: 配置 Redis（可选）

Railway 不提供免费 Redis，有两个选择：

#### 选项 A: 使用 Upstash Redis（推荐）

1. 访问 [upstash.com](https://upstash.com) 注册
2. 创建免费 Redis 数据库
3. 获取连接信息：`UPSTASH_REDIS_REST_URL`
4. 在 Railway 添加环境变量：
   ```bash
   SPRING_REDIS_HOST=your-redis-host.upstash.io
   SPRING_REDIS_PORT=6379
   SPRING_REDIS_PASSWORD=your-password
   ```

#### 选项 B: 暂时禁用 Redis

如果项目可以不使用缓存功能，可以在部署时移除 Redis 依赖。

---

## 部署验证

### 1. 检查后端健康状态

访问：`https://你的后端地址/api/actuator/health`

预期响应：
```json
{"status":"UP"}
```

### 2. 测试注册接口

```bash
curl -X POST https://你的后端地址/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com"}'
```

### 3. 测试完整流程

1. 访问前端：https://xpc254.github.io/vue-notespace/
2. 注册新用户
3. 登录
4. 创建笔记
5. 测试分享功能

---

## 常见问题

### Q: 后端部署失败，提示内存不足

**A**: Railway 免费版有内存限制，添加环境变量：
```bash
JAVA_OPTS=-Xmx256m -Xms128m
```

### Q: 数据库连接失败

**A**:
1. 检查 Railway 中数据库是否已启动
2. 确认环境变量配置正确
3. 查看 Railway 日志获取详细错误

### Q: 首次访问很慢

**A**: 免费服务有休眠机制，首次访问需要 30-60 秒唤醒。

### Q: 前端无法连接后端

**A**:
1. 确认后端部署成功
2. 检查 GitHub Secrets 中的 `API_BASE_URL` 是否正确
3. 打开浏览器控制台查看具体错误

---

## 费用说明

| 服务 | 免费套餐 | 超出后 |
|------|----------|--------|
| GitHub Pages | 完全免费 | - |
| Railway | $5/月额度 | 按量计费 |
| Upstash Redis | 10K 命令/天 | 付费 |

---

## 下一步

1. ✅ 前端已部署
2. ⏳ 后端部署到 Railway
3. ⏳ 配置 Redis（可选）
4. ⏳ 更新前端 API 配置
5. ⏳ 完整功能测试
