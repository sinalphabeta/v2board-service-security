## docker 一键部署脚本

如果你希望使用一键脚本来部署 security 服务，可以使用以下脚本，保存为 `deploy.sh` 文件，然后在服务器终端执行 `bash deploy.sh` 来运行脚本。

> 此脚本由 [Tethyiah](http://t.me/Tethyiah) 提供，感谢他的贡献

```bash
#!/bin/bash

# url 请到 release 中查看最新版本
IMAGE_URL="https://github.com/dc8683/v2board-service-security/releases/download/1.0.6/airbuddy-security-docker-image-1.0.6.tar"
IMAGE_FILE="airbuddy-security-docker-image-1.0.6.tar"

CONTAINER_NAME="airbuddy-security-service"

echo "下载镜像文件..."
wget -O $IMAGE_FILE $IMAGE_URL

if [[ $? -ne 0 ]]; then
  echo "镜像下载失败！请检查网络连接。"
  exit 1
fi

echo "加载镜像到 Docker..."
docker load < $IMAGE_FILE

if [[ $? -ne 0 ]]; then
  echo "镜像加载失败！"
  exit 1
fi

echo "启动容器..."
docker run -d --name $CONTAINER_NAME --network host --env-file .env airbuddy-security:1.0.6

if [[ $? -eq 0 ]]; then
  echo "容器启动成功！"
else
  echo "容器启动失败！"
  exit 1
fi

echo "容器正在后台运行，您可以使用以下命令查看容器日志或状态："
echo "查看容器日志: docker logs -f $CONTAINER_NAME"
echo "查看容器状态: docker ps"
```

### 添加反向代理站点

服务启动后，在网站 - 反向代理，点击添加反代，域名设置你对外公开的域名，目标 url 填写本机地址 + compose 中的端口号，例如上面compose 对应的端口示例: http://127.0.0.1:12020 , 名称可以随意填写，例如 `airbuddy-security`，然后点击提交即可，如下所示:

![](https://github.com/dc8683/picx-images-hosting/raw/master/docs/fandai.4n7z15bffe.webp)

### 查看 security 服务状态

在浏览器中访问 `http://<your-domain>/status`，此页面会显示 security 服务各个模块的运行状态