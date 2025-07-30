import "reflect-metadata";
import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class CommonEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: "bigint" })
	declare id: bigint;

	@Column({ type: "timestamp without time zone", update: false })
	declare createdAt: Date;

	@Column({ type: "timestamp without time zone" })
	declare updatedAt: Date;
}
