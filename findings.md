# Findings & Decisions
<!--
  WHAT: Your knowledge base for the task. Stores everything you discover and decide.
  WHY: Context windows are limited. This file is your "external memory" - persistent and unlimited.
  WHEN: Update after ANY discovery, especially after 2 view/browser/search operations (2-Action Rule).
-->

## Requirements
<!--
  WHAT: What the user asked for, broken down into specific requirements.
  WHY: Keeps requirements visible so you don't forget what you're building.
  WHEN: Fill this in during Phase 1 (Requirements & Discovery).
-->
<!-- Initial task: understand the project -->
- [x] Understand the notebook application structure
- [ ] Awaiting specific user requirements

## Research Findings
<!--
  WHAT: Key discoveries from web searches, documentation reading, or exploration.
  WHY: Multimodal content (images, browser results) doesn't persist. Write it down immediately.
  WHEN: After EVERY 2 view/browser/search operations, update this section (2-Action Rule).
-->
### Project Structure
```
src/
├── api/index.ts         # 后端 API 封装 (authApi, notebookApi, noteApi, tagApi, searchApi)
├── components/
│   ├── Login.vue        # 登录页
│   ├── Register.vue     # 注册页
│   ├── Dashboard.vue    # 主面板 (状态管理)
│   ├── Sidebar.vue      # 侧边栏 (笔记本/标签导航)
│   ├── NoteList.vue     # 笔记列表
│   ├── Editor.vue       # 笔记编辑器
│   ├── Modal.vue        # 通用模态框
│   └── ConfirmModal.vue # 确认对话框
├── utils/
│   ├── auth.ts          # Token/用户信息管理 (localStorage)
│   └── encrypt.ts       # 密码加密 (SHA256)
└── types.ts             # TypeScript 类型定义
```

### API Endpoints (后端 localhost:8080)
| 模块 | 端点 | 功能 |
|------|------|------|
| auth | POST /api/auth/login | 用户登录 |
| auth | POST /api/auth/register | 用户注册 |
| auth | GET /api/auth/info | 获取用户信息 |
| auth | POST /api/auth/logout | 用户登出 |
| notebook | GET /api/notebook/list | 获取笔记本列表 |
| notebook | POST /api/notebook/create | 创建笔记本 |
| notebook | POST /api/notebook/update | 更新笔记本 |
| notebook | POST /api/notebook/delete | 删除笔记本 |
| notebook | GET /api/notebook/detail | 获取笔记本详情 |
| note | GET /api/note/list | 获取笔记列表 |
| note | GET /api/note/detail | 获取笔记详情 |
| note | POST /api/note/create | 创建笔记 |
| note | POST /api/note/update | 更新笔记 |
| note | POST /api/note/delete | 删除笔记 |
| note | POST /api/note/togglePin | 切换固定状态 |
| note | GET /api/note/byTag | 按标签获取笔记 |
| tag | GET /api/tag/list | 获取标签列表 |
| tag | POST /api/tag/create | 创建标签 |
| tag | POST /api/tag/delete | 删除标签 |
| search | GET /api/search/note | 搜索笔记 |
| search | GET /api/search/tag | 搜索标签 |

### Features Implemented
1. **Authentication**: Login/Register with email + password, JWT tokens, refresh token support
2. **Notebooks**: Create, edit, delete notebooks with custom icons and colors
3. **Notes**: Create, edit, delete notes with auto-save (2s debounce)
4. **Tags**: Add/remove tags, filter by tags
5. **Pin**: Pin important notes to top
6. **Search**: Search by title and content
7. **Views**: All/Pinned/Shared filter tabs
8. **Mobile Responsive**: Three-pane layout with mobile navigation
9. **Token Expiry Handling**: Custom event dispatch on 401/403

### Features in Backend but Not Fully Used in Frontend
- Note sharing (isShared field exists but UI shows placeholder)
- Advanced tag management API
- Full search API integration

## Technical Decisions
<!--
  WHAT: Architecture and implementation choices you've made, with reasoning.
  WHY: You'll forget why you chose a technology or approach. This table preserves that knowledge.
  WHEN: Update whenever you make a significant technical choice.
-->
| Decision | Rationale |
|----------|-----------|
| N/A | Awaiting user requirements |

## Issues Encountered
<!--
  WHAT: Problems you ran into and how you solved them.
  WHEN: Document when you encounter blockers or unexpected challenges.
-->
| Issue | Resolution |
|-------|------------|
| None yet | N/A |

## Resources
<!--
  WHAT: URLs, file paths, API references, documentation links you've found useful.
  WHY: Easy reference for later. Don't lose important links in context.
  WHEN: Add as you discover useful resources.
-->
- Project: e:\AI学习\notebook\project\vue-notespace
- Backend checklist: 后端开发清单.md

## Visual/Browser Findings
<!--
  WHAT: Information you learned from viewing images, PDFs, or browser results.
  WHY: CRITICAL - Visual/multimodal content doesn't persist in context. Must be captured as text.
  WHEN: IMMEDIATELY after viewing images or browser results. Don't wait!
-->
- N/A (no images viewed yet)

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
