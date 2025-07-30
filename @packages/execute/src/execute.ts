import inspector from "node:inspector";
import { basename, dirname, resolve } from "node:path";
import { install } from "source-map-support";

installSourceMap();

export async function runMain(file: string, parent: string) {
	const { shutdown } = await setup(basename(file, ".js"), parent);

	await importIt(file, parent);

	shutdown(0);
}

export async function runForever(file: string, parent: string) {
	const { logger } = await setup("daemon", parent);

	await importIt(file, parent);

	logger.fatal`daemon unexpected returned.`;
}

async function importIt(file: string, parent: string) {
	const abs = resolve(parent, file);
	await import(abs);
}

function installSourceMap() {
	if (inspector.url() || process.argv.some(filterInspectArgs)) {
		process.env.DISABLE_PRETTY_ERROR = "yes";
	} else {
		install({});
	}
}
function filterInspectArgs(arg: string) {
	return (
		arg === "--inspect" ||
		arg.startsWith("--inspect=") ||
		arg === "--inspect-brk" ||
		arg.startsWith("--inspect-brk=")
	);
}

async function setup(name: string, parent: string) {
	const { registerNodejsExitHandler, findUpUntil, shutdown } = await import(
		"@idlebox/node"
	);

	const pkgJsonPath = await findUpUntil({ file: "package.json", from: parent });
	if (!pkgJsonPath) {
		throw new Error(`failed find package.json from ${parent}`);
	}

	const { argv } = await import("@idlebox/args/default");
	const level = argv.flag(["--debug", "-d"]);

	isDebugMode = level > 0;
	isVerboseMode = level > 1;

	const { createRootLogger, logger, set_default_log_level, EnableLogLevel } =
		await import("@idlebox/logger");
	let log_level = EnableLogLevel.auto;
	if (isVerboseMode) {
		log_level = EnableLogLevel.verbose;
	} else if (isDebugMode) {
		log_level = EnableLogLevel.debug;
	}
	set_default_log_level(log_level);
	createRootLogger(name, log_level);

	const { setErrorLogRoot, ensureDisposeGlobal } = await import(
		"@idlebox/common"
	);
	setErrorLogRoot(dirname(pkgJsonPath));

	registerNodejsExitHandler();

	return { logger, shutdown, ensureDisposeGlobal };
}

export let isDebugMode = false;
export let isVerboseMode = false;
