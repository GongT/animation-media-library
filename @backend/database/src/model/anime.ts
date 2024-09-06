import { BaseModel } from '../common/base-model';

/** @public */
export class AnimeDatabase extends BaseModel<number> {}

const x = new AnimeDatabase();
console.log(x);
