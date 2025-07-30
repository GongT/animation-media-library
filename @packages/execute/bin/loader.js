console.log('initializing...');

import inspector from 'node:inspector';
import { install } from 'source-map-support';

if (process.execArgv.some((arg) => arg.startsWith('--inspect')) || inspector.url()) {
	console.log(' - inspect mode enabled');
	process.env.DISABLE_PRETTY_ERROR = 'yes';
} else {
	install({});
}
// after source-map-support
