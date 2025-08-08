import type { Options } from './common/abstract.js';
import { BangumiApiClient } from './g/client.generated.js';
export { AuthError, BangumiError, InvalidResponseError } from './common/errors.js';
export * from './g/openapi.generated.js'
export type { BangumiApiClient, Options as BangumiClientOptions };

export function createBangumiApiClient(config: Options) {
	return new BangumiApiClient(config);
}
