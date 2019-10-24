import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import * as nestedProperty from 'nested-property';

import MiOS from './mios';
import getNoteSummary from '../misc/get-note-summary';

const defaultSettings = {
	keepCw: false,
	contrastedAcct: true,
	showFullAcct: false,
	rememberNoteVisibility: false,
	defaultNoteVisibility: 'public',
	uploadFolder: null,
	pastedFileName: 'yyyy-MM-dd HH-mm-ss [{{number}}]',
	pasteDialog: false,
	reactions: ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮']
};

const defaultDeviceSettings = {
	lang: null,
	loadRawImages: false,
	alwaysShowNsfw: false,
	useOsDefaultEmojis: false,
};

export default (os: MiOS) => new Vuex.Store({
	plugins: [createPersistedState({
		paths: ['i', 'device', 'settings']
	})],

	state: {
		i: null,
		indicate: false,
		uiHeaderHeight: 0,
		behindNotes: []
	},

	getters: {
		isSignedIn: state => state.i != null,
	},

	mutations: {
		updateI(state, x) {
			state.i = x;
		},

		updateIKeyValue(state, x) {
			state.i[x.key] = x.value;
		},

		indicate(state, x) {
			state.indicate = x;
		},

		setUiHeaderHeight(state, height) {
			state.uiHeaderHeight = height;
		},

		pushBehindNote(state, note) {
			if (note.userId === state.i.id) return;
			if (state.behindNotes.some(n => n.id === note.id)) return;
			state.behindNotes.push(note);
			document.title = `(${state.behindNotes.length}) ${getNoteSummary(note)}`;
		},

		clearBehindNotes(state) {
			state.behindNotes = [];
			document.title = os.instanceName;
		},
	},

	actions: {
		login(ctx, i) {
			ctx.commit('updateI', i);
			ctx.dispatch('settings/merge', i.clientData);
		},

		logout(ctx) {
			ctx.commit('updateI', null);
			document.cookie = `i=; max-age=0; domain=${document.location.hostname}`;
			localStorage.removeItem('i');
		},

		mergeMe(ctx, me) {
			for (const [key, value] of Object.entries(me)) {
				ctx.commit('updateIKeyValue', { key, value });
			}

			if (me.clientData) {
				ctx.dispatch('settings/merge', me.clientData);
			}
		},
	},

	modules: {
		device: {
			namespaced: true,

			state: defaultDeviceSettings,

			mutations: {
				set(state, x: { key: string; value: any }) {
					state[x.key] = x.value;
				},

				setTl(state, x) {
					state.tl = {
						src: x.src,
						arg: x.arg
					};
				},

				setVisibility(state, visibility) {
					state.visibility = visibility;
				},
			}
		},

		settings: {
			namespaced: true,

			state: defaultSettings,

			mutations: {
				set(state, x: { key: string; value: any }) {
					nestedProperty.set(state, x.key, x.value);
				},
			},

			actions: {
				merge(ctx, settings) {
					if (settings == null) return;
					for (const [key, value] of Object.entries(settings)) {
						ctx.commit('set', { key, value });
					}
				},

				set(ctx, x) {
					ctx.commit('set', x);

					if (ctx.rootGetters.isSignedIn) {
						os.api('i/update-client-setting', {
							name: x.key,
							value: x.value
						});
					}
				},
			}
		}
	}
});
