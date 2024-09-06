import { registerGlobalLifecycle } from '@idlebox/common';
import { Connection, createConnection } from 'mariadb';

/** @internal */
export let conn: Connection;

export async function startupDatabaseConnection() {
	try {
		console.error('database connecting...');
		conn = await createConnection({
			host: 'mydb.com',
			user: 'myUser',
			password: 'myPwd',
		});

		await conn.query('select 1', [2]);
		console.log('success.');
	} catch (e: any) {
		console.error('failed.');
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
