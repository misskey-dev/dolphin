<template>
<div class="dp-notifications">
	<div class="contents">
		<sequential-entrance class="notifications">
			<template v-for="(notification, i) in _notifications">
				<x-notification :notification="notification" :key="notification.id" :with-time="true" class="notification" :data-index="i"/>
				<x-date-separator class="date" :key="notification.id + '_date'" :data-index="i" v-if="i != items.length - 1 && notification._date != _notifications[i + 1]._date" :newer="notification.createdAt" :older="_notifications[i + 1].createdAt"/>
			</template>
		</sequential-entrance>

		<button class="more" v-if="more" @click="fetchMore" :disabled="moreFetching">
			<template v-if="moreFetching"><fa icon="spinner" pulse fixed-width/></template>
			{{ moreFetching ? $t('@.loading') : $t('@.load-more') }}
		</button>

		<p class="empty" v-if="empty">{{ $t('empty') }}</p>

		<dp-error v-if="error" @retry="init()"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import paging from '../scripts/paging';
import XNotification from './notification.vue';

export default Vue.extend({
	i18n,

	components: {
		XNotification
	},

	mixins: [
		paging({
			beforeInit: (self) => {
				self.$emit('beforeInit');
			},
			onInited: (self) => {
				self.$emit('inited');
			}
		}),
	],

	props: {
		type: {
			type: String,
			required: false
		},
		wide: {
			type: Boolean,
			required: false,
			default: false
		}
	},

	data() {
		return {
			connection: null,
			pagination: {
				endpoint: 'i/notifications',
				limit: 15,
				params: () => ({
					includeTypes: this.type ? [this.type] : undefined
				})
			}
		};
	},

	computed: {
		_notifications(): any[] {
			return (this.items as any).map(notification => {
				const date = new Date(notification.createdAt).getDate();
				const month = new Date(notification.createdAt).getMonth() + 1;
				notification._date = date;
				return notification;
			});
		}
	},

	watch: {
		type() {
			this.reload();
		}
	},

	mounted() {
		this.connection = this.$root.stream.useSharedConnection('main');
		this.connection.on('notification', this.onNotification);
	},

	beforeDestroy() {
		this.connection.dispose();
	},

	methods: {
		onNotification(notification) {
			// TODO: ユーザーが画面を見てないと思われるとき(ブラウザやタブがアクティブじゃないなど)は送信しない
			this.$root.stream.send('readNotification', {
				id: notification.id
			});

			this.prepend(notification);
		},
	}
});
</script>

<style lang="scss" scoped>
.dp-notifications {
	background: rgba(255, 255, 255, 0.5);
	-webkit-backdrop-filter: blur(12px);
	backdrop-filter: blur(12px);
	border-radius: 6px;
	box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
	overflow: hidden;

	> .contents {
		overflow: auto;
		height: 100%;

		> .notifications {
			> .notification {
				margin: 8px;
				background: #fff;
				border-radius: 6px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			}
		}

		> .more {
			display: block;
			width: 100%;
			padding: 16px;
			color: var(--text);
			border-top: solid var(--lineWidth) rgba(#000, 0.05);

			> [data-icon] {
				margin-right: 4px;
			}
		}

		> .empty {
			margin: 0;
			padding: 16px;
			text-align: center;
			color: var(--text);
		}

		> .placeholder {
			padding: 32px;
			opacity: 0.3;
		}
	}
}
</style>
