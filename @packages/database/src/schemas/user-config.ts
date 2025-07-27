import type { UpsertResult } from 'mariadb';
import { BaseModel } from '../common/base-model.js';

interface ConfigDoc {
	value: string;
}

export interface UserConfig {
	bangumiUserId: string;
	bangumiToken: string; // https://next.bgm.tv/demo/access-token
	webAccessToken: string; // 网页访问令牌
	dlTorrentPort: number;
	dlWebPort: number;
	dlCommonTrackers: string[];
	rootDirectory: string;
	autoResumeDownload: boolean;
}

export class UserConfigDatabase extends BaseModel<ConfigDoc, string> {
	protected override async initializeTable() {
		const r = await this.execute<UpsertResult>`CREATE TABLE IF NOT EXISTS ${this.table} (
			id VARCHAR(300) PRIMARY KEY,
			value JSON NOT NULL CHECK (json_valid(value)),
			createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) COMMENT = "系统设置和程序状态存储（键值对）"`;
		console.log(`       existence: ${!!r.warningStatus}`);
	}
}
