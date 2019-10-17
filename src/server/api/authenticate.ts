import { User } from '../../models/entities/user';
import { Users } from '../../models';

export default async (token: string): Promise<User | null | undefined> => {
	if (token == null) {
		return null;
	}

	// Fetch user
	const user = await Users
		.findOne({ token });

	if (user == null) {
		throw new Error('user not found');
	}

	return user;
};
