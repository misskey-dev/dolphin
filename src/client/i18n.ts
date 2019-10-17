import { lang, locale } from './config';

export default function(scope?: string) {
	const texts = scope ? locale[scope] || {} : {};
	return {
		sync: false,
		locale: lang,
		messages: {
			[lang]: texts
		}
	};
}
