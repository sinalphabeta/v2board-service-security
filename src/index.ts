import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Koa from 'koa'
import { decrypt, encrypt, parsePathname } from './crypto'
import { domain, encoder, port } from './env'
import { router } from './routes'
import { BackendService } from './services/backend'
import { MailerService } from './services/mailer'

const app = new Koa()

app.use(bodyParser({
  encoding: 'utf-8',
  enableTypes: ['json', 'text', 'form'],
  extendTypes: {
    json: ['application/json'],
    text: ['text/plain'],
    form: ['application/x-www-form-urlencoded'],
  },
}))

// 配置 CORS
app.use(cors({
  origin: (ctx: Koa.Context) => ctx.get('Origin') || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['x-salt', 'x-encrypt-response', 'x-origin-content-type', 'authorization', 'content-type'],
  exposeHeaders: ['x-salt', 'x-encrypt-response', 'x-origin-content-type', 'authorization', 'content-type'],
}))

// 中间件：处理加密请求
app.use(async (ctx, next) => {
  console.log('\n原始请求:', `${ctx.method} ${ctx.request.path} ${JSON.stringify(ctx.request.query)}`, ctx.request.body)
  const salt = ctx.request.get('x-salt')
  const saltBuffer = salt && Buffer.from(salt, 'base64')
  console.log('请求头 x-salt:', salt)

  if (salt && saltBuffer) {
    const rawQuery = ctx.query.q as string
    // 获取 body 的原始数据
    const rawBody = ctx.method === 'GET' ? null : ctx.request.rawBody
    const rawPathname = new URL(ctx.request.path, domain).pathname
    // 解密
    const decryptPathname = parsePathname(rawPathname)
    const decryptQuery = rawQuery && await decrypt(Buffer.from(rawQuery, 'base64'), saltBuffer)
    const decryptBody = rawBody && ctx.request.headers['x-origin-content-type']?.includes('application/json') && ctx.request.headers['content-type']?.includes('text/plain') && await decrypt(Buffer.from(rawBody, 'base64'), saltBuffer)

    ctx.request.path = decryptPathname
    // 处理查询参数
    if (decryptQuery) {
      try {
        ctx.request.query = JSON.parse(decryptQuery)
      }
      catch (e) {
        console.error('解析查询参数失败:', e)
      }
    }
    // 关键修复：保留解密后的原始字符串
    if (decryptBody) {
      try {
        // 保存解密后的原始字符串
        ctx.request.rawBody = decryptBody
        // 尝试解析为对象供后续中间件使用
        ctx.request.body = JSON.parse(decryptBody)
        // 确保 content-type 正确
        ctx.request.headers['content-type'] = ctx.request.headers['x-origin-content-type'] as string
      }
      catch (e) {
        // 非 JSON 数据保持原样
        ctx.request.body = decryptBody
        console.error('解析请求体失败，保持原始字符串:', e)
      }
    }
    console.log('解密请求:', `${ctx.method} ${ctx.request.path}`, `query: ${decryptQuery}`, 'body:', ctx.request.body)
  }

  await next()

  const isEncryptResponse = ctx.request.get('x-encrypt-response')
  if (salt && saltBuffer && isEncryptResponse && ctx.response.body) {
    const { response } = ctx
    const resData = typeof response.body === 'string' ? response.body : JSON.stringify(response.body)
    const encryptedResponseBody = await encrypt(encoder.encode(resData), saltBuffer)

    const renameHeaders = ['date', 'content-type', 'content-encoding']
    for (const [key, value] of Object.entries(response.headers)) {
      if (renameHeaders.includes(key) && value) {
        ctx.response.set(`x-origin-${key}`, value.toString())
      }
    }

    // ctx.set('access-control-allow-headers', `${ctx.response.get('access-control-allow-headers')}, x-salt, x-encrypt-response, x-origin-content-type`)
    ctx.set('content-type', 'text/plain; charset=utf-8')
    ctx.set('x-salt', salt)
    ctx.set('x-encrypt-response', '1')

    ctx.response.body = encryptedResponseBody
  }
})

app.use(router.routes())

;(async () => {
  if (!BackendService.instance.headerAuth) {
    await BackendService.instance.initAdminToken(process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string)
  }
  await MailerService.instance.init()

  // 启动服务器
  app.listen(port, () => {
    console.log(`Airbuddy Security is running on http://localhost:${port}`)
  })
})()
