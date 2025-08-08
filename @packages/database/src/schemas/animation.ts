import { Column, Entity, Index } from 'typeorm';
import { WatchState } from '../common/enums.js';
import { CommonEntity } from '../common/schema.js';

@Entity({ comment: '动画', name: 'animations' })
export class AnimationEntity extends CommonEntity {
	@Index({ unique: true })
	@Column('int')
	declare bgmSubjectId: number;

	@Column('text')
	declare title: string;

	@Column('text')
	declare coverUrl: string;

	@Column({ type: 'date' })
	declare onAirFrom: Date;

	@Column({ type: 'date', nullable: true })
	onAirTo?: Date;

	@Column({ type: 'enum', enum: WatchState })
	declare watchState: WatchState;

	@Column('int')
	declare episodeCount: number;
}
