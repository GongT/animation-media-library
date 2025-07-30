import { logger } from '@idlebox/logger';
import { appConfig } from '@packages/config';
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1753852537060 implements MigrationInterface {
	public async up(queryRunner: QueryRunner) {
		logger.warn`migration 0-init exec`;
		await queryRunner.createDatabase(appConfig.database.dbname, true);
	}

	public async down(queryRunner: QueryRunner) {
		logger.warn`migration 0-init down`;
		await queryRunner.dropDatabase(appConfig.database.dbname, true);
	}
}
