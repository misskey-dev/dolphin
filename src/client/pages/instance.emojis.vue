<template>
<section class="_section dp-instance-emojis">
	<div class="title">{{ $t('customEmojis') }}</div>
	<div class="content">
		<x-pagination :pagination="pagination" #default="{items}" class="emojis" ref="emojis">
			<div class="emoji" v-for="(emoji, i) in items" :key="emoji.id" :data-index="i" @click="selected = emoji" :class="{ selected: selected && (selected.id === emoji.id) }">
				<img :src="emoji.url" class="img" :alt="emoji.name"/>
				<div class="body">
					<span class="name">{{ emoji.name }}</span>
				</div>
			</div>
		</x-pagination>
	</div>
	<div class="footer">
		<x-button inline primary @click="add()"><fa :icon="faPlus"/> {{ $t('addEmoji') }}</x-button>
		<x-button inline :disabled="selected == null" @click="del()"><fa :icon="faTrashAlt"/> {{ $t('delete') }}</x-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XButton from '../components/ui/button.vue';
import XPagination from '../components/ui/pagination.vue';

export default Vue.extend({
	components: {
		XButton,
		XPagination,
	},

	data() {
		return {
			selected: null,
			pagination: {
				endpoint: 'admin/emoji/list',
				limit: 10,
			},
			faTrashAlt, faPlus
		}
	},

	methods: {
		async add() {
			const { canceled: canceled1, result: name } = await this.$root.dialog({
				title: this.$t('emojiName'),
				input: true
			});
			if (canceled1) return;

			const { canceled: canceled2, result: url } = await this.$root.dialog({
				title: this.$t('emojiUrl'),
				input: true
			});
			if (canceled2) return;

			this.$root.api('admin/emoji/add', {
				name: name,
				url: url,
			}).then(() => {
				this.$refs.emojis.reload();
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			});
		},

		async del() {
			const { canceled } = await this.$root.dialog({
				type: 'warning',
				text: this.$t('emojiDeleteConfirm', { name: this.selected.name }),
				showCancelButton: true
			});
			if (canceled) return;

			this.$root.api('admin/emoji/remove', {
				id: this.selected.id
			}).then(() => {
				this.$refs.emojis.reload();
			});
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.dp-instance-emojis {
	> .content {
		max-height: 300px;
		overflow: auto;
		
		> .emojis {
			> .emoji {
				display: flex;
				align-items: center;

				&.selected {
					background: $primary;
					box-shadow: 0 0 0 8px $primary;
					color: #fff;
				}

				> .img {
					width: 50px;
					height: 50px;
				}

				> .body {
					padding: 8px;

					> .name {
						display: block;
					}
				}
			}
		}
	}
}
</style>
