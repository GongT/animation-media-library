import type { UpsertResult } from 'mariadb';
import { BaseModel } from '../common/base-model.js';

export interface Episodes {
	animation_id: bigint;
	title: string;
	original_title: string;
	airdate: string;
	duration: string;
	ep: number;
	sort: number;
}

export class EpisodesDatabase extends BaseModel<Episodes> {
	protected override async initializeTable() {
		const r = await this.execute<UpsertResult>`CREATE TABLE IF NOT EXISTS \`${this.table}\` (
			id BIGINT PRIMARY KEY,
			animation_id BIGINT NOT NULL,
			title TEXT NOT NULL,
			original_title TEXT NOT NULL,
			airdate VARCHAR(32) NOT NULL,
			duration VARCHAR(32) NOT NULL,
			ep INT NOT NULL,
			sort INT NOT NULL,
			createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

			CONSTRAINT fk_episodes_animation_id FOREIGN KEY (animation_id) REFERENCES animation(id)
		) COMMENT = "系统设置"`;
		console.log(`       existence: ${!!r.warningStatus}`);
	}
}
