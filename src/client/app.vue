<template>
<div class="dp-app">
	<main>
		<router-view v-hotkey.global="keymap"></router-view>
		<div class="powerd-by" :style="{ visibility: $store.getters.isSignedIn ? 'hidden' : 'visible' }">
			<span>Powered by</span>
			<x-logo class="logo"/>
		</div>
	</main>
	<transition name="zoom-in-bottom">
		<nav v-if="navOpen" ref="nav">
			<router-link to="/"><fa :icon="faHome" fixed-width/>{{ $t('timeline') }}</router-link>
			<router-link :to="`/@${ $store.state.i.username }`"><fa :icon="faUser" fixed-width/>{{ $t('profile') }}</router-link>
			<router-link to="/messages"><fa :icon="faEnvelope" fixed-width/>{{ $t('messages') }}<i v-if="$store.state.i.hasUnreadSpecifiedNotes"><fa :icon="faCircle"/></i></router-link>
			<router-link to="/favorites"><fa :icon="faStar" fixed-width/>{{ $t('favorites') }}</router-link>
			<router-link to="/settings"><fa :icon="faUserCog" fixed-width/>{{ $t('settings') }}</router-link>
			<router-link to="/instance"><fa :icon="faCog" fixed-width/>{{ $t('instance') }}</router-link>
			<div></div>
			<button class="_buttonPlain" @click="search()"><fa :icon="faSearch" fixed-width/>{{ $t('search') }}</button>
		</nav>
	</transition>
	<transition name="zoom-in-bottom">
		<x-notifications v-if="notificationsOpen" class="notifications"/>
	</transition>
	<button v-if="$store.getters.isSignedIn" class="button nav _buttonPlain" @click="navOpen = !navOpen" ref="navButton"><fa :icon="navOpen ? faTimes : faBars"/><i v-if="$store.state.i.hasUnreadSpecifiedNotes"><fa :icon="faCircle"/></i></button>
	<button v-if="$store.getters.isSignedIn" class="button notifications _buttonPlain" @click="notificationsOpen = !notificationsOpen" ref="notificationsButton"><fa :icon="notificationsOpen ? faTimes : faBell"/><i v-if="$store.state.i.hasUnreadNotification"><fa :icon="faCircle"/></i></button>
	<button v-if="$store.getters.isSignedIn" class="button post _buttonPrimary" @click="post()"><fa :icon="faPencilAlt"/></button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPencilAlt, faBars, faTimes, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt } from '@fortawesome/free-solid-svg-icons';
import { faBell, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import i18n from './i18n';
import { search } from './scripts/search';
import contains from './scripts/contains';
import DpToast from './components/toast.vue';

export default Vue.extend({
	i18n,

	components: {
		XNotifications: () => import('./components/notifications.vue').then(m => m.default),
		XLogo: () => import('./components/logo.vue').then(m => m.default),
	},

	data() {
		return {
			searching: false,
			navOpen: false,
			notificationsOpen: false,
			connection: null,
			faPencilAlt, faBars, faTimes, faBell, faSearch, faUserCog, faCog, faUser, faHome, faStar, faCircle, faAt, faEnvelope
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
			const onMousedown = e => {
				e.preventDefault();
				if (
					!contains(this.$refs.nav, e.target) && (this.$refs.nav != e.target) &&
					!contains(this.$refs.navButton, e.target) && (this.$refs.navButton != e.target)
				) this.navOpen = false;
				return false;
			};
			if (opened) {
				for (const el of Array.from(document.querySelectorAll('body *'))) {
					el.addEventListener('mousedown', onMousedown);
				}
			} else {
				for (const el of Array.from(document.querySelectorAll('body *'))) {
					el.removeEventListener('mousedown', onMousedown);
				}
			}
		},
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
				if (canceled) return;

				this.searching = true;
				search(this, query).finally(() => {
					this.searching = false;
				});
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

.dp-app {
	> main {
		max-width: 650px;
		margin: 0 auto;
		padding: 32px;
		box-sizing: border-box;

		@media (max-width: 700px) {
			padding: 16px;
		}

		@media (max-width: 500px) {
			padding: 8px;
		}

		> .powerd-by {
			color: #fff;
			font-size: 14px;
			text-align: center;
			opacity: 0.7;
			margin-top: 16px;
			transition: opacity 1s ease;

			@media (max-width: 500px) {
				margin-top: 8px;
			}

			> .logo {
				display: block;
				width: 50px;
				margin: 8px auto 0 auto;
			}
		}
	}

	> nav {
		position: fixed;
		bottom: 96px + 16px;
		left: 32px;
		z-index: 10001;
		padding: 8px 0;
		background: #fff;
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
			background: rgba(0, 0, 0, 0.1);
		}

		> *:not(div) {
			display: block;
			position: relative;
			padding: 8px 22px 8px 16px;
			width: 100%;
			box-sizing: border-box;
			white-space: nowrap;
			color: $text;
			text-align: left;
			font-size: 14px;

			&:hover {
				color: #fff;
				background: $primary;
				text-decoration: none;
			}

			&:active {
				color: #fff;
				background: darken($primary, 10);
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
		bottom: 96px + 16px;
		left: 0;
		right: 0;
		margin: 0 auto;
		z-index: 10001;
		width: 280px;
		height: 300px;

		@media (max-width: 500px) {
			bottom: 92px;
		}
	}

	> .button {
		position: fixed;
		z-index: 1000;
		bottom: 32px;
		padding: 0;
		width: 64px;
		height: 64px;
		border-radius: 100%;
		box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);

		> * {
			font-size: 24px;
		}

		&:focus {
			outline: none;
		}

		&.nav, &.notifications {
			background: #fff;
			color: $text;

			&:hover {
				background: #eee;
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

		&.nav {
			left: 32px;
		}

		&.notifications {
			left: 0;
			right: 0;
			margin: 0 auto;
		}

		&.post {
			right: 32px;
		}

		@media (max-width: 500px) {
			bottom: 16px;

			&.nav {
				left: 16px;
			}

			&.post {
				right: 16px;
			}
		}
	}
}
</style>
