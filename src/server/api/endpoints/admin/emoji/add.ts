import $ from 'cafy';
import define from '../../../define';
import create from '../../../../../services/drive/add-file';
import { Emojis } from '../../../../../models';
import { genId } from '../../../../../misc/gen-id';
import { getConnection } from 'typeorm';
import { ApiError } from '../../../error';
import { DriveFile } from '../../../../../models/entities/drive-file';

export const meta = {
	desc: {
		'ja-JP': 'カスタム絵文字を追加します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
	requireFile: true,

	params: {
		name: {
			validator: $.str.min(1)
		},

		aliases: {
			validator: $.optional.arr($.str.min(1)),
			default: [] as string[]
		}
	},

	errors: {
		emojiAlredyExists: {
			message: 'Emoji already exists.',
			code: 'EMOJI_ALREADY_EXISTS',
			id: 'fc46b5a4-6b92-4c33-ac66-b806659bb5cf'
		}
	}
};

export default define(meta, async (ps, me, file, cleanup) => {
	const exists = await Emojis.findOne({
		name: ps.name,
		host: null
	});

	if (exists != null) throw new ApiError(meta.errors.emojiAlredyExists);

	let driveFile: DriveFile;

	try {
		// Create file
		driveFile = await create(null, file.path, ps.name, null, null, true, false, null, null, false);
	} catch (e) {
		throw new ApiError(e);
	} finally {
		cleanup!();
	}

	const emoji = await Emojis.save({
		id: genId(),
		updatedAt: new Date(),
		name: ps.name,
		host: null,
		aliases: ps.aliases,
		url: driveFile.url,
		type: driveFile.type,
		fileId: driveFile.id,
	});

	await getConnection().queryResultCache!.remove(['meta_emojis']);

	return {
		id: emoji.id
	};
});
