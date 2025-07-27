import { linux_case } from '@idlebox/common';
import { conn } from './connection.js';

export function sql(strings: TemplateStringsArray, ...values: any[]) {
	return String.raw({ raw: strings }, ...values);
}

export interface DatabaseItem<ID = bigint> {
	id: ID;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPager {
	page: number;
	pageSize: number;
}

export type Doc<ID, T> = DatabaseItem<ID> & T;

/** @internal */
export abstract class BaseModel<DocType extends object, ID = bigint> {
	readonly table: string = linux_case(this.constructor.name.replace(/Database$/i, ''));

	protected async execute<T = Doc<ID, DocType>>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
		console.log('prep;');
		const stat = await conn.prepare(strings.join('?').replace(/\s+/gm, ' '));
		console.log('exec param', values);
		const res = await stat.execute(values);
		stat.close();
		return res;
		// return conn.execute<T>(sql, params);
	}
	// async findById(id: ID) {}
	// async find(query: string, params: Primitive[], pager: IPager) {}
	// async insert(doc: DocType) {}
	// async delete(id: ID) {}
	// async update(id: ID, doc: Partial<DocType>) {}
	// async upsert(id: ID, doc: Partial<DocType>) {}

	protected abstract initializeTable(): Promise<void>;

	/** @internal */
	async init() {
		await this.initializeTable();
	}
}
