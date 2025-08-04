import { logger } from '@idlebox/logger';
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1753852537060 implements MigrationInterface {
	public async up(_queryRunner: QueryRunner) {
		logger.warn`migration 0-init exec`;

		// 没有数据库就没法运行mingration
		// await _queryRunner.createDatabase(appConfig.database.dbname, true);
	}

	public async down(_queryRunner: QueryRunner) {
		logger.warn`migration 0-init down`;
	}
}
