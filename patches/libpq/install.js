#!/usr/bin/env node

Object.assign(process.env, {
	RPM_PACKAGE_NAME: '',
	RPM_PACKAGE_RELEASE: '',
	RPM_PACKAGE_VERSION: '1.1.1',
	RPM_ARCH: 'x86_64',
});

import { execLazyError } from '@idlebox/node';
import { findPackageJSON } from 'node:module';
import { dirname } from 'node:path';

const libpqJson = findPackageJSON('libpq', import.meta.url);
if (!libpqJson) throw new Error('can not find installed libpq');

await execLazyError('node-gyp', ['rebuild', '--ensure'], { cwd: dirname(libpqJson) });
console.log('libpq built successful.');
