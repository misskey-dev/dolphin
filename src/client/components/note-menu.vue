<template>
<div style="position:initial">
	<x-menu :source="source" :items="items" @closed="closed"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faStar, faLink, faThumbtack, faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { faCopy, faEye, faEyeSlash, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import { url } from '../config';
import copyToClipboard from '../scripts/copy-to-clipboard';
import XMenu from './menu.vue';

export default Vue.extend({
	i18n,
	components: {
		XMenu
	},
	props: ['note', 'source'],
	data() {
		return {
			isFavorited: false,
			isWatching: false
		};
	},
	computed: {
		items(): any[] {
			if (this.$store.getters.isSignedIn) {
				return [{
					icon: 'at',
					text: this.$t('mention'),
					action: this.mention
				}, null, {
					icon: 'info-circle',
					text: this.$t('detail'),
					action: this.detail
				}, {
					icon: faCopy,
					text: this.$t('copyContent'),
					action: this.copyContent
				}, {
					icon: faLink,
					text: this.$t('copyLink'),
					action: this.copyLink
				}, this.note.uri ? {
					icon: faExternalLinkSquareAlt,
					text: this.$t('remote'),
					action: () => {
						window.open(this.note.uri, '_blank');
					}
				} : undefined,
				null,
				this.isFavorited ? {
					icon: faStar,
					text: this.$t('unfavorite'),
					action: () => this.toggleFavorite(false)
				} : {
					icon: faStar,
					text: this.$t('favorite'),
					action: () => this.toggleFavorite(true)
				},
				this.note.userId == this.$store.state.i.id ? (this.$store.state.i.pinnedNoteIds || []).includes(this.note.id) ? {
					icon: faThumbtack,
					text: this.$t('unpin'),
					action: () => this.togglePin(false)
				} : {
					icon: faThumbtack,
					text: this.$t('pin'),
					action: () => this.togglePin(true)
				} : undefined,
				...(this.note.userId == this.$store.state.i.id || this.$store.state.i.isAdmin ? [
					null,
					this.note.userId == this.$store.state.i.id ? {
						icon: 'undo-alt',
						text: this.$t('delete-and-edit'),
						action: this.deleteAndEdit
					} : undefined,
					{
						icon: faTrashAlt,
						text: this.$t('delete'),
						action: this.del
					}]
					: []
				)]
				.filter(x => x !== undefined);
			} else {
				return [{
					icon: 'info-circle',
					text: this.$t('detail'),
					action: this.detail
				}, {
					icon: faCopy,
					text: this.$t('copyContent'),
					action: this.copyContent
				}, {
					icon: faLink,
					text: this.$t('copyLink'),
					action: this.copyLink
				}, this.note.uri ? {
					icon: faExternalLinkSquareAlt,
					text: this.$t('remote'),
					action: () => {
						window.open(this.note.uri, '_blank');
					}
				} : undefined]
				.filter(x => x !== undefined);
			}
		}
	},

	created() {
		this.$root.api('notes/state', {
			noteId: this.note.id
		}).then(state => {
			this.isFavorited = state.isFavorited;
			this.isWatching = state.isWatching;
		});
	},

	methods: {
		mention() {
			this.$post({ mention: this.note.user });
		},

		detail() {
			this.$router.push(`/note/${this.note.id}`);
		},

		copyContent() {
			copyToClipboard(this.note.text);
			this.$root.dialog({
				type: 'success',
				splash: true
			});
		},

		copyLink() {
			copyToClipboard(`${url}/note/${this.note.id}`);
			this.$root.dialog({
				type: 'success',
				splash: true
			});
		},

		togglePin(pin: boolean) {
			this.$root.api(pin ? 'i/pin' : 'i/unpin', {
				noteId: this.note.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					splash: true
				});
				this.destroyDom();
			}).catch(e => {
				if (e.id === '72dab508-c64d-498f-8740-a8eec1ba385a') {
					this.$root.dialog({
						type: 'error',
						text: this.$t('pin-limit-exceeded')
					});
				}
			});
		},

		del() {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('delete-confirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;

				this.$root.api('notes/delete', {
					noteId: this.note.id
				}).then(() => {
					this.destroyDom();
				});
			});
		},

		deleteAndEdit() {
			this.$root.dialog({
				type: 'warning',
				text: this.$t('delete-and-edit-confirm'),
				showCancelButton: true
			}).then(({ canceled }) => {
				if (canceled) return;
				this.$root.api('notes/delete', {
					noteId: this.note.id
				}).then(() => {
					this.destroyDom();
				});
				this.$post({
					initialNote: this.note,
					reply: this.note.reply,
				});
			});
		},

		toggleFavorite(favorite: boolean) {
			this.$root.api(favorite ? 'notes/favorites/create' : 'notes/favorites/delete', {
				noteId: this.note.id
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					splash: true
				});
				this.destroyDom();
			});
		},

		closed() {
			this.$emit('closed');
			this.$nextTick(() => {
				this.destroyDom();
			});
		}
	}
});
</script>
