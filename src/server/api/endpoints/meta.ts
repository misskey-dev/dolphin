import $ from 'cafy';
import * as os from 'os';
import config from '../../../config';
import define from '../define';
import { fetchMeta } from '../../../misc/fetch-meta';
import * as pkg from '../../../../package.json';
import { Emojis, Users } from '../../../models';
import { getConnection } from 'typeorm';
import redis from '../../../db/redis';

export const meta = {
	stability: 'stable',

	desc: {
		'ja-JP': 'インスタンス情報を取得します。',
		'en-US': 'Get the information of this instance.'
	},

	tags: ['meta'],

	requireCredential: false,

	params: {
		detail: {
			validator: $.optional.bool,
			default: true
		}
	},

	res: {
		type: 'object' as const,
		optional: false as const, nullable: false as const,
		properties: {
			version: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
				description: 'The version of Dolphin of this instance.',
				example: pkg.version
			},
			name: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
				description: 'The name of this instance.',
			},
			description: {
				type: 'string' as const,
				optional: false as const, nullable: false as const,
				description: 'The description of this instance.',
			},
		}
	}
};

export default define(meta, async (ps, me) => {
	const instance = await fetchMeta(true);

	const emojis = await Emojis.find({ where: { host: null }, cache: { id: 'meta_emojis', milliseconds: 3600000 } }); // 1 hour

	const response: any = {
		maintainerName: config.maintainerName,
		maintainerEmail: config.maintainerEmail,

		version: pkg.version,

		name: config.name,
		uri: config.url,
		description: instance.description,

		secure: config.https != null,
		machine: os.hostname(),
		os: os.platform(),
		node: process.version,
		psql: await getConnection().query('SHOW server_version').then(x => x[0].server_version),
		redis: redis.server_info.redis_version,

		cpu: {
			model: os.cpus()[0].model,
			cores: os.cpus().length
		},

		driveCapacityPerRemoteUserMb: instance.remoteDriveCapacityMb,
		cacheRemoteFiles: instance.cacheRemoteFiles,
		recaptchaSiteKey: config.recaptchaSiteKey,
		swPublickey: config.swPublicKey,
		emojis: emojis.map(e => ({
			id: e.id,
			aliases: e.aliases,
			name: e.name,
			url: e.url,
		})),
		requireSetup: (await Users.count({})) === 0
	};

	if (ps.detail) {
		response.features = {
			elasticsearch: false,
			recaptcha: config.recaptchaSiteKey && config.recaptchaSecretKey,
			objectStorage: config.drive.storage !== 'fs',
			serviceWorker: config.swPublicKey && config.swPrivateKey,
		};
	}

	if (me) {
		response.blockedHosts = instance.blockedHosts;
		response.proxyAccount = instance.proxyAccount;
	}

	return response;
});
