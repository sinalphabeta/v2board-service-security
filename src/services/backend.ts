import { proxyConfig } from '../env'

export class BackendService {
  static _instance: BackendService

  static get instance() {
    if (!this._instance) {
      this._instance = new BackendService()
    }
    return this._instance
  }

  headerAuth: string
  apiPrefix: string
  origin: string

  private constructor() {
    this.headerAuth = process.env.ADMIN_TOKEN as string
    this.apiPrefix = process.env.BACKEND_API_PREFIX as string
    this.origin = process.env.DOMAIN as string
  }

  api(api: string) {
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
        'Authorization': this.headerAuth,
        ...init.headers,
      },
      verbose: true,
      ...proxyConfig,
    })

    return await response.json() as Promise<T>
  }

  async initAdminToken(email: string, password: string) {
    this.headerAuth = await this.getUserToken(email, password)
    console.log('AdminToken 初始化完成:', this.headerAuth)
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

  async checkUser(email: string) {
    const url = this.api('user/fetch')
    const method = 'GET'

    const params = new URLSearchParams({
      'filter[0][key]': 'email',
      'filter[0][condition]': '模糊',
      'filter[0][value]': email,
    })

    return await this.request<{ data: { id: number }[] }>(`${url}?${params.toString()}`, {
      method,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(res => !!res.data[0])
  }

  async createUser({ email, password }: { email: string, password: string }) {
    const url = this.api('user/generate')
    const method = 'POST'

    const [emailPrefix, emailSuffix] = email.split('@')

    await this.request(url, {
      method,
      body: new URLSearchParams({
        email_prefix: emailPrefix,
        email_suffix: emailSuffix,
        password,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return await this.getUserToken(email, password)
  }

  async createOrder({
    email,
    planId,
    period,
    totalAmount,
  }: {
    email: string
    planId: string
    period: string // year_price
    totalAmount: number// ￥199.00
  }) {
    if (!totalAmount || totalAmount === 0) {
      throw new Error('totalAmount NaN')
    }

    const url = this.api('order/assign')
    const method = 'POST'
    console.log({
      email,
      plan_id: planId.toString(),
      period,
      total_amount: totalAmount,
    })
    return (await this.request<{ data: string }>(url, {
      method,
      body: new URLSearchParams({
        email,
        plan_id: planId,
        period,
        total_amount: totalAmount.toString(),
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })).data
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

  async getOrderCheckout(
    {
      trade_no,
      token,
      paymentId,
    }: {
      trade_no: string
      token: string
      paymentId: number
    },
  ) {
    const url = this.userApi('order/checkout')
    const method = 'POST'

    const order = await this.request<{
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

    return order
  }
}

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
