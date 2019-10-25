import $ from 'cafy';
import define from '../../define';
import { genId } from '../../../../misc/gen-id';
import { SwSubscriptions } from '../../../../models';
import config from '../../../../config';

export const meta = {
	tags: ['account'],

	requireCredential: true,

	params: {
		endpoint: {
			validator: $.str
		},

		auth: {
			validator: $.str
		},

		publickey: {
			validator: $.str
		}
	}
};

export default define(meta, async (ps, user) => {
	// if already subscribed
	const exist = await SwSubscriptions.findOne({
		userId: user.id,
		endpoint: ps.endpoint,
		auth: ps.auth,
		publickey: ps.publickey,
	});

	if (exist != null) {
		return {
			state: 'already-subscribed',
			key: config.swPublicKey
		};
	}

	await SwSubscriptions.save({
		id: genId(),
		createdAt: new Date(),
		userId: user.id,
		endpoint: ps.endpoint,
		auth: ps.auth,
		publickey: ps.publickey
	});

	return {
		state: 'subscribed',
		key: config.swPublicKey
	};
});
