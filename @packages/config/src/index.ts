import type { DeepReadonly } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';

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

export const IS_BUILT = false;

let root: string;
if (IS_BUILT) {
	root = import.meta.APP_ROOT_DIR;
} else {
	const r = findUpUntilSync({ from: import.meta.dirname, file: 'pnpm-workspace.yaml' });
	if (!r) {
		throw new Error('missing pnpm-workspace.yaml');
	}
	root = dirname(r);
}
export const APP_ROOT_DIR = root;

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
