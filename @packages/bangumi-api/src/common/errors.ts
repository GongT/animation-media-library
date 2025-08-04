import type { components } from '../g/openapi.generated.js';

export class BangumiError extends Error {
	constructor(private readonly error: components['schemas']['ErrorDetail']) {
		super(`Bangumi API return failed: ${error.title}: ${error.description}`);
	}

	get details() {
		if (typeof this.error.details === 'string') {
			return {
				error: this.error.details,
				path: '',
			};
		} else {
			return this.error.details;
		}
	}
}

export class InvalidResponseError extends Error {
	constructor(public readonly response: any) {
		super(`Invalid response from Bangumi API: ${JSON.stringify(response)}`);
	}
}

export function maybeUnknownError(error: any): never {
	if (error?.description && error?.details) {
		throw new BangumiError(error);
	}
	throw new InvalidResponseError(error);
}

export class AuthError extends Error {}
