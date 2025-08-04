import type { EntityManager } from 'typeorm';
import { typeorm_data_source } from './connection.js';
import type { CommonEntity } from './schema.js';

export type TransactionFunction<T> = (manager: EntityManager) => Promise<T>;

export function transaction<T>(fn: TransactionFunction<T>): Promise<T> {
	return typeorm_data_source.transaction('READ COMMITTED', fn);
}

/**
 * REPEATABLE READ - 在事务开始后，读取到的行数据不会被其他事务修改。
 */
export function transactionRepeatable<T>(fn: TransactionFunction<T>): Promise<T> {
	return typeorm_data_source.transaction('REPEATABLE READ', fn);
}

/**
 * SERIALIZABLE - 性能最差，隔离最强的事务，这个项目应该用不到
 */
export function transactionSerialize<T>(fn: TransactionFunction<T>): Promise<T> {
	return typeorm_data_source.transaction('SERIALIZABLE', fn);
}

export async function saveAll(entities: readonly CommonEntity[]) {
	await typeorm_data_source.transaction('READ COMMITTED', async (manager) => {
		for (const entity of entities) {
			await manager.save(entity);
		}
	});
}
