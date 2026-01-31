// Token 存储的键名
const TOKEN_KEY = 'notespace_token'
const REFRESH_TOKEN_KEY = 'notespace_refresh_token'
const USER_INFO_KEY = 'notespace_user_info'

/**
 * 存储 Token
 */
export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取 Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 Token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 存储刷新 Token
 */
export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 获取刷新 Token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 移除刷新 Token
 */
export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 存储用户信息
 */
export const setUserInfo = (userInfo: any) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): any | null => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}
