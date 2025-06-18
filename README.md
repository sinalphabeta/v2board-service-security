<div align="center">
    <a href="https://r8d.pro"><img src="https://github.com/dc8683/picx-images-hosting/raw/master/docs/AirSecurity-LOGO@1x.86twptctpt.webp" alt="airbuddy rocket theme" width="150" /></a>
    <h1>AirBuddy Security Service</h1>
    <p><b> v2board/xboard/xiaoboard </b>开源后端中间件服务，防墙去特征、不怕墙、体积超小的免费中间件服务，支持 V2B/XB/xiaoboard，支持加密转发接口请求、响应，支持免登获取商品列表、免登获取付款方、免登创建订单接口，自建 SMTP，支持自定义邮件模板</p>
</div>

------------------------------


## 项目介绍

* 适配后端面板： [**v2board**](https://github.com/v2board/v2board) \ [**wyxboard**](https://github.com/wyx2685/v2board) \ [**xboard**](https://github.com/cedar2025/Xboard)
* 支持主题：[🚀 AirRocket Theme](https://github.com/dc8683/v2board-theme-airrocket)
* 在线客服：[🏄‍♂️ AirBuddy Service](https://t.me/R8d_pro_bot)
* 交流群组：[🚀 AirBuddy Theme](https://t.me/themebuddy)
* 授权方式：免费开源
* 使用文档：[📖 AirBuddy Docs](https://r8d.pro/docs)


### 1. 加密转发

可以对接口的请求和响应进行加密处理，就像给你的数据穿上了一层保护衣，防止被墙，让数据传输更加安全。

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-17-15.06.21.6t7dmwj0sn.webp)

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
* BACKEND_API_PREFIX: 面板管理后端 API 前缀，即管理面板的后台路径
* DOMAIN: 你的后端域名，示例: https://api.xxx.com ，如果此服务和面板在同一台服务器上，可以使用局域网地址（局域网通信速度最佳，且可以关闭 v2board/xboard 面板对外的暴露），示例: http://127.0.0.1:3000
* PASSWORD: AES 加密密码，用于加解密，请和前端中的 security.password 保持一致
* MAIL_HOST: SMTP 邮件服务器地址
* MAIL_PORT: SMTP 邮件服务器端口
* MAIL_SECURE: SMTP 邮件服务器安全协议，true 或 false
* MAIL_USER: SMTP 邮件服务器用户名
* MAIL_PASS: SMTP 邮件服务器密码
* MAIL_NEWUSER_SUBJECT: 新用户注册邮件主题
* MAIL_NEWUSER_URL: 新用户注册邮件模板链接，用于向新用户发送注册成功和账号密码的通知，需自行创建一个邮件模板文件，并将其放置在 cdn 上，作为链接，设置到 `MAIL_NEWUSER_URL` 环境变量中，如果不设置，将默认采用纯文本模板

> tips: 如果你只是需要防墙通信，而不需要免登支付注册一体的话，就只需要配置 `PASSWORD` 和 `DOMAIN` 即可，其他配置可以不填

### 5. 邮件模板

我们提供了一个默认的邮件模板，你可以在 [NewUser Email Template](https://github.com/dc8683/picx-images-hosting/blob/master/email-template/NewUser.html) 下载下来修改网址和内容，或者自行创建一个新的邮件模板文件，并将其放置在 cdn 上，作为链接，设置到 `MAIL_NEWUSER_URL` 环境变量中，如果不设置，将默认采用纯文本模板。

此外，如果你需要定制更好看的邮件模板，我们非常推荐使用 [wand email](https://www.wand.email/)，这是一个非常好用的 AI 一键生成邮件模板工具

## 安装和使用

此项目你可以自行构建或者使用 release 中的产物，release 中包含了 js 构建产物、docker 产物、二进制文件、源码包，以下部署与使用方式均以 release 中的产物为例

### docker 部署使用

1. 下载 release 中的 docker 产物，文件名称为 `airbuddy-security-docker-image-版本号.tar`
2. 上传到宝塔中的文件目录，例如 `/www/wwwroot/security`
3. 在宝塔中打开 docker - 本地镜像，点击导入镜像，选择刚才上传的 `airbuddy-security-docker-image-版本号.tar` 文件，此时镜像列表中会多出一个 `airbuddy-security:版本号` 镜像，如图所示: ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-17-16.34.38.2obsamib0p.webp)

4. 您可以使用 docker 命令或者界面中的创建容器来创建容器，为了各位用户更方便使用，以下提供一份 docker 编排文件，在宝塔中使用容器编排来启动服务，你可以将其转成命令来使用
    
   ```yaml
    version: '3'
    
    services:
      airbuddy-security-service:
        # 替换为你实际的镜像名称和标签
        image: airbuddy-security:1.0.1
        container_name: airbuddy-security-service
        restart: always
        ports:
          # 将容器内部的 3000 端口映射到主机的 12020 端口
          - "12020:3000"
        environment:
          # 以下是环境变量配置，请根据实际情况修改
          - ADMIN_EMAIL=${ADMIN_EMAIL}
          - ADMIN_PASSWORD=${ADMIN_PASSWORD}
          - BACKEND_API_PREFIX=${BACKEND_API_PREFIX}
          - DOMAIN=${DOMAIN}
          - PASSWORD=${PASSWORD}
          - MAIL_HOST=${MAIL_HOST}
          - MAIL_PORT=${MAIL_PORT}
          - MAIL_SECURE=${MAIL_SECURE}
          - MAIL_USER=${MAIL_USER}
          - MAIL_PASS=${MAIL_PASS}
          - MAIL_NEWUSER_SUBJECT=${MAIL_NEWUSER_SUBJECT}
          - MAIL_NEWUSER_URL=${MAIL_NEWUSER_URL}
    ```

5. 服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12020 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:
![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

最后，通过访问 `https://你配置的域名/api/v1/guest/comm/config` 来测试服务是否正常运行，如果返回了配置数据，则表示服务运行正常

> Tips: 如果你使用了宝塔的 docker 容器编排功能，可以在宝塔中直接编辑环境变量，还能在宝塔中查看日志，方便调试和维护，如下图所示:
>  
> ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-00.34.24.6pnrqx732d.webp)

### js 部署与使用

> 该部署方式需要先确保全局安装了 Node.js 等依赖工具，以下是环境安装步骤，如若遇到问题请自行百度
> * Node.js 20+ 版本

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# 下载与安装 Node.js:
nvm install 22

# 验证 Node.js 版本:
node -v # Should print "v22.16.0".
nvm current # Should print "v22.16.0".

# 验证 npm 版本:
npm -v # Should print "10.9.2".
```

1. 上传 `index.js` 文件到项目目录，并将以下代码（具体环境变量根据自己的情况修改）保存为 `js-start.sh` （文件名随意，后缀一定是`.sh`），编辑好以后保存，在终端执行 `chmod +x js-start.sh` 使其具有可执行权限

   ```bash
   #!/bin/bash

   # 设置环境变量, 参考上面的环境变量说明
   export PORT=12020 # 端口号
   export ADMIN_EMAIL=xxx@gmail.com # 面板管理员邮箱账号
   export ADMIN_PASSWORD=xxxx # 面板管理员密码
   export BACKEND_API_PREFIX=xxx # 面板管理后端 API 前缀
   export DOMAIN=https://xxx.r8d.pro
   export PASSWORD=89236475 # AES 加密密码，前端和后端需要保持一致
   export MAIL_HOST=smtp.gmail.com # SMTP 邮件服务器地址
   export MAIL_PORT=465
   export MAIL_SECURE=true
   export MAIL_USER=xxx@gmail.com # SMTP 邮件服务器用户名
   export MAIL_PASS=xxx # SMTP 邮件服务器密码
   export MAIL_NEWUSER_SUBJECT='欢迎加入 AirBuddy'
   export MAIL_NEWUSER_URL=https://xxx.com/xxx.html # 新用户注册邮件模板链接
   
   # 运行程序 替换为你的实际路径
   /root/.nvm/versions/node/v22.16.0/bin/node /www/wwwroot/security/index.js
   ```
   > 注意: 下面的代码中，`/root/.nvm/versions/node/v22.16.0/bin/node` 是 Node.js 的安装路径，请根据实际情况修改为你安装的 Node.js 路径，如不知道 Node.js 的安装路径，可以在终端执行 `which node` 来查看 Node.js 的安装路径，通常是 `/usr/local/bin/node` 或者 `/usr/bin/node`，如果你使用了 nvm 安装 Node.js，则路径为 `/root/.nvm/versions/node/v22.16.0/bin/node`，请根据实际情况修改

   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.20.51.4cl59rq7a1.webp)

2. 在软件商店中打开 `进程守护管理器`，(如果没有安装，请先安装)，点击添加守护进程，名称备注随意，启动用户选择`root`，运行目录选择 js 和 sh 文件所在的目录，启动命令务必填写绝对路径，点击确定后，即可开启守护进程，守护进程会自动运行 `js-start.sh` 脚本，脚本中会设置环境变量并运行 `index.js` 文件，此时，你可以在进程守护管理器中看到守护进程已经启动，并且可以查看日志输出，确保服务正常运行
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.23.26.73u7hucbbv.webp)
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/Clipboard---2025-06-19-01.27.49.2obsckzx3w.webp)

3. 服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12021 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

最后，通过访问 `https://你配置的域名/api/v1/guest/comm/config` 来测试服务是否正常运行，如果返回了配置数据，则表示服务运行正常


### 二进制文件部署使用

1. 下载 release 中的二进制文件，文件名称为 `airbuddy-security-executable
`，将其上传到服务器的任意目录下，例如 `/www/wwwroot/security`，并将以下代码（具体环境变量根据自己的情况修改）保存为 `executable
-start.sh` （文件名随意，后缀一定是`.sh`），编辑好以后保存，在终端执行 `chmod +x executable-start.sh` 使其具有可执行权限

   ```bash
   #!/bin/bash

   # 设置环境变量, 参考上面的环境变量说明
   export PORT=12020 # 端口号
   export ADMIN_EMAIL=xxx@gmail.com # 面板管理员邮箱账号
   export ADMIN_PASSWORD=xxxx # 面板管理员密码
   export BACKEND_API_PREFIX=xxx # 面板管理后端 API 前缀
   export DOMAIN=https://xxx.r8d.pro
   export PASSWORD=89236475 # AES 加密密码，前端和后端需要保持一致
   export MAIL_HOST=smtp.gmail.com # SMTP 邮件服务器地址
   export MAIL_PORT=465
   export MAIL_SECURE=true
   export MAIL_USER=xxx@gmail.com # SMTP 邮件服务器用户名
   export MAIL_PASS=xxx # SMTP 邮件服务器密码
   export MAIL_NEWUSER_SUBJECT='欢迎加入 AirBuddy'
   export MAIL_NEWUSER_URL=https://xxx.com/xxx.html # 新用户注册邮件模板链接
   
   # 运行程序
   /www/wwwroot/security/airbuddy-security-executable # 替换为你的实际路径
   ```

2. 在软件商店中打开 `进程守护管理器`，(如果没有安装，请先安装)，点击添加守护进程，名称备注随意，启动用户选择`root`，运行目录选择 二进制文件 和 sh 文件所在的目录，启动命令务必填写绝对路径，点击确定后，即可开启守护进程，守护进程会自动运行 `executable-start.sh` 脚本，脚本中会设置环境变量并运行二进制文件，此时，你可以在进程守护管理器中看到守护进程已经启动，并且可以查看日志输出，确保服务正常运行
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/executable.7lk96gup8b.webp)
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/executable.7p3v46pkxs.webp)

3. 服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12022 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:
   ![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

最后，通过访问 `https://你配置的域名/api/v1/guest/comm/config` 来测试服务是否正常运行，如果返回了配置数据，则表示服务运行正常

## 自行构建和调试使用

### 1.克隆项目

```bash
   git clone 
```

### 2. 安装依赖
```bash
   yarn install
```

### 3. 配置环境变量
```bash
   cp .env.example .env # 复制环境变量配置文件 => 生产环境使用
   cp .env.exampl .env.local # 复制环境变量配置文件 => 本地调试使用
```

### 4. 构建项目
```bash
   yarn run build # 构建 js 产物
   yarn run build:executable # 构建二进制文件
   docker build -t airsecurity . # 构建 docker 镜像
```
### 5. 运行项目
```bash
   yarn run start # 启动服务
   yarn run dev # 本地调试
   docker run -d --name airsecurity -p 3000:3000 airsecurity # 启动 docker 容器
```