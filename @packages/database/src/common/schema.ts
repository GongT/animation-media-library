import { timestamp } from 'drizzle-orm/mysql-core';

export const datetimeFields = {
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().onUpdateNow().defaultNow(),
};
