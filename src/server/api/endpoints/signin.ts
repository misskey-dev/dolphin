import * as bcrypt from 'bcryptjs';
import define from '../define';
import { Users, UserProfiles } from '../../../models';
import { ILocalUser } from '../../../models/entities/user';
import { ensure } from '../../../prelude/ensure';

export const meta = {
	tags: ['account'],

	params: {
		username: {
			validator: Users.validateLocalUsername,
		},

		password: {
			validator: Users.validatePassword,
		}
	},
};

export default define(meta, async (ps) => {
	// Fetch user
	const user = await Users.findOne({
		usernameLower: ps.username.toLowerCase(),
		host: null
	}) as ILocalUser;

	if (user == null) {
		throw new Error('no such user');
	}

	const profile = await UserProfiles.findOne(user.id).then(ensure);

	// Compare password
	const same = await bcrypt.compare(ps.password, profile.password!);

	if (same) {
		return { token: user.token };
	} else {
		throw new Error('incorrect password');
	}
});
