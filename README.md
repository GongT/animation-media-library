# 动画媒体库
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library?ref=badge_shield)


又一个媒体库，这个项目的特色是：

* 仅用于最终用户，绝不提供任何类似登录注册等功能（但有权限认证，防止他人使用）
* 先将动漫花园的资源整理并录入数据库。然后所有下载操作都始于数据库，不直接进行rss订阅匹配
* 将所有技术细节信息展示于前台
* 不改变磁盘文件名等，保证每个种子在任何工具中不修改任何参数直接下载，均能在硬盘上得到完全相同的结果（但最外层文件夹是否创建取决于下载工具，这里要求必须创建）
* 通过文件系统链接实现改名，因此不支持Windows


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library?ref=badge_large)