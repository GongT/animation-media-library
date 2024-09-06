import { startupDatabaseConnection } from '@backend/database';
import { prettyPrintError, setErrorLogRoot } from '@idlebox/common';
import { fileURLToPath } from 'url';

async function main() {
	// await loadConfig();
	await startupDatabaseConnection();
}

setErrorLogRoot(fileURLToPath(import.meta.url));
main().catch((e) => {
	prettyPrintError('startup', e);
});
