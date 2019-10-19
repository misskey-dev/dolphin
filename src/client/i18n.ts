import { lang, locale } from './config';

export default {
	sync: false,
	locale: lang,
	messages: {
		[lang]: locale
	}
};
