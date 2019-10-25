import * as push from 'web-push';
import config from '../config';
import { SwSubscriptions } from '../models';

export default async function(userId: string, type: string, body?: any) {
	if (config.swPublicKey == null || config.swPrivateKey == null) return;

	// アプリケーションの連絡先と、サーバーサイドの鍵ペアの情報を登録
	push.setVapidDetails(config.url,
		config.swPublicKey,
		config.swPrivateKey);

	// Fetch
	const subscriptions = await SwSubscriptions.find({
		userId: userId
	});

	for (const subscription of subscriptions) {
		const pushSubscription = {
			endpoint: subscription.endpoint,
			keys: {
				auth: subscription.auth,
				p256dh: subscription.publickey
			}
		};

		push.sendNotification(pushSubscription, JSON.stringify({
			type, body
		}), {
			proxy: config.proxy
		}).catch((err: any) => {
			//swLogger.info(err.statusCode);
			//swLogger.info(err.headers);
			//swLogger.info(err.body);

			if (err.statusCode == 410) {
				SwSubscriptions.delete({
					userId: userId,
					endpoint: subscription.endpoint,
					auth: subscription.auth,
					publickey: subscription.publickey
				});
			}
		});
	}
}
