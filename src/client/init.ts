/**
 * App entry point
 */

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VModal from 'vue-js-modal';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import i18n from './i18n';
import VueHotkey from './scripts/hotkey';
import VueSize from './scripts/size';
import App from './app.vue';
import MiOS from './mios';
import { version, langs } from './config';
import PostFormDialog from './components/post-form-dialog.vue';
import Dialog from './components/dialog.vue';
import DpIndex from './pages/index.vue';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VModal);
Vue.use(VueHotkey);
Vue.use(VueSize);
Vue.component('fa', FontAwesomeIcon);

// Register global directives
require('./directives');

// Register global components
require('./components');

// Register global filters
require('./filters');

Vue.mixin({
	methods: {
		destroyDom() {
			this.$destroy();

			if (this.$el.parentNode) {
				this.$el.parentNode.removeChild(this.$el);
			}
		}
	}
});

console.info(`Dolphin v${version}`);

//#region Detect the user language
let lang = null;

if (langs.map(x => x[0]).includes(navigator.language)) {
	lang = navigator.language;
} else {
	lang = langs.map(x => x[0]).find(x => x.split('-')[0] == navigator.language);

	if (lang == null) {
		// Fallback
		lang = 'en-US';
	}
}

localStorage.setItem('lang', lang);
//#endregion

// Detect the user agent
const ua = navigator.userAgent.toLowerCase();
let isMobile = /mobile|iphone|ipad|android/.test(ua) || window.innerWidth < 576;

// Get the <head> element
const head = document.getElementsByTagName('head')[0];

// If mobile, insert the viewport meta tag
if (isMobile) {
	const viewport = document.getElementsByName("viewport").item(0);
	viewport.setAttribute('content',
		`${viewport.getAttribute('content')},minimum-scale=1,maximum-scale=1,user-scalable=no`);
	head.appendChild(viewport);
}

//#region Fetch locale data
const cachedLocale = localStorage.getItem('locale');

if (cachedLocale == null) {
	fetch(`/assets/locales/${lang}.json`)
		.then(response => response.json()).then(locale => {
			localStorage.setItem('locale', JSON.stringify(locale));
			i18n.locale = lang;
			i18n.setLocaleMessage(lang, locale);
		});
} else {
	// TODO: 古い時だけ更新
	setTimeout(() => {
		fetch(`/assets/locales/${lang}.json`)
			.then(response => response.json()).then(locale => {
				localStorage.setItem('locale', JSON.stringify(locale));
			});
	}, 1000 * 5);
}
//#endregion

//#region Set lang attr
const html = document.documentElement;
html.setAttribute('lang', lang);
//#endregion

// iOSでプライベートモードだとlocalStorageが使えないので既存のメソッドを上書きする
try {
	localStorage.setItem('kyoppie', 'yuppie');
} catch (e) {
	Storage.prototype.setItem = () => { }; // noop
}

// http://qiita.com/junya/items/3ff380878f26ca447f85
document.body.setAttribute('ontouchstart', '');

// アプリ基底要素マウント
document.body.innerHTML = '<div id="app"></div>';

// Init router
const router = new VueRouter({
	mode: 'history',
	routes: [
		{ path: '/', name: 'index', component: DpIndex },
		{ path: '/@:user', name: 'user', component: () => import('./pages/user/index.vue').then(m => m.default), children: [
			{ path: 'following', name: 'userFollowing', component: () => import('./pages/user/follow-list.vue').then(m => m.default), props: { type: 'following' } },
			{ path: 'followers', name: 'userFollowers', component: () => import('./pages/user/follow-list.vue').then(m => m.default), props: { type: 'followers' } },
		]},
		{ path: '/favorites', component: () => import('./pages/favorites.vue').then(m => m.default) },
		{ path: '/messages', component: () => import('./pages/messages.vue').then(m => m.default) },
		{ path: '/settings', component: () => import('./pages/settings.vue').then(m => m.default) },
		{ path: '/instance', component: () => import('./pages/instance.vue').then(m => m.default) },
		{ path: '/follow-requests', component: () => import('./pages/follow-requests.vue').then(m => m.default) },
		{ path: '/manage-lists', component: () => import('./pages/manage-lists/index.vue').then(m => m.default) },
		{ path: '/manage-lists/:list', component: () => import('./pages/manage-lists/list.vue').then(m => m.default) },
		{ path: '/lists/:list', component: () => import('./pages/list.vue').then(m => m.default) },
		{ path: '/notes/:note', component: () => import('./pages/note.vue').then(m => m.default) },/*
		{ path: '/authorize-follow', component: DpFollow },
		{ path: '*', component: DpNotFound }*/
	]
});

const os = new MiOS();

os.init(async () => {
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) {
			os.store.commit('clearBehindNotes');
		}
	}, false);

	window.addEventListener('scroll', () => {
		if (window.scrollY <= 8) {
			os.store.commit('clearBehindNotes');
		}
	}, { passive: true });

	const app = new Vue({
		store: os.store,
		data() {
			return {
				stream: os.stream,
				instanceName: os.instanceName,
			};
		},
		methods: {
			api: os.api,
			getMeta: os.getMeta,
			getMetaSync: os.getMetaSync,
			signout: os.signout,
			new(vm, props) {
				const x = new vm({
					parent: this,
					propsData: props
				}).$mount();
				document.body.appendChild(x.$el);
				return x;
			},
			newAsync(vm, props) {
				return new Promise((res) => {
					vm().then(vm => {
						const x = new vm({
							parent: this,
							propsData: props
						}).$mount();
						document.body.appendChild(x.$el);
						res(x);
					});
				});
			},
			dialog(opts) {
				const vm = this.new(Dialog, opts);
				const p: any = new Promise((res) => {
					vm.$once('ok', result => res({ canceled: false, result }));
					vm.$once('cancel', () => res({ canceled: true }));
				});
				p.close = () => {
					vm.close();
				};
				return p;
			},
			post(opts) {
				const o = opts || {};
				const vm = this.new(PostFormDialog, {
					reply: o.reply,
					mention: o.mention,
					renote: o.renote,
					initialText: o.initialText,
					instant: o.instant,
					initialNote: o.initialNote,
				});
				if (o.cb) vm.$once('closed', o.cb);
				(vm as any).focus();
			},
		},
		router,
		render: createEl => createEl(App)
	});

	os.app = app;

	// マウント
	app.$mount('#app');
});
