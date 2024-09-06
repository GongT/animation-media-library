# 动画媒体库


规划：
1. 作品信息基于bangumi
   1. 新API [文档](https://bangumi.github.io/api/) [token](https://next.bgm.tv/demo/access-token)
   1. 快速更新bgm进度
2. 磁链来自动漫花园
   1. 不确定应该通过RSS还是网页爬虫(或者TG)
   2. 服务停止期间遗漏问题
   3. 支持更多来源？
   4. 订阅方式是手动填写正则表达式或者通配符
3. 下载器使用qbittorrent
   2. sqlite fastresume操作
6. 一个electron前端
   1. 用默认播放器打开下载好的视频文件（路径映射）
   2. 极简的在线播放
7. 作品信息存储在数据库中，手动点更新
   1. 下载状态同步保存，磁链、种子文件也存
4. 一个web前端（单密码登录的管理）
   1. 用于快速操作：搜索、订阅、下载
   2. 极简的在线播放
1. 支持sqlite作为本地存储
