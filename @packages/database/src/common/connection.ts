import { type DeepWriteable, oneSecond, registerGlobalLifecycle } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { appConfig } from '@packages/config';
import { DataSource } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import migrations from '../g/migrations.generated.js';
import schemas from '../g/schemas.generated.js';
import subscribers from '../g/subscribers.generated.js';
import { MyDatabaseLogger } from './db-logger.js';

/** @internal */
export let typeorm_data_source: DataSource;

function interop(exports: any) {
	return exports.default ?? exports;
}

async function options(): Promise<PostgresConnectionOptions> {
	const ret: DeepWriteable<PostgresConnectionOptions> = {
		type: 'postgres',
		useUTC: true,
		applicationName: 'animation-media-library',
		installExtensions: false,
		logNotifications: true,
		connectTimeoutMS: 5 * oneSecond,
		migrationsRun: false,
		synchronize: false,

		database: appConfig.database.dbname,
		username: appConfig.database.user,
		password: appConfig.database.pass,
	};

	if (typeof appConfig.database.server === 'string') {
		ret.host = appConfig.database.server;
		logger.debug(' - server: unix:%s', ret.host);
	} else {
		ret.host = appConfig.database.server.host;
		ret.port = appConfig.database.server.port;
		logger.debug(' - server: %s:%s', ret.host, ret.port);
	}

	// @ts-expect-error
	const pg: any = await import('pg');
	ret.driver = interop(pg);

	try {
		// @ts-expect-error
		const native: any = await import('pg-native');
		ret.nativeDriver = interop(native);
	} catch (_e) {
		logger.warn('包pg-native无法导入');
	}

	// TODO: production environment
	ret.logging = true;
	ret.logger = new MyDatabaseLogger(ret.logging);

	ret.entities = schemas;
	ret.migrations = migrations;
	ret.subscribers = subscribers;

	return ret;
}

export async function cleanRecreateDatabase() {
	const opts = await options();

	await dropDatabase({ ifExist: true, options: opts });

	// await createDatabaseIfNotExists();
}

export async function createDatabaseIfNotExists() {
	const opts = await options();

	await createDatabase({ ifNotExist: true, options: opts });

	await typeorm_data_source.synchronize();
	logger.debug('database schemas synchronized');
}

export async function startupDatabaseConnection() {
	await cleanRecreateDatabase();

	const opts = await options();
	await connect(opts);

	try {
		await migration();
	} catch (e: any) {
		if (isDataBaseNotExists(e)) {
			logger.warn('数据库不存在，尝试创建数据库');
			await createDatabaseIfNotExists();
			await migration();
			return;
		}
		throw e;
	}
}

async function connect(options: PostgresConnectionOptions) {
	try {
		logger.log('database connecting...');

		const AppDataSource = new DataSource(options);

		await AppDataSource.initialize();
		logger.debug('database connected');

		typeorm_data_source = AppDataSource;
	} catch (e: any) {
		throw new Error(`failed connect database: ${e.message}`);
	}
}

async function migration() {
	try {
		logger.log('database migrations...');

		await typeorm_data_source.runMigrations({ transaction: 'all' });

		logger.debug('migrations executed');
	} catch (e: any) {
		throw new Error(`failed to migrate database: ${e.message}`);
	}
}

function isDataBaseNotExists(e: Error) {
	return e.message.includes('database "') && e.message.includes('" does not exist');
}

registerGlobalLifecycle({
	async dispose() {
		if (!typeorm_data_source) return;

		console.log('database disconnecting...');
		const c = typeorm_data_source;
		// @ts-expect-error
		typeorm_data_source = undefined;
		await c.destroy();
		console.debug('database finished.');
	},
});
