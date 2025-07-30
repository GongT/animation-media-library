import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../common/schema.js';

@Entity({ comment: '系统设置', name: 'user_settings' })
export class UserConfigEntity extends CommonEntity {
	@Column('varchar', { length: 64, nullable: false })
	declare key: string;

	@Column('text')
	declare valueRaw: string;
}
