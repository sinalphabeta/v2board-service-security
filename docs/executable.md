# 二进制文件快速部署使用

### 1. 下载二进制文件

可以从 [release](https://github.com/dc8683/v2board-service-security/releases) 中下载二进制文件，文件名称为 `airbuddy-security-executable
`，将其上传到服务器的任意目录下，例如 `/www/wwwroot/security`，并将以下代码（具体环境变量根据自己的情况修改）保存为 `executable
-start.sh` （文件名随意，后缀一定是`.sh`），编辑好以后保存，在终端执行 `chmod +x executable-start.sh` 使其具有可执行权限

```bash
#!/bin/bash

# 设置环境变量, 参考上面的环境变量说明
export PORT=12020 # 端口号
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

# 运行程序
/www/wwwroot/security/airbuddy-security-executable # 替换为你的实际路径
```
### 2. 在软件商店中添加守护进程
在软件商店中打开 `进程守护管理器`，(如果没有安装，请先安装)，点击添加守护进程，名称备注随意，启动用户选择`root`，运行目录选择 二进制文件 和 sh 文件所在的目录，启动命令务必填写绝对路径，点击确定后，即可开启守护进程，守护进程会自动运行 `executable-start.sh` 脚本，脚本中会设置环境变量并运行二进制文件，此时，你可以在进程守护管理器中看到守护进程已经启动，并且可以查看日志输出，确保服务正常运行

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/executable.7lk96gup8b.webp)
![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/executable.7p3v46pkxs.webp)

### 添加反向代理站点

服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12022 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

### 查看 security 服务状态

在浏览器中访问 `http://<your-domain>/status`，此页面会显示 security 服务各个模块的运行状态
