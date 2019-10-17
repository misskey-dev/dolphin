<template>
<div class="dp-notes">
	<div class="empty" v-if="empty">{{ $t('@.no-notes') }}</div>

	<dp-error v-if="error" @retry="init()"/>

	<transition-group name="dp-notes" class="transition" tag="div">
		<template v-for="(note, i) in _notes">
			<x-note :note="note" :key="note.id"/>
			<p class="date" :key="note.id + '_date'" v-if="i != items.length - 1 && note._date != _notes[i + 1]._date">
				<span><fa icon="angle-up"/>{{ note._datetext }}</span>
				<span><fa icon="angle-down"/>{{ _notes[i + 1]._datetext }}</span>
			</p>
		</template>
	</transition-group>

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

export default Vue.extend({
	i18n: i18n(),

	components: {
		XNote
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
				item._datetext = this.$t('monthAndDay').replace('{month}', month.toString()).replace('{day}', date.toString());
				return item;
			});
		}
	},
});
</script>

<style lang="stylus" scoped>
.dp-notes
	> .empty
		padding 16px
		text-align center

	.transition
		.dp-notes-enter
		.dp-notes-leave-to
			opacity 0
			transform translateY(-30px)

		> *
			transition transform .3s ease, opacity .3s ease

		> *:not(.date)
			margin 16px 0

		> .date
			display block
			margin 0
			line-height 32px
			text-align center
			font-size 0.9em
			color var(--dateDividerFg)
			background var(--dateDividerBg)
			border-bottom solid var(--lineWidth) var(--faceDivider)

			span
				margin 0 16px

			[data-icon]
				margin-right 8px

	> .empty
		margin 0 auto
		padding 32px
		max-width 400px
		text-align center
		color var(--text)

	> footer
		text-align center
		border-top solid var(--lineWidth) var(--faceDivider)

		&:empty
			display none

		> button
			margin 0
			padding 16px
			width 100%
			color var(--text)

			@media (min-width 500px)
				padding 20px

			&:disabled
				opacity 0.7

</style>
