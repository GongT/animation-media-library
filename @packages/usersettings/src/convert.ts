import type { UserSettings } from './type.js';

export type Handler<T> = {
	parse(raw: string): T;
	store(data: T): string;
	compare(a: T, b: T): boolean;
	defaults: T;
};

export type Handlers = {
	[K in keyof UserSettings]: Handler<UserSettings[K]>;
};

export function storeString(defaults: string): Handler<string> {
	return {
		parse: (raw) => raw,
		store: (data) => data,
		compare: strictEqual,
		defaults,
	};
}

export function storeInt(defaults: number): Handler<number> {
	return {
		parse: (raw) => Number.parseInt(raw, 10),
		store: (data) => data.toString(),
		compare: strictEqual,
		defaults,
	};
}

export function storeFloat(defaults: number): Handler<number> {
	return {
		parse: (raw) => Number.parseFloat(raw),
		store: (data) => data.toString(),
		compare: strictEqual,
		defaults,
	};
}

export function storeBigInt(defaults: bigint): Handler<bigint> {
	return {
		parse: (raw) => BigInt(raw),
		store: (data) => data.toString(),
		compare: strictEqual,
		defaults,
	};
}

export function storeBool(defaults: boolean): Handler<boolean> {
	return {
		parse: (raw) => raw === 'true',
		store: (data) => (data ? 'true' : 'false'),
		compare: strictEqual,
		defaults,
	};
}

function strictEqual<T extends bigint | number | string | boolean>(a: T, b: T) {
	return a === b;
}
