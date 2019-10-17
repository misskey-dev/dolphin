<template>
<div
	class="note"
	v-show="appearNote.deletedAt == null && !hideThisNote"
	:tabindex="appearNote.deletedAt == null ? '-1' : null"
	:class="{ renote: isRenote }"
	v-hotkey="keymap"
>
	<x-sub v-for="note in conversation" :key="note.id" :note="note"/>
	<div class="reply-to" v-if="appearNote.reply">
		<x-sub :note="appearNote.reply"/>
	</div>
	<dp-renote class="renote" v-if="isRenote" :note="note"/>
	<article class="article">
		<dp-avatar class="avatar" :user="appearNote.user"/>
		<div class="main">
			<x-note-header class="header" :note="appearNote" :mini="true"/>
			<div class="body" v-if="appearNote.deletedAt == null">
				<p v-if="appearNote.cw != null" class="cw">
				<mfm v-if="appearNote.cw != ''" class="text" :text="appearNote.cw" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis" />
					<dp-cw-button v-model="showContent" :note="appearNote"/>
				</p>
				<div class="content" v-show="appearNote.cw == null || showContent">
					<div class="text">
						<span v-if="appearNote.isHidden" style="opacity: 0.5">({{ $t('private') }})</span>
						<a class="reply" v-if="appearNote.reply"><fa icon="reply"/></a>
						<mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis"/>
						<a class="rp" v-if="appearNote.renote != null">RN:</a>
					</div>
					<div class="files" v-if="appearNote.files.length > 0">
						<dp-media-list :media-list="appearNote.files"/>
					</div>
					<dp-poll v-if="appearNote.poll" :note="appearNote" ref="pollViewer"/>
					<dp-url-preview v-for="url in urls" :url="url" :key="url" :compact="true"/>
					<div class="renote" v-if="appearNote.renote"><dp-note-preview :note="appearNote.renote"/></div>
				</div>
			</div>
			<footer v-if="appearNote.deletedAt == null" class="footer">
				<x-reactions-viewer :note="appearNote" ref="reactionsViewer"/>
				<button @click="reply()" class="button">
					<template v-if="appearNote.reply"><fa icon="reply-all"/></template>
					<template v-else><fa icon="reply"/></template>
					<p class="count" v-if="appearNote.repliesCount > 0">{{ appearNote.repliesCount }}</p>
				</button>
				<button v-if="['public', 'home'].includes(appearNote.visibility)" @click="renote()" title="Renote" class="button">
					<fa icon="retweet"/><p class="count" v-if="appearNote.renoteCount > 0">{{ appearNote.renoteCount }}</p>
				</button>
				<button v-else class="button">
					<fa icon="ban"/>
				</button>
				<button v-if="!isMyNote && appearNote.myReaction == null" class="button" @click="react()" ref="reactButton">
					<fa icon="plus"/>
				</button>
				<button v-if="!isMyNote && appearNote.myReaction != null" class="button reacted" @click="undoReact(appearNote)" ref="reactButton">
					<fa icon="minus"/>
				</button>
				<button class="button" @click="menu()" ref="menuButton">
					<fa icon="ellipsis-h"/>
				</button>
			</footer>
			<div class="deleted" v-if="appearNote.deletedAt != null">{{ $t('deleted') }}</div>
		</div>
	</article>
	<x-sub v-for="note in replies" :key="note.id" :note="note"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';

import XSub from './note.sub.vue';
import XNoteHeader from './note-header.vue';
import XReactionsViewer from './reactions-viewer.vue';
import noteMixin from '../scripts/note-mixin';
import noteSubscriber from '../scripts/note-subscriber';

export default Vue.extend({
	i18n: i18n('mobile/views/components/note.vue'),
	
	components: {
		XSub,
		XNoteHeader,
		XReactionsViewer,
	},

	mixins: [
		noteMixin({
			mobile: true
		}),
		noteSubscriber('note')
	],

	props: {
		note: {
			type: Object,
			required: true
		},
		detail: {
			type: Boolean,
			required: false,
			default: false
		},
	},

	inject: {
		narrow: {
			default: false
		}
	},

	data() {
		return {
			conversation: [],
			replies: []
		};
	},

	created() {
		if (this.detail) {
			this.$root.api('notes/children', {
				noteId: this.appearNote.id,
				limit: 30
			}).then(replies => {
				this.replies = replies;
			});

			this.$root.api('notes/conversation', {
				noteId: this.appearNote.replyId
			}).then(conversation => {
				this.conversation = conversation.reverse();
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.note
	overflow hidden
	font-size 13px
	background #fff
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border-radius: 6px;

	@media (min-width 350px)
		font-size 14px

	@media (min-width 500px)
		font-size 16px

	> .article
		@media (min-width 600px)
			padding 32px 32px 22px

		> .avatar
			@media (min-width 350px)
				width 48px
				height 48px
				border-radius 6px

			@media (min-width 500px)
				margin-right 16px
				width 58px
				height 58px
				border-radius 8px

		> .main
			> .header
				@media (min-width 500px)
					margin-bottom 2px

			> .body
				@media (min-width 700px)
					font-size 1.1em

	> .renote + .article
		padding-top 8px

	> .article
		display flex
		padding 16px 16px 9px

		> .avatar
			flex-shrink 0
			display block
			margin 0 10px 8px 0
			width 42px
			height 42px
			border-radius 6px
			//position -webkit-sticky
			//position sticky
			//top 62px

		> .main
			flex 1
			min-width 0

			> .body
				> .cw
					cursor default
					display block
					margin 0
					padding 0
					overflow-wrap break-word

					> .text
						margin-right 8px

				> .content

					> .text
						display block
						margin 0
						padding 0
						overflow-wrap break-word
						font-size 1em

						> .reply
							margin-right 8px

						> .rp
							margin-left 4px
							font-style oblique
							color var(--renoteText)

					.dp-url-preview
						margin-top 8px

					> .files
						> img
							display block
							max-width 100%

					> .location
						margin 4px 0
						font-size 12px
						color #ccc

					> .map
						width 100%
						height 200px

						&:empty
							display none

					> .dp-poll
						font-size 80%

					> .renote
						margin 8px 0

						> *
							padding 16px
							border dashed var(--lineWidth) var(--quoteBorder)
							border-radius 8px

				> .app
					font-size 12px
					color #ccc

			> .footer
				> .button
					margin 0
					padding 8px
					background transparent
					border none
					box-shadow none
					font-size 1em
					color var(--noteActions)
					cursor pointer

					&:not(:last-child)
						margin-right 28px

					&:hover
						color var(--noteActionsHover)

					> .count
						display inline
						margin 0 0 0 8px
						opacity 0.7

					&.reacted
						color #5da1c1

			> .deleted
				opacity 0.7

</style>
