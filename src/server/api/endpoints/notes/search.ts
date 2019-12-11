import $ from 'cafy';
import define from '../../define';
import { Notes } from '../../../../models';
import { ID } from '../../../../misc/cafy-id';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { generateVisibilityQuery } from '../../common/generate-visibility-query';
import { generateMuteQuery } from '../../common/generate-mute-query';

export const meta = {
	desc: {
		'ja-JP': '投稿を検索します。',
		'en-US': 'Search notes.'
	},

	tags: ['notes'],

	requireCredential: false,

	params: {
		query: {
			validator: $.str
		},

		sinceId: {
			validator: $.optional.type(ID),
			desc: {
				'ja-JP': '指定すると、その投稿を基点としてより新しい投稿を取得します'
			}
		},

		untilId: {
			validator: $.optional.type(ID),
			desc: {
				'ja-JP': '指定すると、その投稿を基点としてより古い投稿を取得します'
			}
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		host: {
			validator: $.optional.nullable.str,
			default: undefined
		},

		userId: {
			validator: $.optional.nullable.type(ID),
			default: null
		},
	},

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'Note',
		}
	},
};

export default define(meta, async (ps, me) => {
	const query = makePaginationQuery(Notes.createQueryBuilder('note'), ps.sinceId, ps.untilId)
		.andWhere('note.text ILIKE :q', { q: `%${ps.query}%` })
		.leftJoinAndSelect('note.user', 'user');

	generateVisibilityQuery(query, me);
	if (me) generateMuteQuery(query, me);

	const notes = await query.take(ps.limit!).getMany();

	return await Notes.packMany(notes, me);
});
