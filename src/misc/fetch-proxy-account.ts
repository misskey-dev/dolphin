import { fetchMeta } from './fetch-meta';
import { ILocalUser } from '../models/entities/user';
import { Users } from '../models';

export async function fetchProxyAccount(): Promise<ILocalUser | null> {
	const meta = await fetchMeta();
	return ((await Users.findOne({ username: meta.proxyAccount!, host: null })) || null) as ILocalUser | null;
}
