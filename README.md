# 动画媒体库
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library?ref=badge_large)


又一个媒体库，这个项目的特色是：

* 仅用于最终用户，绝不提供任何类似登录注册等功能（但有权限认证，防止他人使用）
* 先将动漫花园的资源整理并录入数据库。然后所有下载操作都始于数据库，不直接进行rss订阅匹配
* 将所有技术细节信息展示于前台
* 不改变磁盘文件名等，保证每个种子在任何工具中不修改任何参数直接下载，均能在硬盘上得到完全相同的结果（但最外层文件夹是否创建取决于下载工具，这里要求必须创建）
* 通过文件系统链接实现改名，因此不支持Windows

- **通过文件系统硬链接实现“改名”，不碰原文件、0复制**，所有数据库、文件目录结构被删除都能够光速恢复
- 将所有技术细节信息展示于前台
- 理论上支持一切下载器，对下载器具体设置没有任何要求

## 限制

- 必须登录Bangumi，进而获取追番进度信息，才能开始查询关注动画的infohash。（除非有办法把整个dmhy全局索引）

### BT种子数据源支持
- [Anime Garden](https://animes.garden/)

### 番剧信息和追番进度支持
- [Bangumi](https://bgm.tv/)

### 下载器支持
- [qBittorrent](https://www.qbittorrent.org/)
- TODO

# 将思路逆转

通常的媒体库软件会去以各种方式调用下载器，而这个项目则反过来：先有下载器，再有媒体库。

你可以以用任何软件以任何姿势下载数据源中的种子，RSS订阅、手动下载全都没问题。**因为我们完全不关心下载。**

这个程序反过来读取bt客户端当前下载了哪些文件，用种子文件的infohash 100%准确的匹配这个种子到底是什么动画，再用几乎不可能出错的简单判断确定是哪一集，从而知道它们应该如何命名。


# Contribution

See [CONTRIBUTE.md]
