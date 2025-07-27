import { prettyPrintError, setErrorLogRoot } from '@idlebox/common';
import { findUpUntil } from '@idlebox/node';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'node:util';

console.error = (msg, ...args) => {
	if (args.length !== 0 || typeof msg !== 'string') {
		msg = format(msg, ...args);
	}
	process.stderr.write(`${msg}\n`);
};

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
	await import('./lib/index.js');
} catch (e) {
	if (e instanceof Error) {
		prettyPrintError('startup', e);
	} else {
		console.log('can not start application.');
		console.error(e);
	}
	process.exit(1);
}
