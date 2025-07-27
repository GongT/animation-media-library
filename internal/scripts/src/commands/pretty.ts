import { execaSync } from 'execa';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { projectRoot } from '../tools/paths.js';

const biome = fileURLToPath(import.meta.resolve('@biomejs/biome/bin/biome'));
const exArgs = process.argv.slice(2);
const locations = ['./scripts'];

for await (const item of glob('./@*/*', { cwd: projectRoot })) {
	locations.push(item);
}

console.log('projectRoot = %s', projectRoot);

const args = ['check', '--write', ...locations, ...exArgs];
console.log('execute: biome %s', args.join(' '));
execaSync(biome, args, {
	stdio: 'inherit',
	cwd: projectRoot,
});
