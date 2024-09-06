interface DatabaseItem {
	id: bigint;
	createdAt: Date;
	updatedAt: Date;
}

/** @internal */
export class BaseModel<T> {
	constructor() {}
	findById(_id: bigint): Promise<DatabaseItem> {
		return 1 as any;
	}
	insert(_object: T) {}
}
