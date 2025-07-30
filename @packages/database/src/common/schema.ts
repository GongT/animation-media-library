import 'reflect-metadata';
import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { inspect, InspectOptionsStylized } from 'util';

export abstract class CommonEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'bigint' })
	declare id: bigint;

	@Column({ type: 'timestamp without time zone', update: false })
	declare createdAt: Date;

	@Column({ type: 'timestamp without time zone' })
	declare updatedAt: Date;

	[inspect.custom](_depth: number, options: InspectOptionsStylized, _inspect: typeof inspect): string {
		let id = '';
		if (this.hasId()) {
			id = options.stylize(this.id.toString(), 'symbol');
		} else {
			id = options.stylize('not inserted', 'undefined');
		}
		return `[${options.stylize(this.constructor.name, 'special')} ${id}]`;
	}
}
