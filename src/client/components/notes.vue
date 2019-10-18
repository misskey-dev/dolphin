<template>
<div class="dp-notes">
	<div class="empty" v-if="empty">{{ $t('@.no-notes') }}</div>

	<dp-error v-if="error" @retry="init()"/>

	<sequential-entrance animation="entranceFromTop" delay="25" class="notes">
		<template v-for="(note, i) in _notes">
			<x-note :note="note" :key="note.id"/>
			<x-date-separator class="date" :key="note.id + '_date'" v-if="i != items.length - 1 && note._date != _notes[i + 1]._date" :newer="note.createdAt" :older="_notes[i + 1].createdAt"/>
		</template>
	</sequential-entrance>

	<footer v-if="more">
		<button @click="fetchMore()" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }">
			<template v-if="!moreFetching">{{ $t('@.load-more') }}</template>
			<template v-if="moreFetching"><fa icon="spinner" pulse fixed-width/></template>
		</button>
	</footer>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import paging from '../scripts/paging';
import XNote from './note.vue';
import XDateSeparator from './date-separator.vue';

export default Vue.extend({
	i18n: i18n(),

	components: {
		XNote, XDateSeparator
	},

	mixins: [
		paging({
			captureWindowScroll: true,

			onQueueChanged: (self, x) => {
				if (x.length > 0) {
					self.$store.commit('indicate', true);
				} else {
					self.$store.commit('indicate', false);
				}
			},

			onPrepend: (self, note) => {
				// タブが非表示またはスクロール位置が最上部ではないならタイトルで通知
				if (document.hidden || !self.isScrollTop()) {
					self.$store.commit('pushBehindNote', note);
				}
			},

			onInited: (self) => {
				self.$emit('loaded');
			}
		}),
	],

	props: {
		pagination: {
			required: true
		},
	},

	computed: {
		_notes(): any[] {
			return (this.items as any).map(item => {
				const date = new Date(item.createdAt).getDate();
				const month = new Date(item.createdAt).getMonth() + 1;
				item._date = date;
				return item;
			});
		}
	},
});
</script>

<style lang="scss" scoped>
.dp-notes {
	> .empty {
		margin: 0 auto;
		padding: 32px;
		max-width: 400px;
		text-align: center;
	}

	> .notes {
		> div {
			margin-bottom: 16px;
		}
	}

	> footer {
		text-align: center;

		&:empty {
			display: none;
		}

		> button {
			margin: 0;
			padding: 16px;
			width: 100%;

			&:disabled {
				opacity: 0.7;
			}
		}
	}
}
</style>
