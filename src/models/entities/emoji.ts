import { PrimaryColumn, Entity, Index, Column, ManyToOne, JoinColumn } from 'typeorm';
import { id } from '../id';
import { DriveFile } from './drive-file';

@Entity()
@Index(['name', 'host'], { unique: true })
export class Emoji {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		nullable: true
	})
	public updatedAt: Date | null;

	@Index()
	@Column('varchar', {
		length: 128
	})
	public name: string;

	@Index()
	@Column('varchar', {
		length: 128, nullable: true
	})
	public host: string | null;

	@Column('varchar', {
		length: 512,
	})
	public url: string;

	@Column('varchar', {
		length: 512, nullable: true
	})
	public uri: string | null;

	@Index()
	@Column({
		...id(),
		nullable: true, default: null,
	})
	public fileId: DriveFile['id'] | null;

	@ManyToOne(type => DriveFile, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public file: DriveFile | null;

	@Column('varchar', {
		length: 64, nullable: true
	})
	public type: string | null;

	@Column('varchar', {
		array: true, length: 128, default: '{}'
	})
	public aliases: string[];
}
