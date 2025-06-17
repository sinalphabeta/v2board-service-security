<div align="center">
    <a href="https://r8d.pro"><img src="https://github.com/dc8683/picx-images-hosting/raw/master/docs/AirSecurity-LOGO@1x.86twptctpt.webp" alt="airbuddy rocket theme" width="150" /></a>
    <h1>AirSecurity Service</h1>
    <p><b> v2board/xboard/xiaoboard </b>开源后端中间件服务，防墙去特征、不怕墙、体积超小的免费中间件服务，支持 V2B/XB/xiaoboard，支持加密转发接口请求、响应，支持免登获取商品列表、免登获取付款方、免登创建订单接口，自建 SMTP，支持自定义邮件模板</p>
</div>

------------------------------


## 项目介绍

* 适配后端面板： [**v2board**](https://github.com/v2board/v2board) \ [**wyxboard**](https://github.com/wyx2685/v2board) \ [**xboard**](https://github.com/cedar2025/Xboard)
* 支持主题：[🚀 AirRocket Theme](https://github.com/dc8683/v2board-theme-airrocket)
* 在线客服：[🏄‍♂️ AirBuddy Service](https://t.me/R8d_pro_bot)
* 交流群组：[🚀 AirBuddy Theme](https://t.me/themebuddy)
* 授权方式：免费开源
* 使用文档：[📖 AirBuddy Docs](https://docs.r8d.pro/docs)


### 1. 加密转发

可以对接口的请求和响应进行加密处理，就像给你的数据穿上了一层保护衣，让数据传输更加安全。

### 2. 免登接口

* 免登获取商品列表：可以在用户不登录的情况下获取商品列表，方便用户浏览和选择商品
* 免登获取付款方式：可以在用户不登录的情况下获取付款方信息，方便用户进行支付
* 免登创建订单接口：可以在用户不登录的情况下创建订单并实现自动注册登录账号，简化了用户的操作流程

### 3. 自建 SMTP

可以自建 SMTP 服务器，支持自定义邮件模板，方便用户发送邮件通知和营销邮件


### 4. 环境变量

在``.env.example``文件中包含了主要的环境变量配置，您可以根据需要进行修改。以下是一些主要的环境变量：

* ADMIN_TOKEN: 面板管理员令牌，用于身份验证和权限控制，如果你填了 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 则不需要填入 `ADMIN_TOKEN`，因为每次启动服务都会自动生成一个新的 `ADMIN_TOKEN`
* ADMIN_EMAIL: 面板管理员邮箱账号
* ADMIN_PASSWORD: 面板管理员密码
* BACKEND_API_PREFIX: 面板管理后端 API 前缀
* DOMAIN: 你的后端域名，示例:https://api.xxx.com，如果此服务和面板在同一台服务器上，可以使用局域网地址，示例: http://127.0.0.1:3000
* PASSWORD: AES 加密密码，用于加解密，请和前端中的 security.password 保持一致
* MAIL_HOST: SMTP 邮件服务器地址
* MAIL_PORT: SMTP 邮件服务器端口
* MAIL_SECURE: SMTP 邮件服务器安全协议，true 或 false
* MAIL_USER: SMTP 邮件服务器用户名
* MAIL_PASS: SMTP 邮件服务器密码

### 5. 邮件模板

在 `./assets` 目录下有一些邮件模板文件，您可以根据需要进行修改。以下是一些主要的邮件模板：
* `NewUser.html`: 新用户注册邮件模板，用于向新用户发送注册成功和账号密码的通知

## 安装和使用

此项目你可以自行构建或者使用 release 中的产物，release 中包含了 js 构建产物、docker 产物、二进制文件、源码包

### js 构建产物部署与使用

### docker 产物部署使用

### 二进制文件部署使用

### 源码包部署使用

## 自行构建

### 1.克隆项目

```bash
   git clone 
```

### 2. 安装依赖
```bash
   yarn install
```

### 3. 构建项目
```bash
   yarn run build # 构建 js 产物
   yarn run build:executable # 构建二进制文件
   docker build -t airsecurity . # 构建 docker 镜像
```
