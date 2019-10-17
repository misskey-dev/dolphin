import * as bcrypt from 'bcryptjs';
import { generateKeyPair } from 'crypto';
import generateUserToken from '../../../common/generate-native-user-token';
import define from '../../../define';
import { Users, UsedUsernames } from '../../../../../models';
import { getConnection } from 'typeorm';
import { User } from '../../../../../models/entities/user';
import { genId } from '../../../../../misc/gen-id';
import { UserKeypair } from '../../../../../models/entities/user-keypair';
import { UserProfile } from '../../../../../models/entities/user-profile';
import { UsedUsername } from '../../../../../models/entities/used-username';
import { usersChart } from '../../../../../services/chart';

export const meta = {
	tags: ['admin'],

	params: {
		username: {
			validator: Users.validateLocalUsername,
		},

		password: {
			validator: Users.validatePassword,
		}
	}
};

export default define(meta, async (ps, me) => {
	if ((await Users.count({})) > 0 && me == null) throw new Error('access denied');

	// Generate hash of password
	const salt = await bcrypt.genSalt(8);
	const hash = await bcrypt.hash(ps.password, salt);

	// Generate secret
	const secret = generateUserToken();

	// Check username duplication
	if (await Users.findOne({ usernameLower: ps.username.toLowerCase(), host: null })) {
		throw new Error('duplicated username');
	}

	// Check deleted username duplication
	if (await UsedUsernames.findOne({ username: ps.username.toLowerCase() })) {
		throw new Error('duplicated username');
	}

	const keyPair = await new Promise<string[]>((s, j) =>
		generateKeyPair('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs1',
				format: 'pem',
				cipher: undefined,
				passphrase: undefined
			}
		} as any, (e, publicKey, privateKey) =>
			e ? j(e) : s([publicKey, privateKey])
		));

	let account!: User;

	// Start transaction
	await getConnection().transaction(async transactionalEntityManager => {
		const exist = await transactionalEntityManager.findOne(User, {
			usernameLower: ps.username.toLowerCase(),
			host: null
		});

		if (exist) throw new Error(' the username is already used');

		account = await transactionalEntityManager.save(new User({
			id: genId(),
			createdAt: new Date(),
			username: ps.username,
			usernameLower: ps.username.toLowerCase(),
			host: null,
			token: secret,
		}));

		await transactionalEntityManager.save(new UserKeypair({
			publicKey: keyPair[0],
			privateKey: keyPair[1],
			userId: account.id
		}));

		await transactionalEntityManager.save(new UserProfile({
			userId: account.id,
			autoAcceptFollowed: true,
			password: hash,
		}));

		await transactionalEntityManager.save(new UsedUsername({
			createdAt: new Date(),
			username: ps.username.toLowerCase(),
		}));
	});

	usersChart.update(account, true);

	const res = await Users.pack(account, account, {
		detail: true,
		includeSecrets: true
	});

	(res as any).token = secret;

	return res;
});
