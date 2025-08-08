import { toDisposable, type IDisposable } from '@idlebox/common';
import createClient, { type Client } from 'openapi-fetch';
import type { MiddlewareOnError, MiddlewareOnRequest, MiddlewareOnResponse } from 'openapi-fetch/src/index.js';
import type { paths } from '../g/openapi.generated.js';
import { AuthError } from './errors.js';

export interface Options {
	/**
	 * Bangumi API
	 * @default 'https://api.bgm.tv'
	 */
	baseUrl?: string;
	/**
	 * 客户端UA，必填
	 * @see https://github.com/bangumi/api/blob/master/docs-raw/user%20agent.md
	 */
	userAgent: string;
	/**
	 * 登录Token
	 * @default 游客访问
	 * @see https://next.bgm.tv/demo/access-token
	 */
	accessToken?: string;

	/**
	 * 替换fetch函数
	 */
	fetch?: typeof globalThis.fetch;
}

type TypedClient = Client<paths, 'application/json'>;

export abstract class AbstractClient {
	protected readonly client: TypedClient;
	protected readonly headers: Record<string, string>;

	constructor(protected readonly options: Options) {
		this.headers = {
			Accept: 'application/json',
			'User-Agent': options.userAgent,
			Authorization: options.accessToken ? `Bearer ${options.accessToken}` : '',
		};
		this.client = createClient<paths>({
			baseUrl: options.baseUrl || 'https://api.bgm.tv',
			headers: this.headers,
		});
	}

	protected requireAccessToken() {
		if (!this.options.accessToken) {
			throw new AuthError('Access token is required for this operation.');
		}
	}

	onRequest(fn: MiddlewareOnRequest): IDisposable {
		const mw = { onRequest: fn };
		this.client.use(mw);
		return toDisposable(() => {
			this.client.eject(mw);
		});
	}
	onResponse(fn: MiddlewareOnResponse): IDisposable {
		const mw = { onResponse: fn };
		this.client.use(mw);
		return toDisposable(() => {
			this.client.eject(mw);
		});
	}
	onError(fn: MiddlewareOnError): IDisposable {
		const mw = { onError: fn };
		this.client.use(mw);
		return toDisposable(() => {
			this.client.eject(mw);
		});
	}

	/** @deprecated 尽量不要用底层请求 */
	get _request(): TypedClient['request'] {
		return this.client.request.bind(this.client);
	}
	
	/** @deprecated 尽量不要用底层请求 */
	get _get(): TypedClient['GET'] {
		return this.client.GET.bind(this.client);
	}
	
	/** @deprecated 尽量不要用底层请求 */
	get _post(): TypedClient['POST'] {
		return this.client.POST.bind(this.client);
	}
	
	/** @deprecated 尽量不要用底层请求 */
	get _put(): TypedClient['PUT'] {
		return this.client.PUT.bind(this.client);
	}
	
	/** @deprecated 尽量不要用底层请求 */
	get _patch(): TypedClient['PATCH'] {
		return this.client.PATCH.bind(this.client);
	}
	
	/** @deprecated 尽量不要用底层请求 */
	get _delete(): TypedClient['DELETE'] {
		return this.client.DELETE.bind(this.client);
	}
}
