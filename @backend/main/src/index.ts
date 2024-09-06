import { loadApplicationConfig } from '@backend/config';
import { startupDatabaseConnection } from '@backend/database';
import { prettyPrintError, setErrorLogRoot } from '@idlebox/common';
import { findUpUntil } from '@idlebox/node';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

if (process.env.workspaceFolder) {
	setErrorLogRoot(process.env.workspaceFolder);
} else {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const found = await findUpUntil(__dirname, 'rush.json');
	if (found) {
		setErrorLogRoot(dirname(found));
	} else {
		setErrorLogRoot(__dirname);
	}
}

try {
	await loadApplicationConfig();
	await startupDatabaseConnection();
} catch (e: unknown) {
	if (e instanceof Error) {
		prettyPrintError('startup', e);
	} else {
		console.log('can not start application.');
		console.error(e);
	}
	process.exit(6);
}
