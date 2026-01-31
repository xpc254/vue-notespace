// 笔记本类型
export interface Notebook {
  id: number
  name: string
  icon: string
  color: string
}

// 笔记类型
export interface Note {
  id: number
  title: string
  content: string
  updatedAt: string
  tags: string[]
  notebookId: number
  isPinned: boolean
  isShared: boolean
  shareUrl?: string
}

// 视图状态类型
export type ViewState = 'all' | 'pinned' | 'shared'

// 移动端视图类型
export type MobileView = 'sidebar' | 'list' | 'editor'
