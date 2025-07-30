import { Column, Entity } from "typeorm";
import { CommonEntity } from "../common/schema.js";

export enum FieldType {
	String = "string",
	Number = "number",
	Boolean = "boolean",
}

@Entity({ comment: "系统设置" })
export class UserConfigEntity extends CommonEntity {
	@Column({ type: "enum", enum: FieldType })
	declare type: FieldType;

	@Column("varchar", { length: 64, nullable: false })
	declare key: string;

	@Column("text")
	declare valueRaw: string;
}
