# 第一阶段: 构建静态网站
# --platform=$BUILDPLATFORM：静态产物（out/）与 CPU 架构无关，固定在原生构建架构（amd64）只构建一次。
# 否则多架构构建会让 arm64 在 QEMU 模拟下也重跑一遍 yarn build（与 amd64 并发 → 双倍内存 → 易 OOM）。
# 最终 nginx 阶段仍按目标架构出多架构镜像，只是 COPY 同一份静态文件。
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制项目中的 package.json 和 yarn.lock 到工作目录中
COPY package.json yarn.lock ./

# 安装依赖并将网络超时设置为 100 秒（默认为 30 秒）
RUN yarn install --frozen-lockfile --network-timeout 100000

# 复制项目源代码到工作目录
COPY . .

# 构建静态站点
RUN yarn build

# 第二阶段: 使用 Nginx 作为静态服务器
FROM nginx:stable-alpine

# 删除默认的 Nginx 配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d

# 从第一阶段复制构建的静态文件到 Nginx 目录
COPY --from=builder /app/out /usr/share/nginx/html

# 暴露端口 5666
EXPOSE 5666

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

# 容器构建&运行命令
# docker build -t img-prompt .
# docker run -d -p 5666:5666 --name img-prompt img-prompt
