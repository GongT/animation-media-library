import { resolve } from 'node:path';
import { createBangumiApiClient } from '../index.js';

export const TEST_PACKAGE_ROOT = resolve(import.meta.dirname, '../..');
export const TEST_MONOREPO_ROOT = resolve(TEST_PACKAGE_ROOT, '../..');

export function testCreate(useToken: boolean) {
	return createBangumiApiClient({
		userAgent:
			'GongT/BangumiApi (https://github.com/gongt/animation-media-library/blog/master/@packages/bangumi-api) (Test Suite)',
		accessToken: useToken ? process.env.BANGUMI_ACCESS_TOKEN : undefined,
	});
}
