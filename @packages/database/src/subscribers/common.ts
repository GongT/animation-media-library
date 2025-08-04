import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent, type UpdateEvent } from 'typeorm';
import { CommonEntity } from '../common/schema.js';

@EventSubscriber()
export class AutoSubscriber implements EntitySubscriberInterface<CommonEntity> {
	listenTo() {
		return CommonEntity;
	}

	beforeInsert(event: InsertEvent<CommonEntity>): void {
		console.log('before insert', event.entity);
		event.entity.createdAt = new Date();
		event.entity.updatedAt = new Date();
	}

	beforeUpdate(event: UpdateEvent<CommonEntity>): void {
		console.log('before update', event.entity);
		if (!event.entity) {
			return;
		}
		event.entity.updatedAt = new Date();
	}
}
