import { createHash } from 'node:crypto'

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
  return generateCaptchaHash({ code: code.toLowerCase(), key, timestamp, captchaKey }) === hash
}

export function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${
    svg.replace('<svg', (~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
      .replace(/"/g, '\'')
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/\{/g, '%7B')
      .replace(/\}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
  }`
}
