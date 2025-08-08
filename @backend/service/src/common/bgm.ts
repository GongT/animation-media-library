import { APP } from '@packages/config';
import { BangumiApiClient, createBangumiApiClient } from 'bgmtv-api';

export let bangumi: BangumiApiClient;
export function createBangumiClient(token: string) {
	bangumi = createBangumiApiClient({
		userAgent: APP.userAgent,
		accessToken: token,
	});
}
