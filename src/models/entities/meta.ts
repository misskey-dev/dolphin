import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Meta {
	@PrimaryColumn({
		type: 'varchar',
		length: 32
	})
	public id: string;

	@Column('varchar', {
		length: 128, nullable: true
	})
	public name: string | null;

	@Column('varchar', {
		length: 1024, nullable: true
	})
	public description: string | null;

	/**
	 * メンテナの名前
	 */
	@Column('varchar', {
		length: 128, nullable: true
	})
	public maintainerName: string | null;

	/**
	 * メンテナの連絡先
	 */
	@Column('varchar', {
		length: 128, nullable: true
	})
	public maintainerEmail: string | null;

	@Column('boolean', {
		default: false,
	})
	public useStarForReactionFallback: boolean;

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

	@Column('boolean', {
		default: false,
	})
	public enableRecaptcha: boolean;

	@Column('varchar', {
		length: 64,
		nullable: true
	})
	public recaptchaSiteKey: string | null;

	@Column('varchar', {
		length: 64,
		nullable: true
	})
	public recaptchaSecretKey: string | null;

	@Column('integer', {
		default: 1024,
		comment: 'Drive capacity of a local user (MB)'
	})
	public localDriveCapacityMb: number;

	@Column('integer', {
		default: 32,
		comment: 'Drive capacity of a remote user (MB)'
	})
	public remoteDriveCapacityMb: number;

	@Column('integer', {
		default: 500,
		comment: 'Max allowed note text length in characters'
	})
	public maxNoteTextLength: number;

	@Column('varchar', {
		length: 128,
		nullable: true
	})
	public summalyProxy: string | null;

	@Column('boolean', {
		default: false,
	})
	public enableServiceWorker: boolean;

	@Column('varchar', {
		length: 128,
		nullable: true
	})
	public swPublicKey: string | null;

	@Column('varchar', {
		length: 128,
		nullable: true
	})
	public swPrivateKey: string | null;

	@Column('boolean', {
		default: false,
	})
	public useObjectStorage: boolean;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageBucket: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStoragePrefix: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageBaseUrl: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageEndpoint: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageRegion: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageAccessKey: string | null;

	@Column('varchar', {
		length: 512,
		nullable: true
	})
	public objectStorageSecretKey: string | null;

	@Column('integer', {
		nullable: true
	})
	public objectStoragePort: number | null;

	@Column('boolean', {
		default: true,
	})
	public objectStorageUseSSL: boolean;
}
