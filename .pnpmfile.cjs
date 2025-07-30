const { resolve, basename } = require('node:path');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert');

const PROJECT_ROOT = __dirname;
const myProjects = new Map();

module.exports = {
	hooks: {
		readPackage,
	},
};

function init() {
	const cmds = [process.argv0, require.main.filename, 'multi', 'ls', '--json', '--depth=-1'];
	console.error(`\x1B[2m+ ${cmds.join(' ')}\x1B[0m`);
	const result = spawnSync(cmds[0], cmds.slice(1), {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	if (result.error) {
		throw result.error;
	}
	const projects = JSON.parse(result.stdout);

	console.log('\x1B[38;5;10m[%s]: there are %d projects in workspace.\x1B[0m', basename(__filename), projects.length);

	for (const { path } of projects) {
		const p = resolve(path, 'package.json');
		const val = require(p);
		if (val.name) {
			myProjects.set(val.name, path);
		}
	}
}

const rigPkg = require('./internal/local-rig/package.json');
assert.notEqual(
	rigPkg.devDependencies['@build-script/codegen'],
	undefined,
	'missing @build-script/codegen in local-rig'
);

let inited = false;
function readPackage(packageJson, _context) {
	if (!inited) {
		init();
		inited = true;
	}

	if (myProjects.has(packageJson.name)) {
		const path = myProjects.get(packageJson.name);
		if (path.includes('/patches/')) {
		} else {
			packageJson.devDependencies['@build-script/codegen'] = rigPkg.devDependencies['@build-script/codegen'];
		}
	} else if (packageJson.name === 'typeorm-extension') {
		assert.ok('locter' in packageJson.dependencies, `missing locter as dependency of ${packageJson.name}`);
		assert.equal(
			'@types/locter' in packageJson.dependencies,
			false,
			`already have @types/locter as dependency of ${packageJson.name}`
		);
		packageJson.dependencies['@types/locter'] = resolve(PROJECT_ROOT, 'patches/locter');

		assert.equal(
			'@types/yargs' in packageJson.dependencies,
			false,
			`already have @types/yargs as dependency of ${packageJson.name}`
		);
		packageJson.dependencies['@types/yargs'] = 'latest';
	} else if (packageJson.name === 'pg-native') {
		assert.ok('libpq' in packageJson.dependencies, `missing pg as dependency of ${packageJson.name}`);
		packageJson.dependencies.libpq = resolve(PROJECT_ROOT, 'patches/libpq');
	}
	return packageJson;
}

function _loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}
