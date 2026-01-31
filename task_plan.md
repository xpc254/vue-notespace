# Task Plan: NoteSpace 分享功能实现
<!--
  WHAT: This is your roadmap for the entire task. Think of it as your "working memory on disk."
  WHY: After 50+ tool calls, your original goals can get forgotten. This file keeps them fresh.
  WHEN: Create this FIRST, before starting any work. Update after each phase completes.
-->

## Goal
<!--
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
-->
实现笔记分享功能：用户可生成分享链接，其他人通过链接查看笔记的公开 HTML 页面

## Current Phase
<!--
  WHAT: Which phase you're currently working on (e.g., "Phase 1", "Phase 3").
  WHY: Quick reference for where you are in the task. Update this as you progress.
-->
Phase 4 - pending (测试验证)

## Phases
<!--
  WHAT: Break your task into 3-7 logical phases. Each phase should be completable.
  WHY: Breaking work into phases prevents overwhelm and makes progress visible.
  WHEN: Update status after completing each phase: pending → in_progress -> complete
-->

### Phase 1: Requirements & Discovery
- [x] Read and understand project structure
- [x] Identify all components and their purposes
- [x] Document current functionality
- [x] Identify backend API endpoints
- **Status:** complete

### Phase 2: Frontend Share Feature
- [x] Define share feature requirements
- [x] Design share URL structure (/share/:shareId)
- [x] Create SharedNote.vue component (public view)
- [x] Create ShareModal.vue component (share dialog)
- [x] Add share button/modal in Editor.vue
- [x] Add shareApi methods (noteApi.share, noteApi.unshare, shareApi.getSharedNote)
- [x] Setup Vue Router with auth guards
- **Status:** complete

### Phase 3: Backend API Implementation
- [x] POST /api/note/share - Generate share link (returns { shareId, shareUrl })
- [x] POST /api/note/unshare - Disable sharing
- [x] GET /api/note/shared/:shareId - Public access to shared note (no auth)
- [x] Database: Add share_id column to Note entity
- [x] SecurityConfig: Allow public access to /note/shared/**
- **Status:** complete

### Phase 4: Testing & Verification
- [ ] Execute db_migration_share.sql on database
- [ ] Start backend server (mvn spring-boot:run)
- [ ] Start frontend dev server (npm run dev)
- [ ] Test share link generation
- [ ] Test public view page (access /share/{shareId} without auth)
- [ ] Test unshare functionality
- **Status:** pending

### Phase 5: Delivery
- [ ] Final review
- [ ] Update documentation
- **Status:** pending

## Key Questions
<!--
  WHAT: Important questions you need to answer during the task.
  WHY: These guide your research and decision-making. Answer them as you go.
-->
1.  ✅ How should the share URL be structured? → /share/:shareId
2.  ✅ Should the shared page require authentication? → No, public access
3.  ✅ Can user disable sharing? → Yes, via unshare API

## Decisions Made
<!--
  WHAT: Technical and design decisions you've made, with the reasoning behind them.
  WHY: You'll forget why you made choices. This table helps you remember and justify decisions.
  WHEN: Update whenever you make a significant choice (technology, approach, structure).
-->
| Decision | Rationale |
|----------|-----------|
| Use Vue Router 4 | Standard routing for Vue 3, enables share URL pattern |
| Share URL: /share/:shareId | Clean, RESTful pattern for public links |
| ShareModal component | Reusable dialog for share settings |
| Separate shareApi | Public API calls don't need auth token |
| Router guards for auth | Protect /app route, allow /share/* publicly |
| Hutool UUID for shareId | Simple, unique 16-char ID generation |
| SecurityConfig permitAll /note/shared/** | Public access without authentication |

## Errors Encountered
<!--
  WHAT: Every error you encounter, what attempt number it was, and how you resolved it.
  WHY: Logging errors prevents repeating the same mistakes. This is critical for learning.
  WHEN: Add immediately when an error occurs, even if you fix it quickly.
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
| session-catchup.py failed (Python not found) | 1 | Skipped catchup, proceeded with manual analysis |
| Note interface missing isShared property | 1 | Added isShared and shareUrl to types.ts |
| TypeScript: unused imports in App.vue | 1 | Removed unused watch, route, isAuthenticated |
| Share link not showing after toggle | 1 | Added watch in Editor.vue to sync props.note.shareUrl |
| Share button freezes after clicks | 1 | Rewrote ShareModal with direct API calls + isLoading guard |

## Notes
<!--
  REMINDERS:
  - Update phase status as you progress: pending -> in_progress -> complete
  - Re-read this plan before major decisions (attention manipulation)
  - Log ALL errors - they help avoid repetition
-->
### Implementation Complete ✅
Full-stack share feature implemented with Quill WYSIWYG editor (swapped from Markdown based on user feedback).

### Storage Format Change
- **Original:** Markdown stored in database, rendered with marked.js
- **Current:** HTML stored in database (from Quill editor), rendered directly with v-html
- **Reason:** Regular users prefer WYSIWYG over Markdown syntax
Frontend and backend share feature implementation is complete.

### Next Steps (Testing)
1. **Database Migration**: Execute `notespace-serve/db_migration_share.sql`
   ```sql
   ALTER TABLE t_note ADD COLUMN share_id VARCHAR(32) UNIQUE COMMENT '分享ID';
   CREATE INDEX idx_share_id ON t_note(share_id);
   ```

2. **Start Backend**:
   ```bash
   cd notespace-serve
   mvn spring-boot:run
   ```

3. **Start Frontend**:
   ```bash
   cd vue-notespace
   npm run dev
   ```

4. **Test Flow**:
   - Login → Create a note → Click "分享" button → Copy link
   - Open incognito/private window → Paste link → Should see note without login
   - Unshare → Link should show "分享链接不存在或已失效"
