import { Emitter } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { saveAll, UserConfigEntity } from '@packages/database';
import { type Handler, type Handlers, storeInt, storeString } from './convert.js';
import type { UserSettings, ValidKeys } from './type.js';

const handlers: Handlers = {
	bangumiUserToken: storeString(''),
	lastUserToken: storeString(''),
	bangumiUserId: storeInt(-1),
	lastSyncTimestamp: storeInt(0),
};

function isValidKey(key: string): key is ValidKeys {
	return Object.hasOwn(handlers, key);
}

function checkValidKey(key: string): asserts key is ValidKeys {
	if (!isValidKey(key)) {
		throw new TypeError(`invalid user setting key ${key}`);
	}
}

interface IData {
	entity: UserConfigEntity;
	value: any;
}

class SettingsRepository {
	private readonly valuesEntity = new Map<string, IData>();

	private readonly _onChange = new Emitter<void>();
	public readonly onChange = this._onChange.event;

	private readonly logger = logger.extend('settings');

	private initValue(entity: UserConfigEntity) {
		this.logger.verbose`init: ${entity.key} => ${entity.valueRaw}`;
		const key = entity.key;

		if (this.valuesEntity.has(key)) {
			throw new Error(`duplicate setting key: ${key}`);
		}
		checkValidKey(key);

		const handler = handlers[key];
		this.valuesEntity.set(key, {
			entity,
			value: handler.parse(entity.valueRaw),
		});
	}

	async initialize() {
		const initList = await UserConfigEntity.find({});
		const notExists = new Set<ValidKeys>(Object.keys(handlers) as ValidKeys[]);
		for (const entity of initList) {
			if (isValidKey(entity.key)) {
				notExists.delete(entity.key);
				this.initValue(entity);
			} else {
				this.logger.warn`unknown user setting in database, delete it: ${entity.key}`;
				entity.remove();
			}
		}

		const newItems: UserConfigEntity[] = [];
		for (const key of notExists) {
			const handler: Handler<unknown> = handlers[key];

			const entity = UserConfigEntity.create({
				key,
				valueRaw: handler.store(handler.defaults),
			});
			newItems.push(entity);

			this.logger.warn`save default value to database: ${entity.key}`;

			this.initValue(entity);
		}

		if (newItems.length) {
			await saveAll(newItems);
		}
	}

	get<T extends keyof UserSettings>(name: T): UserSettings[T] {
		checkValidKey(name);

		// biome-ignore lint/style/noNonNullAssertion: already passed
		return this.valuesEntity.get(name)!.value;
	}

	async update(values: Partial<UserSettings>): Promise<void> {
		const ch = await this._update(values);
		if (ch) {
			this._onChange.fire();
		}
	}

	private async _update(values: Partial<UserSettings>) {
		if (Object.keys(values).length === 0) {
			return false;
		}

		const changes: UserConfigEntity[] = [];
		for (const [key, value] of Object.entries(values)) {
			checkValidKey(key);

			const handler: Handler<unknown> = handlers[key];

			// biome-ignore lint/style/noNonNullAssertion: passed
			const exists = this.valuesEntity.get(key)!;

			if (handler.compare(exists.value, value)) {
				continue;
			}

			exists.entity.valueRaw = handler.store(value);
			changes.push(exists.entity);
		}

		if (changes.length) {
			await saveAll(changes);
			return true;
		} else {
			return false;
		}
	}
}

export const userSettings = new SettingsRepository();
