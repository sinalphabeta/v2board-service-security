import chalk from 'chalk'
import { adminApi, adminEmail, adminPassword, domain, panel, proxyConfig } from '../env'

interface Plan {
  id: number
  // "group_id": 1,
  show: 1 | 0
  month_price: null | number
  quarter_price: null | number
  half_year_price: null | number
  year_price: null | number
  two_year_price: null | number
  three_year_price: null | number
  onetime_price: null | number
  reset_price: null | number
}

interface Payment {
  id: number
  payment: string
  enable: 0 | 1
}

export type PlanPeriodKey = 'month_price' | 'quarter_price' | 'half_year_price' | 'year_price' | 'two_year_price' | 'three_year_price' | 'onetime_price' | 'reset_price'

export class BackendService {
  static _instance: BackendService

  static get instance() {
    if (!this._instance) {
      this._instance = new BackendService()
    }
    return this._instance
  }

  panel: 'v2b' | 'xb' = 'v2b'
  origin: string | undefined
  apiPrefix: string | undefined
  headerAuth: string | undefined

  private constructor() {
    if (!adminApi || !adminEmail || !adminPassword) {
      console.warn(chalk.bgYellow('WARNING:'), '无法使用免登接口，请设置环境变量 ADMIN_API_PREFIX, ADMIN_EMAIL 和 ADMIN_PASSWORD')
      return
    }
    this.panel = panel || 'v2b'
    this.origin = domain
    this.apiPrefix = adminApi
  }

  adminApi(api: string) {
    return `${this.origin}/api/v1/${this.apiPrefix}/${api}`
  }

  userApi(api: string) {
    return `${this.origin}/api/v1/user/${api}`
  }

  passportApi(api: string) {
    return `${this.origin}/api/v1/passport/${api}`
  }

  async request<T>(url: string, init: RequestInit) {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.headerAuth!,
        ...init.headers,
      },
      verbose: true,
      ...proxyConfig,
    })

    return await response.json() as Promise<T>
  }

  async initAdminToken() {
    if (!adminApi || !adminEmail || !adminPassword) {
      console.warn(chalk.bgYellow('WARNING:'), '无法初始化 AdminToken，请设置环境变量 ADMIN_API_PREFIX, ADMIN_EMAIL 和 ADMIN_PASSWORD')
      return
    }
    this.headerAuth = await this.getUserToken(adminEmail, adminPassword)
    console.log(chalk.bgGreen('SUCCESS:'), 'AdminToken 初始化完成:', this.headerAuth)
  }

  async checkUser(email: string) {
    const reqInit: RequestInit = {
      method: this.panel === 'xb' ? 'POST' : 'GET',
      headers: {
        'Content-Type': this.panel === 'xb' ? 'application/json' : 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        current: 1,
        pageSize: 20,
        sort: [],
        filter: [{
          id: 'email',
          value: `eq:${email}`,
        }],
      }),
    }

    let url = this.adminApi('user/fetch')
    if (this.panel === 'v2b') {
      const params = new URLSearchParams({
        'filter[0][key]': 'email',
        'filter[0][condition]': '模糊',
        'filter[0][value]': email,
      })
      url = `${url}?${params.toString()}`
      delete reqInit.body
    }

    return await this.request<{ data: { id: number }[] }>(url, {
      ...reqInit,
    }).then(res => !!res.data[0])
  }

  async getUserToken(email: string, password: string) {
    const url = this.passportApi('auth/login')
    const method = 'POST'

    const user = await this.request<{ data: { auth_data: string } }>(url, {
      method,
      body: JSON.stringify({
        email,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    return user.data.auth_data
  }

  async getPlanList() {
    const url = this.userApi('plan/fetch')
    const method = 'GET'

    return (await this.request<{ data: Plan[] }>(url, { method })).data
  }

  async getOrderPayments() {
    const url = this.userApi('order/getPaymentMethod')
    const method = 'GET'

    return (await this.request<{ data: Payment[] }>(url, { method })).data
  }

  async getCouponData(data: { code: string, plan_id?: string, period?: PlanPeriodKey }) {
    const url = this.userApi('coupon/check')
    const method = 'POST'

    return (await this.request<{ data: {
      created_at: number
      updated_at: number
      id: number
      // 优惠券劵码
      code: string
      // 优惠券名称
      name: string
      // 优惠券类型, 1:金额 2:折扣
      type: 1 | 2
      // 优惠券折扣值, 如果是折扣券则为折扣百分比, 如果是金额券则为金额值，都要乘以0.01
      value: number
      show: number
      // 优惠券生效的开始时间
      started_at: number
      // 优惠券生效的结束时间
      ended_at: number
      // 优惠券生效的指定套餐
      limit_plan_ids: string[] | null
      // 优惠券生效的指定周期
      limit_period: PlanPeriodKey[] | null
      // 优惠券使用次数限制
      limit_use: number | null
      // 优惠券使用次数限制（每个用户）
      limit_use_with_user: number | null
    } }>(url, { method, body: JSON.stringify(data),
    }))
  }

  async createUser({ email, password, invite_code }: { email: string, password: string, invite_code?: string }) {
    const url = this.passportApi('auth/register')
    const method = 'POST'

    const user = await this.request<{
      data: {
        token: string
        auth_data: string
      }
    }>(url, {
      method,
      body: JSON.stringify({
        email,
        password,
        ...(invite_code ? { invite_code } : {}),
      }),
    })

    return user.data.auth_data
  }

  async createOrder({ token, plan_id, period, coupon_code }: { token: string, plan_id: string | number, period: string, coupon_code?: string }) {
    const url = this.userApi('order/save')
    const method = 'POST'
    const res = await this.request<{ data: string }>(url, {
      method,
      body: JSON.stringify({
        plan_id: plan_id.toString(),
        period,
        ...(coupon_code ? { coupon_code } : {}),
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })

    return res.data
  }

  async checkoutOrder({ token, trade_no, paymentId }: { token: string, trade_no: string, paymentId: number },
  ) {
    const url = this.userApi('order/checkout')
    const method = 'POST'

    return await this.request<{
      data: string
      type: 0 | 1 | -1 // 0:qrcode 1:url -1:0元支付成功
    }>(url, {
      method,
      body: JSON.stringify({
        trade_no,
        method: paymentId,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    })
  }
}
