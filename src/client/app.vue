<template>
<div class="dp-app">
	<main>
		<router-view v-hotkey.global="keymap"></router-view>
	</main>
	<transition name="zoom-in-bottom">
		<nav v-if="navOpen">
			<router-link to="/"><fa :icon="faHome" fixed-width/>{{ $t('timeline') }}</router-link>
			<router-link :to="`/@${ $store.state.i.username }`"><fa :icon="faUser" fixed-width/>{{ $t('profile') }}</router-link>
			<router-link to="/settings"><fa :icon="faUserCog" fixed-width/>{{ $t('settings') }}</router-link>
			<router-link to="/instance"><fa :icon="faCog" fixed-width/>{{ $t('instance') }}</router-link>
			<div></div>
			<button class="_buttonPlain" @click="() => { notificationsOpen = true; navOpen = false; }"><fa :icon="faBell" fixed-width/>{{ $t('notifications') }}</button>
			<button class="_buttonPlain" @click="search()"><fa :icon="faSearch" fixed-width/>{{ $t('search') }}</button>
		</nav>
	</transition>
	<transition name="zoom-in-bottom">
		<x-notifications v-if="notificationsOpen" class="notifications"/>
	</transition>
	<button v-if="$store.getters.isSignedIn" class="button nav _buttonPlain" @click="navClick()"><fa :icon="navOpen || notificationsOpen ? faTimes : faBars"/></button>
	<button v-if="$store.getters.isSignedIn" class="button post _buttonPrimary" @click="post()"><fa :icon="faPencilAlt"/></button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPencilAlt, faBars, faTimes, faSearch, faUserCog, faCog, faUser, faHome } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import i18n from './i18n';
import { search } from './scripts/search';
import DpToast from './components/toast.vue';
import XNotifications from './components/notifications.vue';

export default Vue.extend({
	i18n: i18n(),

	components: {
		XNotifications
	},

	data() {
		return {
			searching: false,
			navOpen: false,
			notificationsOpen: false,
			connection: null,
			faPencilAlt, faBars, faTimes, faBell, faSearch, faUserCog, faCog, faUser, faHome
		};
	},

	computed: {
		keymap(): any {
			return {
				'p|n': this.post,
				's': this.search,
			};
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

		navClick() {
			if (this.notificationsOpen) {
				this.notificationsOpen = false;
			} else if (this.navOpen) {
				this.navOpen = false;
			} else {
				this.navOpen = true;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
@import './theme';

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
		}
	}

	> .notifications {
		position: fixed;
		bottom: 96px + 16px;
		left: 32px;
		z-index: 10001;
		width: 280px;
		height: 300px;

		@media (max-width: 500px) {
			bottom: 92px;
			left: 16px;
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

		&.nav {
			left: 32px;
			background: #fff;
			color: $text;

			&:hover {
				background: #eee;
			}

			> i {
				position: absolute;
				top: 0;
				left: 0;
				color: var(--notificationIndicator);
				font-size: 16px;
				animation: blink 1s infinite;
			}
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
