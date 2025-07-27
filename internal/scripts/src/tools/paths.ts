import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';

export const projectRoot = process.env.PROJECT_ROOT ?? findRoot();

function findRoot(): string {
	const found = findUpUntilSync({ from: import.meta.dirname, file: 'pnpm-workspace.yaml' });
	if (!found) {
		throw new Error('Could not find project root (pnpm-workspace.yaml). And no PROJECT_ROOT environment.');
	}
	const root = dirname(found);
	process.env.PROJECT_ROOT = root;
	return root;
}
