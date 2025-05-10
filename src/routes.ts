import type Koa from 'koa'
import KoaRouter from '@koa/router'
import { domain } from './env'

export const router = new KoaRouter()

// 自定义接口扩展
router.get('/api/v1/custom/hello', (ctx: Koa.Context) => {
  ctx.response.body = 'Hello World'
})

// proxy
router.all('/api/v1/:segments*', async (ctx: Koa.Context) => {
  console.log(`proxy to ${ctx.request.url}`)
  const headers = new Headers(ctx.request.headers as Record<string, string | string[]>)
  headers.delete('x-salt')
  headers.delete('content-length')
  headers.delete('x-origin-content-type')

  // 代理请求
  const url = new URL(domain)
  const { query, path, rawBody } = ctx.request
  query && (url.search = new URLSearchParams(query as Record<string, string | readonly string[]>).toString())
  url.pathname = path

  const response = await fetch(url, {
    method: ctx.method,
    headers,
    body: rawBody,
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
