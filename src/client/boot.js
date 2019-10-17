/**
 * MISSKEY BOOT LOADER
 * (ENTRY POINT)
 */

'use strict';

(async function() {
	const langs = LANGS;

	//#region Load settings
	let settings = null;
	const vuex = localStorage.getItem('vuex');
	if (vuex) {
		settings = JSON.parse(vuex);
	}
	//#endregion

	// Script version
	const ver = localStorage.getItem('v') || VERSION;

	//#region Detect the user language
	let lang = null;

	if (langs.includes(navigator.language)) {
		lang = navigator.language;
	} else {
		lang = langs.find(x => x.split('-')[0] == navigator.language);

		if (lang == null) {
			// Fallback
			lang = 'en-US';
		}
	}

	if (settings && settings.device.lang &&
		langs.includes(settings.device.lang))
	{
		lang = settings.device.lang;
	}

	localStorage.setItem('lang', lang);
	//#endregion

	//#region Fetch locale data
	const cachedLocale = localStorage.getItem('locale');
	const localeKey = localStorage.getItem('localeKey');

	if (cachedLocale == null || localeKey != `${ver}.${lang}`) {
		const locale = await fetch(`/assets/locales/${lang}.json?ver=${ver}`)
			.then(response => response.json());

		localStorage.setItem('locale', JSON.stringify(locale));
		localStorage.setItem('localeKey', `${ver}.${lang}`);
	}
	//#endregion

	// Detect the user agent
	const ua = navigator.userAgent.toLowerCase();
	let isMobile = /mobile|iphone|ipad|android/.test(ua) || window.innerWidth < 576;
	if (settings && settings.device.appTypeForce) {
		if (settings.device.appTypeForce === 'mobile') {
			isMobile = true;
		} else if (settings.device.appTypeForce === 'desktop') {
			isMobile = false;
		}
	}

	// Get the <head> element
	const head = document.getElementsByTagName('head')[0];

	// If mobile, insert the viewport meta tag
	if (isMobile) {
		const viewport = document.getElementsByName("viewport").item(0);
		viewport.setAttribute('content',
			`${viewport.getAttribute('content')},minimum-scale=1,maximum-scale=1,user-scalable=no`);
		head.appendChild(viewport);
	}

	// Load an app script
	// Note: 'async' make it possible to load the script asyncly.
	//       'defer' make it possible to run the script when the dom loaded.
	const script = document.createElement('script');
	script.setAttribute('src', '/assets/app.js');
	script.setAttribute('async', 'true');
	script.setAttribute('defer', 'true');
	head.appendChild(script);
})();
