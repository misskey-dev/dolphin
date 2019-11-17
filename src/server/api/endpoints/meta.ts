import $ from 'cafy';
import config from '../../../config';
import define from '../define';
import { fetchMeta } from '../../../misc/fetch-meta';
import * as pkg from '../../../../package.json';
import { Emojis, Users } from '../../../models';

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

	if (me) {
		response.blockedHosts = instance.blockedHosts;
		response.proxyAccount = instance.proxyAccount;
	}

	return response;
});
