## 结构

本项目分为以下几个部分：

1. **支持包** 位于 `@packages`、`@drivers` 目录，包含通用功能，如连接数据库、bangumi客户端等。
2. **用户界面** 位于 `@frontend` 目录
   1. 前端 `@frontend/website`，是一个简单的web控制界面。
   2. 服务端 `@backend/api`，为website提供各种功能。
3. **主服务** 位于 `@backend` 目录
   1. `@backend/service` 长期运行的服务，主程序入口
4. **命令行** 位于 `@frontend/cli`


## 初始化

1. 安装依赖: `pnpm i` **不支持npm和yarn**
2. 启动开发用postgres数据库: `podman-compose up -d` (或`docker-compose`)
   1. 末尾添加`pg`只允许数据库
   2. 默认还启动一个pgadmin，端口为8888，首次启动要等几分钟才能打开
