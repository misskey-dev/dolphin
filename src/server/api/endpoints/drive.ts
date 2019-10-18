import define from '../define';
import { DriveFiles } from '../../../models';

export const meta = {
	desc: {
		'ja-JP': 'ドライブの情報を取得します。',
		'en-US': 'Get drive information.'
	},

	tags: ['drive', 'account'],

	requireCredential: true,

	kind: 'read:drive',

	res: {
		type: 'object' as const,
		optional: false as const, nullable: false as const,
		properties: {
			usage: {
				type: 'number' as const,
				optional: false as const, nullable: false as const,
			}
		}
	}
};

export default define(meta, async (ps, user) => {
	// Calculate drive usage
	const usage = await DriveFiles.clacDriveUsageOf(user);

	return {
		usage: usage
	};
});
