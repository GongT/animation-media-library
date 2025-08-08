import { logger } from '@idlebox/logger';
import { loadApplicationConfig } from '@packages/config';
import { startupDatabaseConnection } from '@packages/database';
import { userSettings } from '@packages/usersettings';
import { createBangumiClient } from './common/bgm.js';
import { refreshBangumiInformation } from './jobs/refresh-bangumi-info.js';

await loadApplicationConfig();
await startupDatabaseConnection();
await userSettings.initialize();

const currentToken = userSettings.get('bangumiUserToken');
const lastUsed = userSettings.get('lastUserToken');

if (!currentToken) {
	logger.fatal`bangumi user token is not set.`;
}
createBangumiClient(currentToken);
if (lastUsed !== currentToken) {
	logger.warn`bangumi token changed, updating information...`;
	await refreshBangumiInformation();
}

process.on('stabled', () => {
	logger.success`服务已启动!`;
});
