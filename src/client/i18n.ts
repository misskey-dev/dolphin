import { lang, locale } from './config';

export default function(scope?: string) {
	const texts = scope ? locale[scope] || locale : locale;
	return {
		sync: false,
		locale: lang,
		messages: {
			[lang]: texts
		}
	};
}
