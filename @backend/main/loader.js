console.log('initializing...');

import inspector from 'inspector';
import { install } from 'source-map-support';
import { fileURLToPath } from 'url';

if (process.execArgv.some((arg) => arg.startsWith('--inspect')) || inspector.url()) {
	console.log(' - inspect mode enabled');
	process.env.DISABLE_PRETTY_ERROR = 'yes';
} else {
	install({});
}
// after source-map-support

await import('./lib/index.js');
