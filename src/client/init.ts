/**
 * App initializer
 */

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import VAnimateCss from 'v-animate-css';
import VModal from 'vue-js-modal';
import VueI18n from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import VueHotkey from './scripts/hotkey';
import VueSize from './scripts/size';
import App from './app.vue';
import MiOS from './mios';
import { version, lang } from './config';
import PostFormDialog from './components/post-form-dialog.vue';
import Dialog from './components/dialog.vue';
import DpIndex from './pages/index.vue';
import i18n from './i18n';
import SequentialEntrance from './components/sequential-entrance';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VAnimateCss);
Vue.use(VModal);
Vue.use(VueHotkey);
Vue.use(VueSize);
Vue.use(VueI18n);
Vue.component('sequential-entrance', SequentialEntrance);
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

/**
 * APP ENTRY POINT!
 */

console.info(`Dolphin v${version}`);

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
			{ path: 'following', component: () => import('./pages/user/following.vue').then(m => m.default) },
			{ path: 'followers', component: () => import('./pages/user/followers.vue').then(m => m.default) },
		]},
		{ path: '/instance', component: () => import('./pages/instance.vue').then(m => m.default) },
		//{ path: '/notifications', component: () => import('./pages/notifications.vue').then(m => m.default) },
		{ path: '/notes/:note', component: () => import('./pages/note.vue').then(m => m.default) },/*
		{ path: '/authorize-follow', component: DpFollow },
		{ path: '*', component: DpNotFound }*/
	]
});

const os = new MiOS();

os.init(() => {
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
		i18n: i18n(),
		store: os.store,
		data() {
			return {
				stream: os.stream,
				instanceName: os.instanceName,
				isMobile: false
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

				document.documentElement.style.overflow = 'hidden';

				function recover() {
					document.documentElement.style.overflow = 'auto';
				}

				const vm = this.new(PostFormDialog, {
					reply: o.reply,
					mention: o.mention,
					renote: o.renote,
					initialText: o.initialText,
					instant: o.instant,
					initialNote: o.initialNote,
				});
				vm.$once('cancel', recover);
				vm.$once('posted', recover);
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
