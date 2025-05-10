import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Koa from 'koa'
import { decrypt, encrypt, parsePathname } from './crypto'
import { domain, encoder, port } from './env'
import { router } from './routes'

const app = new Koa()

app.use(bodyParser())

// 配置 CORS
app.use(cors({
  origin: (ctx: Koa.Context) => ctx.get('Origin') || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['x-salt', 'x-encrypt-response', 'x-origin-content-type', 'authorization'],
  exposeHeaders: ['x-salt', 'x-encrypt-response', 'x-origin-content-type'],
}))

// 中间件：处理加密请求
app.use(async (ctx, next) => {
  const salt = ctx.request.get('x-salt')
  const saltBuffer = salt && Buffer.from(salt, 'base64')

  if (salt && saltBuffer) {
    const rawQuery = ctx.query.q as string
    // 获取 body 的原始数据
    const rawBody = ctx.method === 'GET' ? null : ctx.request.rawBody
    const rawPathname = new URL(ctx.request.path, domain).pathname
    // 解密
    const decryptPathname = parsePathname(rawPathname)
    const decryptQuery = rawQuery && await decrypt(Buffer.from(rawQuery, 'base64'), saltBuffer)
    const decryptBody = rawBody && await decrypt(Buffer.from(rawBody, 'base64'), saltBuffer)

    ctx.request.path = decryptPathname
    decryptQuery && (ctx.request.query = JSON.parse(decryptQuery))
    decryptBody && (ctx.request.rawBody = decryptBody)
  }

  await next()

  const isEncryptResponse = ctx.request.get('x-encrypt-response')
  if (salt && saltBuffer && isEncryptResponse && ctx.response.body) {
    const { response } = ctx
    const encryptedResponseBody = await encrypt(encoder.encode(response.body), saltBuffer)

    ctx.set('access-control-allow-headers', `${ctx.response.get('access-control-allow-headers')}, x-salt, x-encrypt-response, x-origin-content-type`)
    ctx.set('content-type', 'text/plain; charset=utf-8')
    ctx.set('x-salt', salt)
    ctx.set('x-encrypt-response', '1')

    const renameHeaders = ['date', 'content-type', 'content-encoding']
    for (const [key, value] of Object.entries(response.headers)) {
      if (renameHeaders.includes(key) && value) {
        ctx.response.set(`x-origin-${key}`, value.toString())
      }
    }

    ctx.response.body = encryptedResponseBody
  }
})

app.use(router.routes())

// 启动服务器
app.listen(port, () => {
  console.log(`Airbuddy Security is running on http://localhost:${port}`)
})
