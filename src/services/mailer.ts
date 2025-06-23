import chalk from 'chalk'
import nodemailer from 'nodemailer'
import { proxyConfig, smtpHost, smtpNewUserTemplate, smtpPassword, smtpPort, smtpSecure, smtpUser } from '../env'

export class MailerService {
  static _instance: MailerService

  static get instance() {
    if (!this._instance) {
      this._instance = new MailerService()
    }
    return this._instance
  }

  host?: string
  port?: number
  secure?: boolean // Use `true` for port 465, `false` for all other ports
  auth?: {
    user: string
    pass: string
  }

  newUserTemplate: string | null = null // 存储HTML模板
  transport: nodemailer.Transporter | undefined

  private constructor() {
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.warn(chalk.bgYellow('WARNING:'), '无法使用邮件服务，请设置环境变量 MAIL_USER, MAIL_PASS, MAIL_HOST 和 MAIL_PORT')
      return
    }
    this.host = smtpHost
    this.port = Number(smtpPort) || 465
    this.secure = smtpSecure
    this.auth = {
      user: smtpUser,
      pass: smtpPassword,
    }
    this.transport = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: this.auth,
    })
    console.log('Mailer 初始化配置:', this.host, this.port, this.auth.user)
  }

  async init() {
    if (!this.transport) {
      return
    }
    // 验证邮件配置
    await this.transport.verify().then((res) => {
      console.log(chalk.bgGreen('SUCCESS:'), 'Mailer 配置验证成功:', res)
    }).catch((err) => {
      console.error(chalk.bgRedBright('ERROR:'), 'Mailer 配置验证失败:', err)
    })

    // 加载邮件模板
    if (!smtpNewUserTemplate) {
      console.warn(chalk.bgYellow('WARNING:'), '新用户邮件模板 URL 未配置，将使用纯文本邮件模板')
      return
    }
    console.log('加载新用户邮件模板:', smtpNewUserTemplate)
    const res = await fetch(smtpNewUserTemplate, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      verbose: true,
      ...proxyConfig,
    })

    this.newUserTemplate = await res.text()
    console.log(chalk.bgGreen('SUCCESS:'), '新用户邮件模板加载成功:', this.newUserTemplate.length)
  }

  async sendMail(email: string, subject: string, content: { text?: string, html?: string }) {
    if (!this.transport || !this.auth) {
      console.error(chalk.bgYellow('WARNING:'), '无法发送邮件，请设置环境变量 MAIL_USER, MAIL_PASS, MAIL_HOST 和 MAIL_PORT')
      return
    }
    await this.transport.sendMail({
      subject,
      ...content,
      from: this.auth.user,
      to: email,
    })
  }
}
