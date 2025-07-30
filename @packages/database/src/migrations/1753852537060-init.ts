import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1753852537060 implements MigrationInterface {
	public async up(_queryRunner: QueryRunner) {
		// queryRunner.createIndex(table, index)
	}

	public async down() {}
}
