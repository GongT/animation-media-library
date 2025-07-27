import { type IDisposable, toDisposable } from '@idlebox/common';
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

export abstract class AbstractClient {
	protected readonly client: Client<paths, 'application/json'>;
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

	requireAccessToken() {
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

	get _request() {
		return this.client.request.bind(this.client);
	}
	get _get() {
		return this.client.GET.bind(this.client);
	}
	get _post() {
		return this.client.POST.bind(this.client);
	}
	get _put() {
		return this.client.PUT.bind(this.client);
	}
	get _patch() {
		return this.client.PATCH.bind(this.client);
	}
	get _delete() {
		return this.client.DELETE.bind(this.client);
	}
}
