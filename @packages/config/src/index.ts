import { oneDay, type DeepReadonly } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';
import { read_git, read_package } from './common/devel-version.js';

type UnixSocket = string;

export type ILocation =
	| UnixSocket
	| {
			host: string;
			port: number;
	  };

export interface IHttpConfig {
	listen: ILocation;
}

export interface IDatabaseConfig {
	server: ILocation;

	dbname: string;
	user: string;
	pass: string;
}

export interface IAppConfig {
	http: IHttpConfig;
	database: IDatabaseConfig;
}

let is_built = false;
let root = import.meta.app_root_dir;
if (root) {
	is_built = true;
} else {
	const r = findUpUntilSync({ from: import.meta.dirname, file: 'pnpm-workspace.yaml' });
	if (!r) {
		throw new Error('missing pnpm-workspace.yaml');
	}
	root = dirname(r);
}
export const APP_ROOT_DIR: string = root;
export const IS_BUILT: boolean = is_built;

/**
 * 只在main()开始时调用一次
 */
export async function loadApplicationConfig() {
	logger.log('loading configuration...');
	config.http = {
		listen: {
			host: '0.0.0.0',
			port: 6666,
		},
	};

	config.database = {
		server: resolve(APP_ROOT_DIR, '.development/sockets'),
		dbname: 'animation-media-library',
		user: 'postgres',
		pass: 'password',
	};
}
const config: IAppConfig = {} as any;

export const appConfig: DeepReadonly<IAppConfig> = config;

const version = import.meta.app_version || (await read_package());
const hash = import.meta.git_hash || (await read_git());

export const APP = {
	userAgent: `GongT/AML (https://github.com/gongt/animation-media-library; ${version}; ${hash})`,
	fullSyncInterval: 7 * oneDay,
} as const;
