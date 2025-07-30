import { humanDate, prettyPrintError } from '@idlebox/common';
import inspector from 'node:inspector';
import { basename, dirname, resolve } from 'node:path';
import { install } from 'source-map-support';

const startTime = Date.now();

installSourceMap();

export async function runMain(file: string, parent: string) {
	const { shutdown } = await setup(basename(file, '.js'), parent);

	const { logger } = await import('@idlebox/logger');

	try {
		await importIt(file, parent);
	} catch (e: any) {
		prettyPrintError('执行失败', e);

		logger.error`execution failed in ${humanDate.delta(Date.now() - startTime)}.`;
		throw shutdown(1);
	}

	logger.error`completed in ${humanDate.delta(Date.now() - startTime)}.`;
	shutdown(0);
}

declare global {
	namespace NodeJS {
		interface Process {
			emit(event: 'stabled'): void;
			on(event: 'stabled', listener: () => void): void;
		}
	}
}

export async function runForever(file: string, parent: string) {
	const { shutdown } = await setup('daemon', parent);

	try {
		await importIt(file, parent);
	} catch (e: any) {
		prettyPrintError('启动服务过程中出错', e);
		throw shutdown(66);
	}

	process.emit('stabled');
}

async function importIt(file: string, parent: string) {
	const abs = resolve(parent, file);
	await import(abs);
}

function installSourceMap() {
	if (inspector.url() || process.argv.some(filterInspectArgs) || process.env.DISABLE_SOURCE_MAP) {
		process.env.DISABLE_PRETTY_ERROR = 'yes';
	} else {
		install({});
	}
}
function filterInspectArgs(arg: string) {
	return (
		arg === '--inspect' || arg.startsWith('--inspect=') || arg === '--inspect-brk' || arg.startsWith('--inspect-brk=')
	);
}

async function setup(name: string, parent: string) {
	const { registerNodejsExitHandler, findUpUntil, shutdown } = await import('@idlebox/node');

	const pkgJsonPath = await findUpUntil({ file: 'package.json', from: parent });
	if (!pkgJsonPath) {
		throw new Error(`failed find package.json from ${parent}`);
	}

	const { argv } = await import('@idlebox/args/default');
	const level = argv.flag(['--debug', '-d']);

	isDebugMode = level > 0;
	isVerboseMode = level > 1;

	const { createRootLogger, set_default_log_level, EnableLogLevel } = await import('@idlebox/logger');
	let log_level = EnableLogLevel.auto;
	if (isVerboseMode) {
		log_level = EnableLogLevel.verbose;
	} else if (isDebugMode) {
		log_level = EnableLogLevel.debug;
	}
	set_default_log_level(log_level);
	createRootLogger(name, log_level);

	const { setErrorLogRoot, ensureDisposeGlobal } = await import('@idlebox/common');
	setErrorLogRoot(dirname(pkgJsonPath));

	registerNodejsExitHandler();

	return { shutdown, ensureDisposeGlobal };
}

export let isDebugMode = false;
export let isVerboseMode = false;
