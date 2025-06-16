import * as fs from 'node:fs'
import * as path from 'node:path'
import nodemailer from 'nodemailer'

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
    try {
      // 获取模板文件路径（假设与mailer.ts在同一目录）
      const templatePath = path.join(__dirname, '../../assets/NewUser.html')

      // 同步读取模板文件
      this.newUserTemplate = fs.readFileSync(templatePath, 'utf-8')
      console.log('Mailer 邮件模板加载成功')
    }
    catch (error) {
      console.error('加载邮件模板失败:', error)
      this.newUserTemplate = null
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
  }

  async sendNewUser(email: string, password: string) {
    if (!this.transport || !this.newUserTemplate) {
      console.error('Mailer 未初始化，无法发送邮件。请检查配置。')
      return
    }
    await this.transport.sendMail({
      subject: '欢迎使用 AirBuddy',
      html: render(this.newUserTemplate, {
        email,
        password,
      }),
      from: this.auth.user,
      to: email,
    })
    console.log('发送新用户邮件成功:', email)
  }
}
