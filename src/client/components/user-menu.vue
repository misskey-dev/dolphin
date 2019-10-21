<template>
<div style="position:initial">
	<x-menu :source="source" :items="items" @closed="closed"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faExclamationCircle, faMicrophoneSlash, faAt, faListUl } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import XMenu from './menu.vue';

export default Vue.extend({
	i18n,

	components: {
		XMenu
	},

	props: ['user', 'source'],

	data() {
		let menu = [{
			icon: faAt,
			text: this.$t('copyUsername'),
			action: () => {
				
			}
		}, {
			icon: faEnvelope,
			text: this.$t('sendMessage'),
			action: () => {
				this.$post({ mention: this.user });
			}
		}, null, {
			icon: faListUl,
			text: this.$t('addToList'),
			action: this.pushList
		}] as any;

		if (this.$store.getters.isSignedIn && this.$store.state.i.id != this.user.id) {
			menu = menu.concat([null, {
				icon: 'ban',
				text: this.user.isBlocking ? this.$t('unblock') : this.$t('block'),
				action: this.toggleBlock
			}, null, {
				icon: faExclamationCircle,
				text: this.$t('report-abuse'),
				action: this.reportAbuse
			}]);
		}

		if (this.$store.getters.isSignedIn && this.$store.state.i.isAdmin) {
			menu = menu.concat([null, {
				icon: faMicrophoneSlash,
				text: this.user.isSilenced ? this.$t('unsilence') : this.$t('silence'),
				action: this.toggleSilence
			}, {
				icon: faSnowflake,
				text: this.user.isSuspended ? this.$t('unsuspend') : this.$t('suspend'),
				action: this.toggleSuspend
			}]);
		}

		return {
			items: menu
		};
	},

	methods: {
		closed() {
			this.$nextTick(() => {
				this.destroyDom();
			});
		},

		async pushList() {
			const t = this.$t('select-list'); // なぜか後で参照すると null になるので最初にメモリに確保しておく
			const lists = await this.$root.api('users/lists/list');
			const { canceled, result: listId } = await this.$root.dialog({
				type: null,
				title: t,
				select: {
					items: lists.map(list => ({
						value: list.id, text: list.name
					}))
				},
				showCancelButton: true
			});
			if (canceled) return;
			await this.$root.api('users/lists/push', {
				listId: listId,
				userId: this.user.id
			});
			this.$root.dialog({
				type: 'success',
				splash: true
			});
		},

		async toggleBlock() {
			if (this.user.isBlocking) {
				if (!await this.getConfirmed(this.$t('unblock-confirm'))) return;

				this.$root.api('blocking/delete', {
					userId: this.user.id
				}).then(() => {
					this.user.isBlocking = false;
				}, () => {
					this.$root.dialog({
						type: 'error',
						text: e
					});
				});
			} else {
				if (!await this.getConfirmed(this.$t('block-confirm'))) return;

				this.$root.api('blocking/create', {
					userId: this.user.id
				}).then(() => {
					this.user.isBlocking = true;
				}, () => {
					this.$root.dialog({
						type: 'error',
						text: e
					});
				});
			}
		},

		async toggleSuspend() {
			if (!await this.getConfirmed(this.$t(this.user.isSuspended ? 'unsuspend-confirm' : 'suspend-confirm'))) return;

			this.$root.api(this.user.isSuspended ? 'admin/unsuspend-user' : 'admin/suspend-user', {
				userId: this.user.id
			}).then(() => {
				this.user.isSuspended = !this.user.isSuspended;
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			}, e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			});
		},

		async getConfirmed(text: string): Promise<Boolean> {
			const confirm = await this.$root.dialog({
				type: 'warning',
				showCancelButton: true,
				title: 'confirm',
				text,
			});

			return !confirm.canceled;
		},
	}
});
</script>
