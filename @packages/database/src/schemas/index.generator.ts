import { camelCase, ucfirst } from '@idlebox/common';
import type { FileBuilder, IOutputShim } from '@internal/local-rig';
import { readdir } from 'node:fs/promises';

export async function generate(builder: FileBuilder, logger: IOutputShim) {
	let ret = '';
	const names = [];
	for (const item of await readdir(__dirname)) {
		if (!item.endsWith('.ts') || item.endsWith('generator.ts') || item.endsWith('generated.ts')) {
			continue;
		}

		const name = item.replace(/\.ts$/, '');
		const varName = camelCase(name);
		const clsName = `${ucfirst(varName)}Database`;
		names.push(varName);
		ret += `import {${clsName}} from './${name}';\n`;
		ret += `const ${varName} = new ${clsName}();\n`;
		ret += `\n`;
	}

	ret += `\n`;
	ret += 'export const db = {\n';
	for (const v of names) {
		ret += `\t${v},\n`;
	}
	ret += '} as const;';

	return '';
}
