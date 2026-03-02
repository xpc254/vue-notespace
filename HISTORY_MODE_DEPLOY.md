# Vue History 模式部署指南

## 问题说明

使用 history 模式时，当用户直接访问 `/notespace/app` 这样的路由，服务器会尝试查找对应的文件，但实际只有 `index.html`，导致返回 404 或空白页。

## 解决方案

### 方案 1：Nginx 配置（推荐）

在 Nginx 配置文件中添加 `try_files` 指令：

```nginx
server {
    listen 80;
    server_name 106.54.240.26;

    location /notespace/ {
        # 替换为你的实际路径
        root /var/www/html;
        try_files $uri $uri/ /notespace/index.html;
        index index.html;
    }
}
```

或者使用 `alias`：

```nginx
server {
    listen 80;
    server_name 106.54.240.26;

    location /notespace/ {
        # 替换为你的实际路径
        alias /path/to/vue-notespace/notespace/;
        try_files $uri $uri/ /notespace/index.html;
        index index.html;
    }
}
```

配置后重启 Nginx：
```bash
sudo nginx -t  # 测试配置
sudo systemctl reload nginx  # 重新加载配置
```

### 方案 2：Apache 配置

在 `notespace` 目录下创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /notespace/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /notespace/index.html [L]
</IfModule>
```

### 方案 3：Node.js/Express 服务器

如果你使用 Node.js 服务器，需要配置静态文件服务并添加回退：

```javascript
const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();

// 配置 history 模式回退
app.use(history({
  index: '/notespace/index.html',
  rewrites: [
    {
      from: /^\/notespace\/.*$/,
      to: function(context) {
        return '/notespace/index.html';
      }
    }
  ]
}));

// 静态文件服务
app.use('/notespace', express.static(path.join(__dirname, 'notespace')));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

安装依赖：
```bash
npm install express connect-history-api-fallback
```

### 方案 4：使用 hash 模式（最简单）

如果不想配置服务器，可以改回 hash 模式：

修改 `src/router/index.ts`：
```typescript
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),  // 改回 hash 模式
  routes
})
```

然后重新打包部署。

## 验证部署

配置完成后，测试以下 URL：
- http://106.54.240.26:3000/notespace/ （首页）
- http://106.54.240.26:3000/notespace/app （应用页）
- http://106.54.240.26:3000/notespace/login （登录页）
- http://106.54.240.26:3000/notespace/share/xxx （分享页）

所有页面都应该正常显示，刷新页面也不会出现 404。
