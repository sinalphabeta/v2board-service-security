export const encoder = new TextEncoder()
export const password = process.env.PASSWORD
export const domain = process.env.DOMAIN || 'http://localhost:3000'
export const port = process.env.PORT || 3000
// 动态代理配置
export const proxyConfig = process.env.PROXY_URL
  ? { proxy: process.env.PROXY_URL }
  : {}
const passwordBuffer = encoder.encode(password)

const pbkdf2Key = await crypto.subtle.importKey(
  'raw',
  passwordBuffer,
  'PBKDF2',
  false,
  ['deriveBits', 'deriveKey'],
)

export const aesKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: passwordBuffer, iterations: 10000, hash: 'SHA-256' },
  pbkdf2Key,
  { name: 'AES-GCM', length: 128 },
  true,
  ['encrypt', 'decrypt'],
)

const originalPathnameList = [
  '/api/v1/user/notice/fetch',
  '/api/v1/user/info',
  '/api/v1/user/comm/config',
  '/api/v1/guest/comm/config',
  '/api/v1/user/plan/fetch',
  '/api/v1/user/order/fetch',
  '/api/v1/user/order/detail',
  '/api/v1/user/server/fetch',
  '/api/v1/user/knowledge/fetch',
  '/api/v1/user/knowledge/fetch',
  '/api/v1/user/invite/save',
  '/api/v1/user/invite/fetch',
  '/api/v1/user/invite/details',
  '/api/v1/user/ticket/fetch',
  '/api/v1/user/ticket/fetch',
  '/api/v1/bing/vip',
  '/api/v1/user/getSubscribe',
  '/api/v1/user/order/getPaymentMethod',
  '/api/v1/user/stat/getTrafficLog',
  '/api/v1/user/getStat',
  '/api/v1/user/resetSecurity',
  '/api/v1/user/coupon/check',
  '/api/v1/user/order/save',
  '/api/v1/user/order/checkout',
  '/api/v1/user/order/cancel',
  '/api/v1/user/update',
  '/api/v1/user/update',
  '/api/v1/user/transfer',
  '/api/v1/user/ticket/withdraw',
  '/api/v1/user/redeemgiftcard',
  '/api/v1/user/ticket/save',
  '/api/v1/user/ticket/close',
  '/api/v1/user/ticket/reply',
  '/api/v1/passport/auth/login',
  '/api/v1/user/logout',
  '/api/v1/passport/auth/check',
  '/api/v1/passport/auth/register',
  '/api/v1/user/changePassword',
  '/api/v1/passport/auth/forget',
  '/api/v1/passport/comm/sendEmailVerify',
  '/api/v1/passport/auth/token2Login',

  // 自定义接口
  '/api/v1/r8d/quick/plan', // 免登获取套餐列表
  '/api/v1/r8d/quick/order/payment', // 免登获取订单支持的付款方式
  '/api/v1/r8d/quick/coupon', // 免登获取优惠券信息
  '/api/v1/r8d/quick/order', // 创建免登订单
  '/api/v1/r8d/quick/order/detail/:id', // 免登获取订单详情
]

async function genPathnameMap() {
  const results = await Promise.all(originalPathnameList.map(async (pathname) => {
    return [pathname, await crypto.subtle.digest('SHA-1', encoder.encode(`${pathname}#${password}`))] as const
  }))
  return results.reduce((acc, [pathname, hash]) => {
    acc[`/${Buffer.from(hash).toString('hex')}`] = pathname
    return acc
  }, {} as Record<string, string>)
}

export const pathnameMap = await genPathnameMap()
console.log('pathnameMap', pathnameMap)
