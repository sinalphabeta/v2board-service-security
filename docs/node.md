# node 环境快速部署使用

本文档介绍如何在 Node.js 环境下快速部署 AirBuddy 安全面板，此方式适用于 serverless 云函数快速部署，也是最轻量的部署方式，文件大小仅 1.2M，适合在低配置的服务器上运行

> 该部署方式需要先确保拥有 nodejs 环境，以下是环境安装步骤，如若遇到问题请自行百度

node 安装命令引导
```bash
# 下载安装 nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 加载 nvm:
\. "$HOME/.nvm/nvm.sh"

# 下载与安装 Node.js:
nvm install 22

# 验证 Node.js 版本:
node -v # Should print "v22.16.0".
nvm current # Should print "v22.16.0".

# 验证 npm 版本:
npm -v # Should print "10.9.2".
```

### 1. 下载 index.js 文件
可以从 [release](https://github.com/dc8683/v2board-service-security/releases) 中下载 `index.js`，上传文件到项目目录，并将以下代码（具体环境变量根据自己的情况修改）保存为 `js-start.sh` （文件名随意，后缀一定是`.sh`），编辑好以后保存，在终端执行 `chmod +x js-start.sh` 使其具有可执行权限

```bash
#!/bin/bash

# 设置环境变量, 参考上面的环境变量说明
export PORT=12020 # 端口号
export BACKEND_PANEL=v2b # 面板类型，v2b 表示 v2board/xiaoboard 面板，xb 表示 xboard 面板
export BACKEND_DOMAIN=https://xxx.r8d.pro # 面板域名
export SEC_PASSWORD=89236475 # AES 加密密码，前端和后端需要保持一致

### 免登接口所需要的环境变量
export ADMIN_API_PREFIX=xxx # 面板管理后端 API 前缀，即管理面板的后台路径，例如: /5cba3s
export ADMIN_EMAIL=xxx@gmail.com # 面板管理员邮箱账号
export ADMIN_PASSWORD=xxxx # 面板管理员密码

### 邮件服务配置
export MAIL_HOST=smtp.gmail.com # SMTP 邮件服务器地址
export MAIL_PORT=465
export MAIL_SECURE=true
export MAIL_USER=xxx@gmail.com # SMTP 邮件服务器用户名
export MAIL_PASS=xxx # SMTP 邮件服务器密码
export MAIL_NEWUSER_SUBJECT='欢迎加入 AirBuddy' # 新用户注册邮件主题
export MAIL_NEWUSER_URL=https://xxx.com/xxx.html # 新用户注册邮件模板 URL

### 图形验证码配置
export CAPTCHA_KEY=xxx # 验证码密钥，用于防止恶意提交免登订单攻击
export CAPTCHA_QUICK_ORDER_ENABLED=true # 是否启用免登创建支付订单图形验证码
export CAPTCHA_REGISTER_ENABLED=true # 是否启用注册图形验证码
export CAPTCHA_LOGIN_ENABLED=true # 是否启用登录图形验证码


# 运行程序 替换为你的实际路径
/root/.nvm/versions/node/v22.16.0/bin/node /www/wwwroot/security/index.js
```

> 注意: 下面的代码中，`/root/.nvm/versions/node/v22.16.0/bin/node` 是 Node.js 的安装路径，请根据实际情况修改为你安装的 Node.js 路径，如不知道 Node.js 的安装路径，可以在终端执行 `which node` 来查看 Node.js 的安装路径，通常是 `/usr/local/bin/node` 或者 `/usr/bin/node`，如果你使用了 nvm 安装 Node.js，则路径为 `/root/.nvm/versions/node/v22.16.0/bin/node`，请根据实际情况修改

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.20.51.4cl59rq7a1.webp)

### 2. 在软件商店中添加守护进程
在软件商店中打开 `进程守护管理器`，(如果没有安装，请先安装)，点击添加守护进程，名称备注随意，启动用户选择`root`，运行目录选择 js 和 sh 文件所在的目录，启动命令务必填写绝对路径，点击确定后，即可开启守护进程，守护进程会自动运行 `js-start.sh` 脚本，脚本中会设置环境变量并运行 `index.js` 文件，此时，你可以在进程守护管理器中看到守护进程已经启动，并且可以查看日志输出，确保服务正常运行

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.23.26.73u7hucbbv.webp)
![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.27.49.2obsckzx3w.webp)

### 添加反向代理站点

服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12020 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

### 查看 security 服务状态

在浏览器中访问 `http://<your-domain>/status`，此页面会显示 security 服务各个模块的运行状态
