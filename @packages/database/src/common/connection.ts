import { appConfig } from '@backend/config';
import { registerGlobalLifecycle } from '@idlebox/common';
import { drizzle } from 'drizzle-orm/mysql2';
import { type Connection, type ConnectionConfig, createConnection } from 'mariadb';
import * as schemas from '../schemas/index.js';

/** @internal */
export let conn: Connection;

export async function startupDatabaseConnection() {
	console.log('database connecting...');

	const c_opts: ConnectionConfig = {
		charset: 'utf8mb4',
		collation: 'utf8mb4_bin',
		database: appConfig.database.dbname,
		trace: false,
		// initSql: [],
		rowsAsArray: true,
		connectAttributes: {
			applicationName: 'animation-media-library',
		},
		logger: {
			query(msg) {
				console.debug(`[sql] query: ${msg}`);
			},
			warning(msg) {
				console.warn(`[sql] warn: ${msg}`);
			},
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
	} catch (e: unknown) {
		console.log(' - execute fail.');
		throw e;
	}

	drizzle(conn, { schema: schemas, mode: 'default' });

	// await conn.beginTransaction();
	// const { db } = await import('../model/index.generated.js');
	// for (const table of Object.values(db)) {
	// 	console.log(` - table: ${table.table}`);
	// 	await table.init();
	// }
	// await conn.commit();
}

registerGlobalLifecycle({
	async dispose() {
		if (!conn) return;

		console.log('database disconnecting...');
		const c = conn;
		// @ts-ignore
		conn = undefined;
		await c.end();
		console.log('database finished.');
	},
});
