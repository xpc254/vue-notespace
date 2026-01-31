/**
 * 密码加密工具
 * 使用 SHA256 对密码进行哈希，防止明文传输
 */

/**
 * SHA256 哈希函数
 * @param input 原始字符串
 * @returns SHA256 哈希值（十六进制字符串）
 */
export async function sha256(input: string): Promise<string> {
  // 将字符串转换为 Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  // 使用 SubtleCrypto 进行 SHA256 哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // 将 ArrayBuffer 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * 同步版本的 SHA256（使用简单的哈希算法作为后备）
 * 注意：这个版本不安全，仅用于非关键场景
 * @param input 原始字符串
 * @returns 哈希值
 */
export function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * 加密密码（在发送到服务器之前调用）
 * @param password 原始密码
 * @returns 加密后的密码
 */
export async function encryptPassword(password: string): Promise<string> {
  return await sha256(password)
}
