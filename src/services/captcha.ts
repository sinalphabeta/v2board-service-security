import { createHash } from 'node:crypto'
// @ts-ignore
import CaptchaPng from '../captchapng/captchapng'

function generateContrastColors(): {
  background: [number, number, number, number]
  foreground: [number, number, number, number]
} {
  // 随机生成背景色（RGBA）
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const background: [number, number, number, number] = [r, g, b, 255] // A固定为255（不透明）

  // 计算背景色的相对亮度（公式来自WCAG 2.0）
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // 基于背景亮度选择高对比度的前景色
  // 亮度 > 0.5 时使用深色前景，否则使用浅色前景
  const foreground: [number, number, number, number]
    = luminance > 0.5 ? [0, 0, 0, 255] : [255, 255, 255, 255]

  return { background, foreground }
}

export async function generateCaptchaData() {
  const code = Math.floor(Math.random() * 9000) + 1000
  const colors = generateContrastColors()
  const p = new CaptchaPng(180, 60, code) // 生成一个4位数的验证码
  p.color(...colors.background) // First color: background (red, green, blue, alpha)
  p.color(...colors.foreground) // Second color: paint (red, green, blue, alpha)
  return {
    code: code.toString(),
    dataURL: `data:image/png;base64,${p.getBase64()}`,
  }
}

export function generateCaptchaHash(options: {
  code: string
  key: string
  timestamp: number
  captchaKey: string
}): string {
  const { code, key, timestamp, captchaKey } = options
  return createHash('sha256').update(`${timestamp}${code.toLowerCase()}${key}${captchaKey}`).digest('base64')
}

export function verifyCaptchaHash(options: {
  code: string
  key: string
  timestamp: number
  captchaKey: string
  hash: string
}): boolean {
  const { code, key, timestamp, captchaKey, hash } = options
  const verifyHash = generateCaptchaHash({ code, key, timestamp, captchaKey })
  return verifyHash === hash
}
