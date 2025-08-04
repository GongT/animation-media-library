import { logger } from '@idlebox/logger';
import { loadApplicationConfig } from '@packages/config';
import { startupDatabaseConnection } from '@packages/database';
import type {} from '@packages/execute';
import { userSettings } from '@packages/usersettings';

await loadApplicationConfig();
await startupDatabaseConnection();
await userSettings.initialize();

process.on('stabled', () => {
	logger.success`服务已启动!`;
});
