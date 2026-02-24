import axios from 'axios'
import { encryptPassword } from '@/utils/encrypt'
import { getToken, clearAuth } from '@/utils/auth'

// API 基础配置
const BASE_URL = 'http://106.54.240.26:3000'

// 是否启用前端密码加密
const ENABLE_PASSWORD_ENCRYPTION = true

// 响应数据类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 登录响应数据
export interface LoginResponse {
  userId: number
  username: string
  email: string
  avatar: string | null
  token: string
  refreshToken: string
}

// 用户信息
export interface UserInfo {
  userId: number
  username: string
  email: string
  avatar: string | null
}

// 笔记本类型
export interface Notebook {
  id: number
  userId: number
  name: string
  icon: string
  color: string
  sortOrder: number
  createTime: string
  updateTime: string
}

// 笔记类型
export interface Note {
  id: number
  userId: number
  notebookId: number
  title: string
  content: string
  preview: string
  isPinned: number
  isShared: number
  createTime: string
  updateTime: string
}

// 标签类型
export interface Tag {
  id: number
  userId: number
  name: string
  createTime: string
}

// 分页结果
export interface PageResult<T> {
  total: number
  current: number
  size: number
  records: T[]
}

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加 token 到 header
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code === 200) {
      return data
    } else {
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    // 处理401/403错误（token过期或无效）
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 清除本地存储的认证信息
      clearAuth()

      // 触发自定义事件，通知App组件token已过期
      window.dispatchEvent(new CustomEvent('token-expired'))

      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// API 接口定义
export const authApi = {
  // 用户登录（密码自动加密）
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const encryptedPassword = ENABLE_PASSWORD_ENCRYPTION
      ? await encryptPassword(password)
      : password
    return request.post<any, LoginResponse>('/api/auth/login', { email, password: encryptedPassword })
  },

  // 用户注册（密码自动加密）
  register: async (username: string, email: string, password: string): Promise<LoginResponse> => {
    const encryptedPassword = ENABLE_PASSWORD_ENCRYPTION
      ? await encryptPassword(password)
      : password
    return request.post<any, LoginResponse>('/api/auth/register', {
      username,
      email,
      password: encryptedPassword
    })
  },

  // 获取用户信息
  getUserInfo: (): Promise<UserInfo> => {
    return request.get<any, UserInfo>('/api/auth/info')
  },

  // 用户登出
  logout: (): Promise<void> => {
    return request.post('/api/auth/logout')
  }
}

// 笔记本 API
export const notebookApi = {
  // 获取所有笔记本
  getList: async (): Promise<Notebook[]> => {
    return request.get<Notebook[], Notebook[]>('/api/notebook/list')
  },

  // 创建笔记本
  create: async (name: string, icon?: string, color?: string): Promise<Notebook> => {
    return request.post<Notebook, Notebook>('/api/notebook/create', {
      name,
      icon: icon || 'folder',
      color: color || '#3b82f6'
    })
  },

  // 更新笔记本
  update: async (id: number, name?: string, icon?: string, color?: string): Promise<void> => {
    return request.post('/api/notebook/update', {
      id,
      name,
      icon,
      color
    })
  },

  // 删除笔记本
  delete: async (id: number): Promise<void> => {
    return request.post('/api/notebook/delete', { id })
  },

  // 获取笔记本详情
  getDetail: async (id: number): Promise<Notebook> => {
    return request.get<Notebook, Notebook>('/api/notebook/detail', {
      params: { id }
    })
  }
}

// 笔记 API
export const noteApi = {
  // 获取笔记列表
  getList: async (notebookId?: number, page = 1, size = 20): Promise<PageResult<Note>> => {
    return request.get<PageResult<Note>, PageResult<Note>>('/api/note/list', {
      params: { notebookId, page, size }
    })
  },

  // 获取笔记详情
  getDetail: async (id: number): Promise<Note> => {
    return request.get<Note, Note>('/api/note/detail', { params: { id } })
  },

  // 创建笔记
  create: async (notebookId: number, title: string, content: string, tags: string[] = []): Promise<Note> => {
    return request.post<Note, Note>('/api/note/create', {
      notebookId,
      title,
      content,
      tags
    })
  },

  // 更新笔记
  update: async (id: number, title: string, content: string, tags: string[] = []): Promise<void> => {
    return request.post('/api/note/update', {
      id,
      title,
      content,
      tags
    })
  },

  // 删除笔记
  delete: async (id: number): Promise<void> => {
    return request.post('/api/note/delete', { id })
  },

  // 切换固定状态
  togglePin: async (id: number): Promise<{ id: number; isPinned: boolean }> => {
    return request.post('/api/note/togglePin', { id })
  },

  // 开启/关闭分享 - 返回分享链接
  share: async (id: number): Promise<{ shareId: string; shareUrl: string }> => {
    return request.post('/api/note/share', { id })
  },

  // 取消分享
  unshare: async (id: number): Promise<void> => {
    return request.post('/api/note/unshare', { id })
  }
}

// 公开分享 API（不需要认证）
export const shareApi = {
  // 获取分享的笔记（公开访问，无需token）
  getSharedNote: async (shareId: string): Promise<Note> => {
    // 使用原生axios，不添加token
    const response = await axios.get(`${BASE_URL}/api/note/shared/${shareId}`)
    if (response.data.code === 200) {
      return response.data.data
    }
    throw new Error(response.data.message || '加载失败')
  }
}

// 标签 API
export const tagApi = {
  // 获取所有标签
  getList: async (): Promise<Tag[]> => {
    return request.get<Tag[], Tag[]>('/api/tag/list')
  },

  // 创建标签
  create: async (name: string): Promise<Tag> => {
    return request.post<Tag, Tag>('/api/tag/create', { name })
  },

  // 删除标签
  delete: async (id: number): Promise<void> => {
    return request.post('/api/tag/delete', { id })
  }
}

// 搜索 API
export const searchApi = {
  // 搜索笔记
  searchNotes: async (keyword: string, page = 1, size = 20): Promise<{
    total: number
    keyword: string
    list: Note[]
  }> => {
    return request.get('/api/search/note', {
      params: { keyword, page, size }
    })
  },

  // 搜索标签
  searchTags: async (keyword: string): Promise<Array<{ id: number; name: string; noteCount: number }>> => {
    return request.get('/api/search/tag', { params: { keyword } })
  },

  // 按标签获取笔记
  getNotesByTag: async (tagId: number, page = 1, size = 20): Promise<{
    total: number
    tagId: number
    tagName: string
    list: Note[]
  }> => {
    return request.get('/api/note/byTag', {
      params: { tagId, page, size }
    })
  }
}

export default request
