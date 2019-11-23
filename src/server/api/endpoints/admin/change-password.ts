import $ from 'cafy';
import { ID } from '../../../../misc/cafy-id';
import define from '../../define';
import * as bcrypt from 'bcryptjs';
import { Users, UserProfiles } from '../../../../models';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		userId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '対象のユーザーID',
				'en-US': 'The user ID which you want to suspend'
			}
		},

		newPassword: {
			validator: $.str
		}
	}
};

export default define(meta, async (ps) => {
	const user = await Users.findOne(ps.userId as string);

	if (user == null) {
		throw new Error('user not found');
	}

	// Generate hash of password
	const salt = await bcrypt.genSalt(8);
	const hash = await bcrypt.hash(ps.newPassword, salt);

	await UserProfiles.update({ userId: user.id }, {
		password: hash
	});
});
