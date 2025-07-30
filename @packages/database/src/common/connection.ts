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

let native_warned = false;

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
	} else {
		ret.host = appConfig.database.server.host;
		ret.port = appConfig.database.server.port;
	}

	// @ts-expect-error
	const pg: any = await import('pg');
	ret.driver = interop(pg);

	try {
		// @ts-expect-error
		const native: any = await import('pg-native');
		ret.nativeDriver = interop(native);
	} catch (_e) {
		if (!native_warned) {
			logger.warn('包pg-native无法导入');
			native_warned = true;
		}
	}

	// TODO: production environment
	ret.logging = true;
	ret.logger = new MyDatabaseLogger(ret.logging);

	ret.entities = schemas;
	ret.migrations = migrations;
	ret.subscribers = subscribers;

	return ret;
}

/**
 * @deprecated
 */
export async function debugDeleteDatabase() {
	const opts = await options();

	await dropDatabase({ ifExist: true, options: opts });
}

export async function createDatabaseAndSync() {
	const opts = await options();

	await createDatabase({ ifNotExist: false, options: opts });

	if (!typeorm_data_source) {
		const opts = await options();
		await connect(opts);
	}
	await typeorm_data_source.synchronize();
	logger.success('✅ 数据库成功创建并初始化');
}

export async function startupDatabaseConnection() {
	logger.log('⏩ 正在连接数据库');

	const opts = await options();

	try {
		await connect(opts);

		logger.success('✅ 数据库存在，无需初始化');
	} catch (e: any) {
		if (isDataBaseNotExists(e)) {
			logger.warn('数据库不存在，尝试创建数据库');
			await createDatabaseAndSync();
		} else {
			throw e;
		}
	}

	await migration();
}

async function connect(options: PostgresConnectionOptions) {
	if (typeorm_data_source) throw new Error('数据库连接已存在');

	try {
		logger.debug('connecting...');

		const AppDataSource = new DataSource(options);

		await AppDataSource.initialize();
		logger.success('✅ 数据库连接已建立');

		typeorm_data_source = AppDataSource;
	} catch (e: any) {
		console.error(e.stack);

		throw new Error(`failed connect database: ${e.message}`);
	}
}

async function migration() {
	try {
		logger.log('⏩ 运行数据库迁移');

		const r = await typeorm_data_source.runMigrations({ transaction: 'all' });

		logger.success`✅ 迁移结束 (${r.length})`;
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

		console.log('⏩ 断开数据库连接');
		const c = typeorm_data_source;
		// @ts-expect-error
		typeorm_data_source = undefined;
		await c.destroy();
		console.debug('database finished.');
	},
});
