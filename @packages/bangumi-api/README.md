# Bangumi API Client

[![npm](https://img.shields.io/npm/v/bgmtv-api?style=flat-square)](https://www.npmjs.com/package/bgmtv-api)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fanimation-media-library?ref=badge_shield&issueType=license)

* 依据[此API文档](https://bangumi.github.io/api/)生成的Bangumi API客户端。进行了一些必要的调整和优化。
* 强TypeScript类型支持，唯一有效导出为`createBangumiApiClient`函数。
* 缺少token时调用需登录的API不会发送请求。（抛出AuthError）
* 不会尝试读取任何环境变量或配置文件，所有设置需通过参数提供。
* 代理等功能需使用global agent（简单，但不推荐）或自定义`options.fetch`的方式实现。

```ts
import { createBangumiApiClient, BangumiError } from 'bgmtv-api';
const client = createBangumiApiClient({
	// userAgent必填
	userAgent: 'xxxxxxxxxxxxxxxxxxxxxxxx',

	// accessToken可选，若不提供则为匿名用户
	accessToken: 'yyyyyyyyyyyyyyyyyyyyyyyyy',

	// fetch: myCustomFetchFunction,

	// baseUrl: 'https://api.bgm.tv',
});

try {
	const me = await client.getMyself(); // 请求 /v0/me
	console.log('我是%s', me.nickname);
} catch (error) {
	if (error instanceof BangumiError) {
		console.error('返回了错误信息: %s', error.message);
	} else {
		console.error('未知错误: %s', error);
	}
}
```

### References

- [Bangumi API 文档](https://bangumi.github.io/api/)
- [OpenApi 转 TypeScript](https://openapi-ts.dev/introduction)
- 运行时依赖: [OpenAPI Fetch客户端](https://openapi-ts.dev/openapi-fetch/)
