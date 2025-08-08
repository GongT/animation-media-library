import { CommonEntity } from './schema.js';

export type EntityFields<T extends CommonEntity> = Omit<T, keyof CommonEntity>;
