import { Column, Entity, Index } from "typeorm";
import { CommonEntity } from "../common/schema.js";

export enum WatchState {
	NotCollect = "未收藏",
	Watch = "在看",
	Wish = "想看",
	Complete = "看过",
	Hold = "搁置",
	Drop = "抛弃",
}

@Entity({ comment: "动画" })
export class AnimationEntity extends CommonEntity {
	@Index({ unique: true, spatial: true })
	@Column("int")
	declare bgmSubjectId: number;

	@Column("text")
	declare title: string;

	@Column("text")
	declare coverUrl: string;

	@Column({ type: "date" })
	declare onAirFrom: Date;

	@Column({ type: "date" })
	declare onAirTo: Date;

	@Column({ type: "enum", enum: WatchState, default: WatchState.NotCollect })
	declare watchState: WatchState;

	@Column("int")
	declare episodeCount: number;
}
