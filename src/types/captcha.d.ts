export type CaptchaType = 'quick' | 'register' | 'login'

export interface CaptchaCheckOptions {
  code: string
  type: CaptchaType
  timestamp: number
  hash: string
}
