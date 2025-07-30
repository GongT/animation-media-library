import { loadApplicationConfig } from '@backend/config';
import { startupDatabaseConnection } from '@backend/database';

await loadApplicationConfig();
await startupDatabaseConnection();
