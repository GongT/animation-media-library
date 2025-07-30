import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	UpdateEvent,
} from "typeorm";
import { CommonEntity } from "../common/schema.js";

@EventSubscriber()
export class AutoSubscriber implements EntitySubscriberInterface {
	beforeInsert(event: InsertEvent<CommonEntity>): void {
		event.entity.createdAt = new Date();
		event.entity.updatedAt = new Date();
	}

	beforeUpdate(event: UpdateEvent<CommonEntity>): void {
		if (!event.entity) {
			return;
		}
		event.entity.updatedAt = new Date();
	}
}
