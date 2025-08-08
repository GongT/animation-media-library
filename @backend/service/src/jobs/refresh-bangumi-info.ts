import { logger } from '@idlebox/logger';
import { userSettings } from '@packages/usersettings';
import { bangumi } from '../common/bgm.js';
import { syncWatching } from './sync-watching.js';

export async function refreshBangumiInformation() {
	const currentToken = userSettings.get('bangumiUserToken');
	logger.debug`token: ${currentToken}`;

	const userInfo = await bangumi.getMyself();
	syncWatching(true);

	logger.debug`complete refresh!`;
	await userSettings.update({
		bangumiUserId: userInfo.id,
		lastUserToken: currentToken,
	});
}
