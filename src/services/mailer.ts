import nodemailer from 'nodemailer'
import { proxyConfig } from '../env'

const render = (template: string, data: Record<string, string>) => template.replace(/\$\{(\w+)\}/g, (_match, key) => data[key] || '')

export class MailerService {
  static _instance: MailerService

  static get instance() {
    if (!this._instance) {
      this._instance = new MailerService()
    }
    return this._instance
  }

  host: string
  port: number
  secure: boolean // Use `true` for port 465, `false` for all other ports
  auth: {
    user: string
    pass: string
  }

  newUserTemplate: string | null = null // 存储HTML模板
  transport: nodemailer.Transporter | undefined

  private constructor() {
    this.host = process.env.MAIL_HOST as string
    this.port = Number(process.env.MAIL_PORT) || 465
    this.secure = process.env.MAIL_SECURE === 'true'
    this.auth = {
      user: process.env.MAIL_USER as string,
      pass: process.env.MAIL_PASS as string,
    }
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_HOST || !process.env.MAIL_PORT) {
      console.error('Mailer 配置不完整。请检查您的环境变量。')
      return
    }
    this.transport = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: this.auth,
    })
    console.log('Mailer 初始化完成:', this.host, this.port, this.auth.user)
  }

  async init() {
    if (!this.transport) {
      return
    }
    // 验证邮件配置
    await this.transport.verify().then((res) => {
      console.log('Mailer 配置验证成功:', res)
    }).catch((err) => {
      console.error('Mailer 配置验证失败:', err)
    })

    // 加载邮件模板
    if (!process.env.MAIL_NEWUSER_URL) {
      console.error('新用户邮件模板 URL 未配置，将使用纯文本邮件模板')
      return
    }
    console.log('加载新用户邮件模板:', process.env.MAIL_NEWUSER_URL)
    const res = await fetch(process.env.MAIL_NEWUSER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      verbose: true,
      ...proxyConfig,
    })

    this.newUserTemplate = await res.text()
    console.log('新用户邮件模板加载成功:', this.newUserTemplate.length)
  }

  async sendNewUser(email: string, password: string) {
    if (!this.transport) {
      console.error('Mailer 未初始化，无法发送邮件。请检查配置。')
      return
    }
    const template = this.newUserTemplate
      ? {
          html: render(this.newUserTemplate, { email, password }),
        }
      : {
          text: `${process.env.MAIL_SUBJECT}！\n\n您的账号信息：\n邮箱: ${email}\n密码: ${password}\n\n请妥善保管您的账号信息。`,
        }
    await this.transport.sendMail({
      subject: process.env.MAIL_SUBJECT,
      ...template,
      from: this.auth.user,
      to: email,
    })
    console.log('发送新用户邮件成功:', email)
  }
}
