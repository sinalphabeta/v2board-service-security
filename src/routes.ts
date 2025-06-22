import type Koa from 'koa'
import type { PlanPeriodKey } from './services/backend'
import type { CaptchaType } from './types/captcha'
import * as process from 'node:process'
import KoaRouter from '@koa/router'
import { domain, proxyConfig, smtpNewUserSubject } from './env'
import { BackendService } from './services/backend'
import { generateCaptchaData, generateCaptchaHash, verifyCaptchaHash } from './services/captcha'
import { MailerService } from './services/mailer'
import { renderHtml } from './utlis'

export const router = new KoaRouter()

// 自定义接口扩展
/**
 * 免登获取套餐列表
 */
router.get('/api/v1/r8d/quick/plan', async (ctx: Koa.Context) => {
  try {
    ctx.response.body = await BackendService.instance.getPlanList()
  }
  catch (e) {
    console.error('getPlanList 500', e)
    ctx.response.status = 500
    ctx.response.body = {
      code: 500,
      message: '获取套餐列表失败',
    }
  }
})

/**
 * 免登获取订单支持的付款方式
 */
router.get('/api/v1/r8d/quick/order/payment', async (ctx: Koa.Context) => {
  try {
    ctx.response.body = await BackendService.instance.getOrderPayments()
  }
  catch (e) {
    console.error('getOrderDetail 500', e)
    ctx.response.status = 500
    ctx.response.body = {
      code: 500,
      message: '获取订单支持方式失败',
    }
  }
})

/**
 * 免登获取优惠券信息
 */
router.post('/api/v1/r8d/quick/coupon', async (ctx: Koa.Context) => {
  const data = ctx.request.body as { code: string, plan_id?: string, period?: PlanPeriodKey }
  console.log('优惠券验证请求体:', data)
  try {
    ctx.response.body = await BackendService.instance.getCouponData(data)
  }
  catch (error) {
    console.error('getCouponData 500', error)
    ctx.response.status = 500
    ctx.response.body = {
      code: 500,
      message: '获取优惠券信息失败',
    }
  }
})

/**
 * 获取验证码
 */
router.get('/api/v1/r8d/quick/captcha', async (ctx: Koa.Context) => {
  const captchaKey = process.env.CAPTCHA_KEY
  if (!captchaKey) {
    ctx.response.status = 200
    ctx.response.body = {
      data: null,
    }
    return
  }
  const { type } = ctx.request.query as { type: CaptchaType }
  try {
    const timestamp = Date.now()

    const { code, dataURL } = await generateCaptchaData()
    const hash = generateCaptchaHash({
      code,
      type,
      timestamp,
      captchaKey,
    })

    ctx.response.body = {
      data: dataURL,
      timestamp,
      hash,
    }
  }
  catch (e) {
    console.error('getCaptcha 500', e)
    ctx.response.status = 500
    ctx.response.body = {
      code: 500,
      message: '获取验证码失败',
    }
  }
})

/**
 * 创建免登订单
 */
router.post('/api/v1/r8d/quick/order', async (ctx: Koa.Context) => {
  const { email, password, planId, period, paymentId, couponCode, captcha } = ctx.request.body as {
    planId: string
    period: PlanPeriodKey
    paymentId: number
    email: string
    password: string
    couponCode?: string
    captcha?: {
      type: string
      code: string
      timestamp: number
      hash: string
    }
  }

  const captchaKey = process.env.CAPTCHA_KEY
  if (captchaKey) {
    // 检查是否提供了验证码
    if (!captcha || !captcha.code || !captcha.type || !captcha.timestamp || !captcha.hash) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '缺少验证码',
      }
      return
    }
    const { code, type, timestamp, hash } = captcha as { code: string, type: CaptchaType, timestamp: number, hash: string }
    // 检查时间戳是否在有效范围内
    if (Date.now() - Number(captcha.timestamp) > 5 * 60 * 1000) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '验证码已过期',
      }
      return
    }
    // 验证验证码哈希
    if (!verifyCaptchaHash({ code, type, timestamp, captchaKey, hash })) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '验证码错误',
      }
      return
    }
  }

  let couponType: 0 | 1 | 2 = 0
  let couponValue = 0
  if (couponCode) {
    const couponData = couponCode && await BackendService.instance.getCouponData({
      code: couponCode,
      plan_id: planId.toString(),
      period,
    })
    if (couponData && couponData.data && couponData.data.value) {
      couponType = couponData.data.type
      couponValue = couponData.data.value
    }
    else {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      const text = couponData.message || '优惠券无效'
      console.error('优惠券验证错误信息:', text)
      ctx.response.status = 500
      ctx.response.body = {
        code: 500,
        message: text,
      }
      return
    }
  }

  const checkUserExist = await BackendService.instance.checkUser(email)
  if (checkUserExist) {
    console.error('用户已存在:', email)
    ctx.response.status = 500
    ctx.response.body = {
      code: 500,
      message: '用户已存在',
    }
    return
  }

  const plans = await BackendService.instance.getPlanList()
  const findPlan = plans.find(plan => plan.id.toString() === planId)!
  const originalPrice = findPlan[period] || 0
  const preferential = couponValue === 0 ? 0 : (couponType === 1 ? couponValue * 0.01 : originalPrice * (couponValue * 0.01))
  const totalAmount = originalPrice - preferential

  // 创建用户
  const authToken = await BackendService.instance.createUser({ email, password })
  console.log('createUser:', email, authToken)

  // 创建订单
  const order = await BackendService.instance.createOrder({
    email,
    planId,
    period,
    totalAmount,
  })
  console.log('createOrder:', email, order)

  // 获取支付链接
  const payment = await BackendService.instance.getOrderCheckout({
    trade_no: order,
    token: authToken,
    paymentId, // 默认使用支付宝支付
  })

  // 发送新用户邮件
  const template = MailerService.instance.newUserTemplate
    ? {
        html: renderHtml(MailerService.instance.newUserTemplate, { email, password }),
      }
    : {
        text: `${smtpNewUserSubject}！\n\n您的账号信息：\n邮箱: ${email}\n密码: ${password}\n\n请妥善保管您的账号信息。`,
      }
  MailerService.instance.sendMail(email, smtpNewUserSubject || '通知', template)

  ctx.response.body = {
    authToken,
    orderId: order,
    checkout: {
      type: payment.type,
      data: payment.data,
    },
  }
})

// proxy
router.all('/api/v1/:segments*', async (ctx: Koa.Context) => {
  const headers = new Headers(ctx.request.headers as Record<string, string>)

  // 移除问题头
  const removeHeaders = [
    'x-salt',
    'content-length',
    'x-origin-content-type',
    'host',
  ]
  removeHeaders.forEach(h => headers.delete(h))

  // 代理请求
  const url = new URL(domain as string)
  const { query, path, rawBody } = ctx.request
  query && (url.search = new URLSearchParams(query as Record<string, string | readonly string[]>).toString())
  url.pathname = path
  console.log('代理转发请求:', `${ctx.method} ${url.toString()}`, 'path:', path)

  // 注册路由的验证码校验
  const captchaKey = process.env.CAPTCHA_KEY
  const captchaRegisterEnabled = process.env.CAPTCHA_EREGISTRATION_ENABLED === 'true'
  const IsRegistrationPath = path === '/api/v1/passport/auth/register'
  if (captchaKey && captchaRegisterEnabled && IsRegistrationPath) {
    const body = ctx.request.body as {
      email: string
      password: string
      email_code: string
      invite_code?: string
      recaptcha_data?: string
      captcha?: {
        code: string
        type: CaptchaType
        timestamp: number
        hash: string
      }
    }
    // 检查是否提供了验证码
    if (!body.captcha) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '缺少验证码',
      }
      return
    }
    const { code, type, timestamp, hash } = body.captcha
    // 检查时间戳是否在有效范围内
    if (Date.now() - Number(timestamp) > 5 * 60 * 1000) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '验证码已过期',
      }
      return
    }
    // 验证验证码哈希
    if (!verifyCaptchaHash({ code, type, timestamp, captchaKey, hash })) {
      ctx.response.status = 500
      ctx.response.body = {
        code: 502,
        message: '验证码错误',
      }
      return
    }
  }

  const response = await fetch(url, {
    method: ctx.method,
    headers,
    body: rawBody,
    verbose: false, // 调试用，输出详细日志
    ...proxyConfig,
  })

  ctx.response.status = response.status
  ctx.response.body = await response.text()

  const omitHeaders = ['vary', 'transfer-encoding', 'content-length', 'content-encoding']
  for (const [key, value] of response.headers.entries()) {
    if (!omitHeaders.includes(key)) {
      ctx.response.set(key, value)
    }
  }
})
