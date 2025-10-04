# 二进制文件快速部署使用

### 1. 下载二进制文件

可以从 [release](https://github.com/dc8683/v2board-service-security/releases) 中下载二进制文件，文件名称为 `airbuddy-security-executable
`，将其上传到服务器的任意目录下，例如 `/www/wwwroot/security`，并将以下代码（具体环境变量根据自己的情况修改）保存为 `.env` 文件，编辑好以后保存，在终端执行 `chmod 777 airbuddy-security-executable` 使二进制文件具有可执行权限

```bash
# 设置环境变量, 参考上面的环境变量说明
PORT=12020 # 端口号
BACKEND_PANEL=v2b # 面板类型，v2b 表示 v2board/xiaoboard 面板，xb 表示 xboard 面板
BACKEND_DOMAIN=https://xxx.r8d.pro # 面板域名
SEC_PASSWORD=89236475 # AES 加密密码，前端和后端需要保持一致

# 免登接口所需要的环境变量
ADMIN_API_PREFIX=xxx # 面板管理后端 API 前缀，即管理面板的后台路径，例如: /5cba3s
ADMIN_EMAIL=xxx@gmail.com # 面板管理员邮箱账号
ADMIN_PASSWORD=xxxx # 面板管理员密码

# 邮件服务配置
MAIL_HOST=smtp.gmail.com # SMTP 邮件服务器地址
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=xxx@gmail.com # SMTP 邮件服务器用户名
MAIL_PASS=xxx # SMTP 邮件服务器密码
MAIL_NEWUSER_SUBJECT='欢迎加入 AirBuddy' # 新用户注册邮件主题
MAIL_NEWUSER_URL=https://xxx.com/xxx.html # 新用户注册邮件模板 URL

# 图形验证码配置
CAPTCHA_KEY=xxx # 验证码密钥，用于防止恶意提交免登订单攻击
CAPTCHA_QUICK_ORDER_ENABLED=true # 是否启用免登创建支付订单图形验证码
CAPTCHA_REGISTER_ENABLED=true # 是否启用注册图形验证码
CAPTCHA_LOGIN_ENABLED=true # 是否启用登录图形验证码

# 安全设置
ENCRYPTED_REQUEST_ONLY=false # 是否只允许加密请求，true 表示只接受加密请求，false 表示同时接受明文和加密请求
```
### 2. 在软件商店中添加守护进程
在软件商店中打开 `进程守护管理器`，(如果没有安装，请先安装)，点击添加守护进程，名称备注随意，启动用户选择`root`，运行目录选择 二进制文件 `airbuddy-security-executable` 所在的目录，启动命令务必填写绝对路径，点击确定后，即可开启守护进程，守护进程会自动运行 `airbuddy-security-executable` 二进制程序，程序会根据 `.env` 文件里设置的环境变量来启动服务，此时，你可以在进程守护管理器中看到守护进程已经启动，并且可以查看日志输出，确保服务正常运行

![](https://i.ibb.co/4R2DHkX4/2025-10-05-01-00-00-chrome.png)
![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/executable.7p3v46pkxs.webp)

### 添加反向代理站点

服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12022 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

### 查看 security 服务状态

在浏览器中访问 `http://<your-domain>/status`，此页面会显示 security 服务各个模块的运行状态
