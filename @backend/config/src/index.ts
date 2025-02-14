import { DeepReadonly } from '@idlebox/common';

export type ILocation =
	| string
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

/**
 * 只在main()开始时调用一次
 */
export async function loadApplicationConfig() {
	config.http = {
		listen: {
			host: '0.0.0.0',
			port: 6666,
		},
	};
	config.database = {
		server: '/run/sockets/mariadb.sock',
		dbname: 'animation-media-library',
		user: 'aml-user',
		pass: 'aml-pass',
	};
}
const config: IAppConfig = {} as any;

export const appConfig: DeepReadonly<IAppConfig> = config;
