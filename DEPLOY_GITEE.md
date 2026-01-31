# Gitee 部署指南

本指南介绍如何将 **vue-notespace** 项目部署到 Gitee 平台，适合国内用户访问。

---

## 一、前端部署到 Gitee Pages

### 1.1 前置要求

- Gitee 账号（需要完成实名认证才能使用 Pages）
- 本地已安装 Node.js

### 1.2 修改 vite.config.ts 配置

如果您的 Gitee 仓库名不是 `vue-notespace`，需要修改 `vite.config.ts`：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // Gitee Pages 部署路径，修改为你的仓库名
  base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 1.3 构建前端项目

```bash
npm install
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹。

### 1.4 在 Gitee 上创建仓库

1. 访问 [gitee.com](https://gitee.com)
2. 点击右上角 **"+"** → **新建仓库**
3. 填写仓库信息：
   - 仓库名称：`vue-notespace`（或其他名称）
   - 是否公开：选择 **公开**
4. 点击 **创建**

### 1.5 启用 Gitee Pages

1. 进入仓库页面，点击上方的 **服务** → **Gitee Pages**
2. 如果未实名认证，会提示先完成认证
3. 认证完成后，点击 **启动** 按钮
4. 部署设置：
   - 部署分支：选择 `main` 或 `master`
   - 部署目录：填写 `dist`（如果根目录有 index.html，可以留空）
5. 点击 **更新** 或 **启动**

### 1.6 访问你的网站

部署成功后，访问地址为：
```
https://你的用户名.gitee.io/你的仓库名/
```

例如：
```
https://zhangsan.gitee.io/vue-notespace/
```

---

## 二、后端部署方案

Gitee 本身不提供后端服务托管，推荐使用以下国内云平台：

### 方案一：阿里云 ECS + 宝塔面板（推荐新手）

#### 2.1 购买阿里云 ECS

1. 访问 [阿里云官网](https://www.aliyun.com)
2. 购买 ECS 云服务器（推荐配置：2核4G）
3. 选择操作系统：CentOS 7.x 或 Ubuntu 20.04

#### 2.2 安装宝塔面板

```bash
# CentOS 安装命令
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu 安装命令
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

安装完成后，保存宝塔面板地址和账号密码。

#### 2.3 在宝塔面板中配置环境

1. 登录宝塔面板
2. 安装软件：
   - **Java 项目管理器**（在软件商店搜索 "Java"）
   - **MySQL 8.0**
   - **Nginx**（用于反向代理）

3. 创建数据库：
   - 数据库名：`notespace`
   - 用户名：自定义
   - 密码：自定义

#### 2.4 上传后端项目

1. 将后端项目打包成 JAR：
```bash
mvn clean package -DskipTests
```

2. 在宝塔面板中：
   - 点击 **文件** → 进入 `/www/wwwroot/`
   - 上传 JAR 文件到 `notespace-server` 文件夹

3. 在 **Java 项目管理器** 中：
   - 添加 Java 项目
   - 选择 JAR 文件路径
   - 设置端口：`8080`
   - 添加环境变量（数据库连接等）

#### 2.5 配置 Nginx 反向代理

1. 在宝塔面板 → **网站** → 添加站点
2. 站点设置 → **反向代理** → 添加：
   - 代理名称：`api`
   - 目标URL：`http://127.0.0.1:8080`
   - 发送域名：`$host`

---

### 方案二：腾讯云轻量应用服务器

#### 2.1 购买轻量应用服务器

1. 访问 [腾讯云官网](https://cloud.tencent.com)
2. 购买 **轻量应用服务器**（Lighthouse）
3. 选择镜像：Docker 基础镜像

#### 2.2 使用 Docker 部署后端

```bash
# 连接服务器后
docker run -d \
  --name notespace-db \
  -e MYSQL_ROOT_PASSWORD=你的密码 \
  -e MYSQL_DATABASE=notespace \
  -p 3306:3306 \
  mysql:8.0

# 部署后端服务
docker run -d \
  --name notespace-api \
  -p 8080:8080 \
  -e DB_HOST=你的数据库地址 \
  -e DB_PORT=3306 \
  -e DB_NAME=notespace \
  -e DB_USER=root \
  -e DB_PASSWORD=你的密码 \
  你的后端镜像
```

---

### 方案三：华为云云耀云服务器

与阿里云 ECS 配置类似，可以使用宝塔面板部署。

---

## 三、数据库部署方案

### 3.1 云数据库 MySQL

推荐使用云厂商提供的托管数据库：

| 平台 | 产品 | 免费额度 |
|------|------|----------|
| 阿里云 | RDS MySQL | 通常有试用 |
| 腾讯云 | TencentDB for MySQL | 通常有试用 |
| 华为云 | 云数据库 RDS | 通常有试用 |

### 3.2 自建 MySQL

如果使用 ECS 自建 MySQL：

```bash
# 安装 MySQL
sudo apt update
sudo apt install mysql-server

# 安全配置
sudo mysql_secure_installation

# 创建数据库和用户
mysql -u root -p
```

```sql
CREATE DATABASE notespace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'notespace'@'%' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON notespace.* TO 'notespace'@'%';
FLUSH PRIVILEGES;
```

---

## 四、前端配置后端 API 地址

### 4.1 方式一：环境变量（推荐）

在前端项目中，修改或创建 `.env.production`：

```env
# .env.production
VITE_API_BASE_URL=https://你的后端域名/api
```

然后在代码中使用：

```typescript
const apiBase = import.meta.env.VITE_API_BASE_URL
axios.defaults.baseURL = apiBase
```

### 4.2 方式二：构建时替换

在构建时直接替换 API 地址：

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://你的后端域名/api')
  }
})
```

---

## 五、完整部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Gitee Pages (前端)                         │
│         https://username.gitee.io/vue-notespace/            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 + TypeScript 静态资源                         │  │
│  │  API 请求指向: https://api.yourdomain.com            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             阿里云/腾讯云 ECS (后端服务)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nginx (反向代理) :443/:80                           │  │
│  │     │                                                │  │
│  │     ▼                                                │  │
│  │  Spring Boot 应用 :8080                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              云数据库 MySQL 8.0 (数据存储)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  t_user, t_notebook, t_note, t_tag, t_note_tag      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、域名配置（可选）

### 6.1 购买域名

推荐域名服务商：
- 阿里云：[wanwang.aliyun.com](https://wanwang.aliyun.com)
- 腾讯云：[dnspod.cn](https://www.dnspod.cn)

### 6.2 配置 DNS 解析

| 记录类型 | 主机记录 | 记录值 | 说明 |
|---------|---------|--------|------|
| CNAME | www | username.gitee.io | 前端 |
| A | api | 你的服务器IP | 后端API |

### 6.3 配置 SSL 证书

使用宝塔面板可以免费申请 Let's Encrypt 证书：
1. 网站设置 → **SSL** → **Let's Encrypt**
2. 申请并开启强制 HTTPS

---

## 七、常见问题

### 7.1 Gitee Pages 更新延迟

**问题**：推送代码后，Pages 网站没有更新

**解决**：
1. 进入 Gitee Pages 页面
2. 点击 **更新** 按钮（每月有更新次数限制）
3. 或等待 5-10 分钟自动更新

### 7.2 跨域问题

**问题**：前端请求后端 API 出现 CORS 错误

**解决**：在后端 Spring Boot 中添加 CORS 配置

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("https://你的前端域名.gitee.io");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 7.3 路由模式问题

**问题**：刷新页面出现 404

**解决**：前端使用 `createWebHistory` 时，需要后端 Nginx 配置

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 八、成本预估

| 服务 | 配置 | 月费（约） |
|------|------|-----------|
| Gitee Pages | 静态托管 | 免费 |
| 阿里云 ECS | 2核4G | ¥60-100 |
| 云数据库 MySQL | 基础版 | ¥50-80 |
| 域名 | .com | ¥10/年 |
| **总计** | | **¥110-180/月** |

---

## 九、快速部署命令参考

### 前端构建部署

```bash
# 1. 修改配置
# 编辑 vite.config.ts，设置 base 路径

# 2. 构建项目
npm run build

# 3. 推送到 Gitee
git add .
git commit -m "Build for Gitee Pages"
git push gitee main

# 4. 在 Gitee 上手动更新 Pages
```

### 后端构建部署

```bash
# 1. 构建 JAR
mvn clean package -DskipTests

# 2. 上传到服务器
scp target/notespace-server.jar root@your-server:/www/wwwroot/

# 3. 服务器上运行
nohup java -jar /www/wwwroot/notespace-server.jar > app.log 2>&1 &
```

---

**文档版本**: v1.0
**创建日期**: 2025-01-31
**适用项目**: vue-notespace
