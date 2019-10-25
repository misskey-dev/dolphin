import $ from 'cafy';
import define from '../../define';
import { getConnection } from 'typeorm';
import { Meta } from '../../../../models/entities/meta';

export const meta = {
	desc: {
		'ja-JP': 'インスタンスの設定を更新します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		pinnedUsers: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': 'ピン留めユーザー'
			}
		},

		hiddenTags: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': '統計などで無視するハッシュタグ'
			}
		},

		blockedHosts: {
			validator: $.optional.nullable.arr($.str),
			desc: {
				'ja-JP': 'ブロックするホスト'
			}
		},

		mascotImageUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスキャラクター画像のURL'
			}
		},

		bannerUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのバナー画像URL'
			}
		},

		errorImageUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのエラー画像URL'
			}
		},

		iconUrl: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスのアイコンURL'
			}
		},

		description: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'インスタンスの紹介文'
			}
		},

		remoteDriveCapacityMb: {
			validator: $.optional.num.min(0),
			desc: {
				'ja-JP': 'リモートユーザーひとりあたりのドライブ容量 (メガバイト単位)',
				'en-US': 'Drive capacity of a remote user (MB)'
			}
		},

		cacheRemoteFiles: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'リモートのファイルをキャッシュするか否か'
			}
		},

		proxyAccount: {
			validator: $.optional.nullable.str,
			desc: {
				'ja-JP': 'プロキシアカウントのユーザー名'
			}
		},
	}
};

export default define(meta, async (ps, me) => {
	const set = {} as Partial<Meta>;

	if (Array.isArray(ps.blockedHosts)) {
		set.blockedHosts = ps.blockedHosts.filter(Boolean);
	}

	if (ps.description !== undefined) {
		set.description = ps.description;
	}

	if (ps.remoteDriveCapacityMb !== undefined) {
		set.remoteDriveCapacityMb = ps.remoteDriveCapacityMb;
	}

	if (ps.cacheRemoteFiles !== undefined) {
		set.cacheRemoteFiles = ps.cacheRemoteFiles;
	}

	if (ps.proxyAccount !== undefined) {
		set.proxyAccount = ps.proxyAccount;
	}

	await getConnection().transaction(async transactionalEntityManager => {
		const meta = await transactionalEntityManager.findOne(Meta, {
			order: {
				id: 'DESC'
			}
		});

		if (meta) {
			await transactionalEntityManager.update(Meta, meta.id, set);
		} else {
			await transactionalEntityManager.save(Meta, set);
		}
	});
});
