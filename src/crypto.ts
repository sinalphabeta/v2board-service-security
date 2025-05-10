import type { BufferSource } from 'node:stream/web'
import { aesKey, domain, pathnameMap } from './env'

// aes-128-gcm 解密
export async function decrypt(encrypted: BufferSource, salt: BufferSource) {
  // 解密数据
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', length: 128, iv: salt },
    aesKey,
    encrypted,
  )

  const decoder = new TextDecoder()
  // 将解密数据转换为字符串
  const decryptedString = decoder.decode(decrypted)

  return decryptedString
}

// aes-128-gcm 加密
export async function encrypt(data: BufferSource, salt: BufferSource) {
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', length: 128, iv: salt },
    aesKey,
    data,
  )

  return Buffer.from(encrypted).toString('base64')
}

export function parsePathname(path: string) {
  const url = new URL(path, domain)
  return pathnameMap[url.pathname as keyof typeof pathnameMap] || path
}
