import { bigint, mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { datetimeFields } from '../common/schema.js';

export enum WatchState {
	Watching = 'do', // 在看
	Wish = 'wish', // 想看
	Collect = 'collect', // 看过
	OnHold = 'on_hold', // 搁置
	Dropped = 'dropped', // 抛弃
}

type MyEnumValue = `${WatchState}`;
const values: [MyEnumValue] = Object.values(WatchState) as any;

export interface Animation {
	title: string;
	original_title: string;
	cover: string;
	watch_state: WatchState;
}

export const animations = mysqlTable('countries', {
	id: bigint('id', { mode: 'bigint', unsigned: true }).notNull().primaryKey(),
	title: varchar('title', { length: 1024 }).notNull(),
	originalTitle: varchar('original_title', { length: 1024 }).notNull(),
	coverImage: varchar('cover_image', { length: 1024 }).notNull(),
	watchState: mysqlEnum('watchs_tate', values).notNull(),
	...datetimeFields,
});

// export class AnimationDatabase extends BaseModel<Animation> {
// 	protected override async initializeTable() {
// 		const r = await this.execute<UpsertResult>`CREATE TABLE IF NOT EXISTS \`${this.table}\` (
// 			id BIGINT PRIMARY KEY,
// 			title VARCHAR(1024) NOT NULL,
// 			original_title VARCHAR(1024) NOT NULL,
// 			cover TEXT NOT NULL,
// 			watch_state CHAR(16) NOT NULL COMMENT "do在看, wish想看, collect看过, on_hold搁置, dropped抛弃",
// 			createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
// 			updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// 		) COMMENT = "从bangumi拉的动画信息"`;
// 		console.log(`       existence: ${!!r.warningStatus}`);
// 	}
// }
