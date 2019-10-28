import { createConnection, Logger, getConnection } from 'typeorm';
import config from '../config';
import { entities as charts } from '../services/chart/entities';
import { dbLogger } from './logger';
import * as highlight from 'cli-highlight';

import { User } from '../models/entities/user';
import { DriveFile } from '../models/entities/drive-file';
import { DriveFolder } from '../models/entities/drive-folder';
import { PollVote } from '../models/entities/poll-vote';
import { Note } from '../models/entities/note';
import { NoteReaction } from '../models/entities/note-reaction';
import { NoteUnread } from '../models/entities/note-unread';
import { Notification } from '../models/entities/notification';
import { Meta } from '../models/entities/meta';
import { Following } from '../models/entities/following';
import { Instance } from '../models/entities/instance';
import { SwSubscription } from '../models/entities/sw-subscription';
import { Blocking } from '../models/entities/blocking';
import { Muting } from '../models/entities/muting';
import { UserList } from '../models/entities/user-list';
import { UserListJoining } from '../models/entities/user-list-joining';
import { Hashtag } from '../models/entities/hashtag';
import { NoteFavorite } from '../models/entities/note-favorite';
import { FollowRequest } from '../models/entities/follow-request';
import { Emoji } from '../models/entities/emoji';
import { UserNotePining } from '../models/entities/user-note-pinings';
import { Poll } from '../models/entities/poll';
import { UserKeypair } from '../models/entities/user-keypair';
import { UserPublickey } from '../models/entities/user-publickey';
import { UserProfile } from '../models/entities/user-profile';
import { UsedUsername } from '../models/entities/used-username';

const sqlLogger = dbLogger.createSubLogger('sql', 'white', false);

class MyCustomLogger implements Logger {
	private highlight(sql: string) {
		return highlight.highlight(sql, {
			language: 'sql', ignoreIllegals: true,
		});
	}

	public logQuery(query: string, parameters?: any[]) {
		sqlLogger.info(this.highlight(query));
	}

	public logQueryError(error: string, query: string, parameters?: any[]) {
		sqlLogger.error(this.highlight(query));
	}

	public logQuerySlow(time: number, query: string, parameters?: any[]) {
		sqlLogger.warn(this.highlight(query));
	}

	public logSchemaBuild(message: string) {
		sqlLogger.info(message);
	}

	public log(message: string) {
		sqlLogger.info(message);
	}

	public logMigration(message: string) {
		sqlLogger.info(message);
	}
}

export const entities = [
	Meta,
	Instance,
	User,
	UserProfile,
	UserKeypair,
	UserPublickey,
	UserList,
	UserListJoining,
	UserNotePining,
	UsedUsername,
	Following,
	FollowRequest,
	Blocking,
	Muting,
	Note,
	NoteFavorite,
	NoteReaction,
	NoteUnread,
	DriveFile,
	DriveFolder,
	Poll,
	PollVote,
	Notification,
	Emoji,
	Hashtag,
	SwSubscription,
	...charts as any
];

export function initDb(justBorrow = false, sync = false, log = false) {
	try {
		const conn = getConnection();
		return Promise.resolve(conn);
	} catch (e) {}

	return createConnection({
		type: 'postgres',
		host: config.db.host,
		port: config.db.port,
		username: config.db.user,
		password: config.db.pass,
		database: config.db.db,
		extra: config.db.extra,
		synchronize: process.env.NODE_ENV === 'test' || sync,
		dropSchema: process.env.NODE_ENV === 'test' && !justBorrow,
		cache: !config.db.disableCache ? {
			type: 'redis',
			options: {
				host: config.redis.host,
				port: config.redis.port,
				password: config.redis.pass,
				prefix: config.redis.prefix,
				db: config.redis.db || 0
			}
		} : false,
		logging: log,
		logger: log ? new MyCustomLogger() : undefined,
		entities: entities
	});
}
