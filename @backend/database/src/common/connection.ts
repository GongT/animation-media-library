import { appConfig } from '@backend/config';
import { registerGlobalLifecycle } from '@idlebox/common';
import { Connection, ConnectionConfig, createConnection } from 'mariadb';

/** @internal */
export let conn: Connection;

export async function startupDatabaseConnection() {
	console.log('database connecting...');

	const c_opts: ConnectionConfig = {
		charset: 'utf8mb4',
		collation: 'utf8mb4_bin',
		trace: false,
		// initSql: [],
		rowsAsArray: true,
		connectAttributes: {
			applicationName: 'animation-media-library',
		},
	};

	if (typeof appConfig.database.server === 'string') {
		c_opts.socketPath = appConfig.database.server;
		console.log(' - server: unix:%s', c_opts.socketPath);
	} else {
		c_opts.host = appConfig.database.server.host;
		c_opts.port = appConfig.database.server.port;
		console.log(' - server: %s:%s', c_opts.host, c_opts.port);
	}
	if (appConfig.database.user) {
		c_opts.user = appConfig.database.user;
		c_opts.password = appConfig.database.pass;
		console.log(' - authentication is enabled (user: %s)', c_opts.user);
	} else {
		console.log(' - authentication is disabled');
	}

	try {
		conn = await createConnection(c_opts);

		await conn.query('select 1', [2]);
		console.log('connect success.');
	} catch (e: any) {
		console.log('connect failed.');
		throw e;
	}
}

registerGlobalLifecycle({
	async dispose() {
		if (!conn) return;
		const c = conn;
		// @ts-ignore
		conn = undefined;
		await c.end();
	},
});
