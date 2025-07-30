const { resolve, basename } = require('node:path');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const PROJECT_ROOT = __dirname;
const myProjects = new Set();
const knownTypesVersion = {};

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
		const val = loadJsonSync(p);
		if (val.name) {
			myProjects.add(val.name);
		}
	}
}

function readPackage(packageJson, context) {
	if (myProjects.has(packageJson.name)){
		// 
	}else{
		packageJson.devDependencies['@build-script/codegen'] = 'latest'
	}
	return packageJson;
}

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}
