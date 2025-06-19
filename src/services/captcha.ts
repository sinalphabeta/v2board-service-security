import type { Canvas, CanvasRenderingContext2D } from 'canvas'
import { createHash } from 'node:crypto'
import { createCanvas } from 'canvas'

// 配置选项接口
interface CaptchaOptions {
  width?: number
  height?: number
  code: string
}

// 生成验证码图片的单个函数
export async function generateCaptchaImageDataUrl(options: CaptchaOptions): Promise<string> {
  const { width = 180, height = 60, code } = options

  try {
    // 预生成颜色数组
    const COLORS = Array.from({ length: 50 }, () =>
      `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`)

    // 获取随机颜色的辅助函数
    const getRandomColor = (): string => {
      return COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    const canvas: Canvas = createCanvas(width, height)
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

    // 设置背景
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, width, height)

    // 生成干扰线
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = getRandomColor()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
    }
    ctx.stroke()

    // 生成干扰点
    ctx.beginPath()
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = getRandomColor()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI)
    }
    ctx.fill()

    // 绘制验证码文本
    ctx.font = 'bold 24px Arial'
    ctx.textBaseline = 'middle'

    const charWidth = width / (code.length + 1)

    for (let i = 0; i < code.length; i++) {
      const char = code[i]
      const x = charWidth * (i + 1)
      const y = height / 2

      // 轻微旋转字符
      const angle = (Math.random() - 0.5) * 0.2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // 使用变换矩阵
      ctx.setTransform(cos, sin, -sin, cos, x, y)
      ctx.fillStyle = getRandomColor()
      ctx.fillText(char, 0, 0)
    }

    // 重置变换矩阵
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    // 生成图片Buffer
    const result = await new Promise<string>((resolve, reject) => {
      canvas.toDataURL('image/jpeg', 0.5, (err, result) => {
        if (err)
          reject(err)
        resolve(result)
      })
    })

    return result
  }
  catch (error) {
    console.error('Failed to generate captcha:', error)
    throw new Error('Captcha generation failed')
  }
}

export function generateCaptchaCode(options: {
  length?: number
  timestamp?: number
  key: string
}): string {
  const { length = 4, timestamp = Date.now(), key } = options
  const hash = createHash('sha256').update(`${timestamp}${key}`).digest('base64')
  return hash.slice(0, length)
}

export function verifyCaptchaCode(options: {
  code: string
  key: string
  timestamp: number
}): boolean {
  const { code, key, timestamp } = options
  return generateCaptchaCode({ key, timestamp }).toLowerCase() === code.toLowerCase()
}
