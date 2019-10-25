import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Meta {
	@PrimaryColumn({
		type: 'varchar',
		length: 32
	})
	public id: string;

	@Column('varchar', {
		length: 1024, nullable: true
	})
	public description: string | null;

	@Column('varchar', {
		length: 256, array: true, default: '{}'
	})
	public blockedHosts: string[];

	@Column('boolean', {
		default: true,
	})
	public cacheRemoteFiles: boolean;

	@Column('varchar', {
		length: 128,
		nullable: true
	})
	public proxyAccount: string | null;

	@Column('integer', {
		default: 32,
		comment: 'Drive capacity of a remote user (MB)'
	})
	public remoteDriveCapacityMb: number;
}
