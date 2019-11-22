<template>
<div class="dp-app-ui" v-hotkey.global="keymap">
	<transition name="zoom-in-bottom">
		<nav v-if="navOpen" ref="nav">
			<template v-if="showAccounts">
				<button class="_button" v-for="account in accounts" :key="account.id" @click="switchAccount(account)"><dp-avatar :user="account" class="avatar"/><dp-user-name :user="account"/></button>
				<div v-if="accounts.length > 0"></div>
				<button class="_button" @click="addAcount()"><fa :icon="faPlus" fixed-width/>{{ $t('addAcount') }}</button>
				<router-link :to="`/@${ $store.state.i.username }`"><dp-avatar :user="$store.state.i" class="avatar"/>{{ $t('profile') }}</router-link>
				<router-link to="/settings"><fa :icon="faUserCog" fixed-width/>{{ $t('settings') }}</router-link>
			</template>
			<template v-else-if="showLists">
				<span v-if="lists.length === 0" style="opacity: 0.5; pointer-events: none;">{{ $t('noLists') }}</span>
				<router-link v-for="list in lists" :to="`/lists/${ list.id }`" :key="list.id">{{ list.name }}</router-link>
				<div></div>
				<button class="_button" @click="createList()"><fa :icon="faPlus" fixed-width/>{{ $t('createList') }}</button>
				<router-link to="/manage-lists"><fa :icon="faCog" fixed-width/>{{ $t('manageLists') }}</router-link>
			</template>
			<template v-else-if="showInstance">
				<router-link to="/instance/stats"><fa :icon="faChartBar" fixed-width/>{{ $t('statistics') }}</router-link>
				<router-link to="/instance/emojis"><fa :icon="faLaugh" fixed-width/>{{ $t('customEmojis') }}</router-link>
				<router-link to="/instance/users"><fa :icon="faUsers" fixed-width/>{{ $t('users') }}</router-link>
				<router-link to="/instance/files"><fa :icon="faCloud" fixed-width/>{{ $t('files') }}</router-link>
				<router-link to="/instance/monitor"><fa :icon="faTachometerAlt" fixed-width/>{{ $t('monitor') }}</router-link>
				<router-link to="/instance/queue"><fa :icon="faExchangeAlt" fixed-width/>{{ $t('jobQueue') }}</router-link>
				<router-link to="/federation"><fa :icon="faGlobe" fixed-width/>{{ $t('federation') }}</router-link>
				<div></div>
				<router-link to="/instance"><fa :icon="faCog" fixed-width/>{{ $t('general') }}</router-link>
			</template>
			<template v-else>
				<button class="_button" @click="search()"><fa :icon="faSearch" fixed-width/>{{ $t('search') }}</button>
				<div></div>
				<button class="_button" @click="showLists = true"><fa :icon="faListUl" fixed-width/>{{ $t('lists') }}</button>
				<router-link to="/messages"><fa :icon="faEnvelope" fixed-width/>{{ $t('messages') }}<i v-if="$store.state.i.hasUnreadSpecifiedNotes"><fa :icon="faCircle"/></i></router-link>
				<router-link to="/favorites"><fa :icon="faStar" fixed-width/>{{ $t('favorites') }}</router-link>
				<router-link to="/follow-requests" v-if="$store.state.i.isLocked"><fa :icon="faUserClock" fixed-width/>{{ $t('followRequests') }}<i v-if="$store.state.i.pendingReceivedFollowRequestsCount"><fa :icon="faCircle"/></i></router-link>
				<div v-if="$store.state.i.isAdmin"></div>
				<button class="_button" v-if="$store.state.i.isAdmin" @click="showInstance = true"><fa :icon="faCog" fixed-width/>{{ $t('instance') }}</button>
				<div></div>
				<button class="_button" @click="showAccounts = true"><dp-avatar :user="$store.state.i" class="avatar"/><dp-user-name :user="$store.state.i"/></button>
			</template>
		</nav>
	</transition>
	<transition name="zoom-in-top">
		<x-notifications v-if="notificationsOpen" class="notifications"/>
	</transition>
	<div class="buttons">
		<button v-if="$store.getters.isSignedIn" class="button nav _button" @click="() => { navOpen = !navOpen; notificationsOpen = false; }" ref="navButton"><fa :icon="navOpen ? faTimes : faBars"/><i v-if="$store.state.i.hasUnreadSpecifiedNotes || $store.state.i.pendingReceivedFollowRequestsCount"><fa :icon="faCircle"/></i></button>
		<button v-if="$store.getters.isSignedIn" class="button home _button" :disabled="$route.path === '/'" @click="$router.push('/')"><fa :icon="faHome"/></button>
		<button v-if="$store.getters.isSignedIn" class="button notifications _button" @click="notificationsOpen = !notificationsOpen" ref="notificationsButton"><fa :icon="notificationsOpen ? faTimes : faBell"/><i v-if="$store.state.i.hasUnreadNotification"><fa :icon="faCircle"/></i></button>
		<button v-if="$store.getters.isSignedIn" class="button post _buttonPrimary" @click="post()"><fa :icon="faPencilAlt"/></button>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPencilAlt, faBars, faTimes, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faListUl, faPlus, faUserClock, faUsers, faTachometerAlt, faExchangeAlt, faGlobe, faChartBar, faCloud } from '@fortawesome/free-solid-svg-icons';
import { faBell, faEnvelope, faLaugh } from '@fortawesome/free-regular-svg-icons';
import i18n from './i18n';
import { search } from './scripts/search';
import DpToast from './components/toast.vue';

export default Vue.extend({
	i18n,

	components: {
		XNotifications: () => import('./components/notifications.vue').then(m => m.default),
	},

	data() {
		return {
			searching: false,
			navOpen: false,
			notificationsOpen: false,
			showLists: false,
			showAccounts: false,
			showInstance: false,
			accounts: [],
			lists: [],
			connection: null,
			faPencilAlt, faBars, faTimes, faBell, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faEnvelope, faListUl, faPlus, faUserClock, faLaugh, faUsers, faTachometerAlt, faExchangeAlt, faGlobe, faChartBar, faCloud
		};
	},

	computed: {
		keymap(): any {
			return {
				'p|n': this.post,
				's': this.search,
			};
		},
	},

	watch: {
		'$route'(to, from) {
			this.navOpen = false;
			this.notificationsOpen = false;
		},

		navOpen(opened) {
			this.showAccounts = false;
			this.showLists = false;
			this.showInstance = false;
		},

		async showAccounts() {
			if (this.showAccounts) {
				this.accounts = (await this.$root.api('users/show', { userIds: this.$store.state.device.accounts.map(x => x.id) })).filter(x => x.id !== this.$store.state.i.id);
			}
		},

		async showLists() {
			if (this.showLists) {
				this.lists = await this.$root.api('users/lists/list');
			}
		}
	},

	created() {
		if (this.$store.getters.isSignedIn) {
			this.connection = this.$root.stream.useSharedConnection('main');
			this.connection.on('notification', this.onNotification);
		}
	},

	methods: {
		post() {
			this.$root.post();
		},

		search() {
			this.navOpen = false;
			if (this.searching) return;

			this.$root.dialog({
				title: this.$t('search'),
				input: true
			}).then(async ({ canceled, result: query }) => {
				if (canceled || query == null || query == '') return;

				this.searching = true;
				search(this, query).finally(() => {
					this.searching = false;
				});
			});
		},

		async addAcount() {
			this.navOpen = false;

			const { canceled: canceled1, result: username } = await this.$root.dialog({
				title: this.$t('username'),
				input: true
			});
			if (canceled1) return;

			const { canceled: canceled2, result: password } = await this.$root.dialog({
				title: this.$t('password'),
				input: { type: 'password' }
			});
			if (canceled2) return;

			this.$root.api('signin', {
				username: username,
				password: password,
			}).then(res => {
				this.$root.dialog({
					type: 'success',
					splash: true
				});
				this.$store.commit('device/set', {
					key: 'accounts',
					value: this.$store.state.device.accounts.concat([{ id: res.id, token: res.token }])
				});
			}).catch(() => {
				this.$root.dialog({
					type: 'error',
					text: this.$t('loginFailed')
				});
			});
		},

		async switchAccount(account) {
			this.navOpen = false;
			const token = this.$store.state.device.accounts.find(x => x.id === account.id).token;
			this.$root.api('i', {}, token).then(i => {
				this.$store.dispatch('switchAccount', {
					...i,
					token: token
				});
				location.reload();
			});
		},

		async createList() {
			this.navOpen = false;
			const { canceled, result: name } = await this.$root.dialog({
				title: this.$t('enterListName'),
				input: true
			});
			if (canceled) return;
			await this.$root.api('users/lists/create', { name: name });
			this.$root.dialog({
				type: 'success',
				splash: true
			});
		},

		onNotification(notification) {
			// TODO: ユーザーが画面を見てないと思われるとき(ブラウザやタブがアクティブじゃないなど)は送信しない
			this.$root.stream.send('readNotification', {
				id: notification.id
			});

			this.$root.new(DpToast, {
				notification
			});
		},
	}
});
</script>

<style lang="scss" scoped>
@import './theme';

@keyframes blink {
	0% { opacity: 1; }
	30% { opacity: 1; }
	90% { opacity: 0; }
}

.dp-app-ui {
	> nav {
		position: fixed;
		bottom: 96px + 16px;
		left: 32px;
		z-index: 10001;
		padding: 8px 0;
		background: var(--bg);
		border-radius: 4px;
		box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);

		@media (max-width: 500px) {
			bottom: 92px;
			left: 16px;
		}

		> div {
			height: 1px;
			width: 100%;
			margin: 8px 0;
			background: var(--divider);
		}

		> *:not(div) {
			display: block;
			position: relative;
			padding: 8px 22px 8px 16px;
			width: 100%;
			box-sizing: border-box;
			white-space: nowrap;
			color: var(--fg);
			text-align: left;
			font-size: 14px;
			line-height: 20px;

			&:hover {
				color: #fff;
				background: $primary;
				text-decoration: none;
			}

			&:active {
				color: #fff;
				background: darken($primary, 10);
			}

			> .avatar {
				margin-right: 4px;
				width: 20px;
				height: 20px;
			}

			> [data-icon] {
				margin-right: 4px;
				width: 20px;
			}

			> i {
				position: absolute;
				top: 5px;
				left: 13px;
				color: $primary;
				font-size: 12px;
				animation: blink 1s infinite;
			}
		}
	}

	> .notifications {
		position: fixed;
		top: 32px;
		right: 7rem;
		margin: 0 auto;
		z-index: 10001;
		width: 290px;
		height: 305px;
		
		@media (max-width: 849px) {
			left: 0;
			right: 0;
		}

		@media (max-width: 849px) and (orientation: landscape) {
			height: 230px;
		}
	}

	> .buttons {
		position: fixed;
		z-index: 1000;
		bottom: 0;
		padding: 0 32px 32px 32px;
		display: flex;
		width: 100%;
		box-sizing: border-box;
		background: linear-gradient(0deg, $lightHtml, rgba($lightHtml, 0));

		@media (prefers-color-scheme: dark) {
			background: linear-gradient(0deg, $darkHtml, rgba($darkHtml, 0));
		}

		@media (max-width: 500px) {
			padding: 0 16px 16px 16px;
		}

		@media (min-width: 850px) {
			bottom: initial;
			right: 0;
			top: 0;
			flex-direction: column-reverse;
			width: initial;
			padding: 32px 32px 32px 0;
			background: none;
		}

		> .button {
			position: relative;
			padding: 0;
			margin: auto;
			width: 64px;
			height: 64px;
			border-radius: 100%;
			box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);

			&:first-child {
				margin-left: 0;
			}

			&:last-child {
				margin-right: 0;
			}

			@media (min-width: 850px) {
				margin: 16px 0;

				&:first-child {
					margin-bottom: 0;
				}

				&:last-child {
					margin-top: 0;
				}

				&.nav {
					position: fixed;
					bottom: 32px;
					left: 32px;
				}
			}

			> * {
				font-size: 22px;
			}

			&:disabled {
				cursor: default;

				> * {
					opacity: 0.5;
				}
			}

			&:not(.post) {
				background: var(--bg);
				color: var(--fg);

				&:hover {
					background: #eee;

					@media (prefers-color-scheme: dark) {
						background: #1c1e1f;
					}
				}

				> i {
					position: absolute;
					top: 0;
					left: 0;
					color: $primary;
					font-size: 16px;
					animation: blink 1s infinite;
				}
			}
		}
	}
}
</style>
