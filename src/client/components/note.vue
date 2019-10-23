<template>
<div
	class="note"
	v-show="appearNote.deletedAt == null && !hideThisNote"
	:tabindex="appearNote.deletedAt == null ? '-1' : null"
	:class="{ renote: isRenote }"
	v-hotkey="keymap"
>
	<x-sub v-for="note in conversation" :key="note.id" :note="note"/>
	<x-sub :note="appearNote.reply" class="reply-to" v-if="appearNote.reply"/>
	<div class="renote" v-if="isRenote">
		<dp-avatar class="avatar" :user="note.user"/>
		<fa :icon="faRetweet"/>
		<i18n path="renotedBy" tag="span">
			<router-link class="name" :to="note.user | userPage" v-user-preview="note.userId" place="user">
				<dp-user-name :user="note.user"/>
			</router-link>
		</i18n>
		<div class="info">
			<dp-time :time="note.createdAt"/>
			<span class="visibility" v-if="note.visibility != 'public'">
				<fa v-if="note.visibility == 'home'" :icon="faHome"/>
				<fa v-if="note.visibility == 'followers'" :icon="faUnlock"/>
				<fa v-if="note.visibility == 'specified'" :icon="faEnvelope"/>
			</span>
		</div>
	</div>
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
						<mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis"/>
						<a class="rp" v-if="appearNote.renote != null">RN:</a>
					</div>
					<div class="files" v-if="appearNote.files.length > 0">
						<x-media-list :media-list="appearNote.files"/>
					</div>
					<dp-poll v-if="appearNote.poll" :note="appearNote" ref="pollViewer"/>
					<dp-url-preview v-for="url in urls" :url="url" :key="url" :compact="true"/>
					<div class="renote" v-if="appearNote.renote"><x-note-preview :note="appearNote.renote"/></div>
				</div>
			</div>
			<footer v-if="appearNote.deletedAt == null" class="footer">
				<x-reactions-viewer :note="appearNote" ref="reactionsViewer"/>
				<button @click="reply()" class="button _button">
					<template v-if="appearNote.reply"><fa :icon="faReplyAll"/></template>
					<template v-else><fa :icon="faReply"/></template>
					<p class="count" v-if="appearNote.repliesCount > 0">{{ appearNote.repliesCount }}</p>
				</button>
				<button v-if="['public', 'home'].includes(appearNote.visibility)" @click="renote()" title="Renote" class="button _button">
					<fa :icon="faRetweet"/><p class="count" v-if="appearNote.renoteCount > 0">{{ appearNote.renoteCount }}</p>
				</button>
				<button v-else class="button _button">
					<fa :icon="faBan"/>
				</button>
				<button v-if="!isMyNote && appearNote.myReaction == null" class="button _button" @click="react()" ref="reactButton">
					<fa :icon="faPlus"/>
				</button>
				<button v-if="!isMyNote && appearNote.myReaction != null" class="button _button reacted" @click="undoReact(appearNote)" ref="reactButton">
					<fa :icon="faMinus"/>
				</button>
				<button class="button _button" @click="menu()" ref="menuButton">
					<fa :icon="faEllipsisH"/>
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
import { faPlus, faMinus, faRetweet, faReply, faReplyAll, faEllipsisH, faQuoteRight, faHome, faUnlock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import XSub from './note.sub.vue';
import XNoteHeader from './note-header.vue';
import XNotePreview from './note-preview.vue';
import XReactionsViewer from './reactions-viewer.vue';
import XMediaList from './media-list.vue';
import noteMixin from '../scripts/note-mixin';
import noteSubscriber from '../scripts/note-subscriber';

export default Vue.extend({
	i18n,
	
	components: {
		XSub,
		XNoteHeader,
		XNotePreview,
		XReactionsViewer,
		XMediaList,
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

	data() {
		return {
			conversation: [],
			replies: [],
			faPlus, faMinus, faRetweet, faReply, faReplyAll, faEllipsisH, faQuoteRight, faHome, faUnlock, faEnvelope
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

<style lang="scss" scoped>
@import '../theme';

.note {
	position: relative;
	font-size: 16px;
	background: var(--bg);
	border-radius: 6px;
	@include shadow();
	transition: box-shadow 0.1s ease;

	@media (max-width: 500px) {
		font-size: 14px;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba($primary, 0.3);
	}

	&:hover > .article > .main > .footer > .button {
		opacity: 1;
	}

	> *:first-child {
		border-radius: 6px 6px 0 0;
	}

	> *:last-child {
		border-radius: 0 0 6px 6px;
	}

	> .renote {
		display: flex;
		align-items: center;
		padding: 16px 32px 8px 32px;
		line-height: 28px;
		white-space: pre;
		color: #229e82;

		@media (max-width: 450px) {
			padding: 8px 16px 0 16px;
		}

		> .avatar {
			flex-shrink: 0;
			display: inline-block;
			width: 28px;
			height: 28px;
			margin: 0 8px 0 0;
			border-radius: 6px;
		}

		> [data-icon] {
			margin-right: 4px;
		}

		> span {
			overflow: hidden;
			flex-shrink: 1;
			text-overflow: ellipsis;
			white-space: nowrap;

			> .name {
				font-weight: bold;
			}
		}

		> .info {
			margin-left: auto;
			font-size: 0.9em;

			> .dp-time {
				flex-shrink: 0;
			}

			> .visibility {
				margin-left: 8px;

				[data-icon] {
					margin-right: 0;
				}
			}
		}
	}

	> .renote + .article {
		padding-top: 8px;
	}

	> .article {
		display: flex;
		padding: 28px 32px 18px;

		@media (max-width: 450px) {
			padding: 14px 16px 9px;
		}

		> .avatar {
			flex-shrink: 0;
			display: block;
			margin: 0 10px 8px 0;
			width: 58px;
			height: 58px;
			position: sticky;
			top: 16px;
			left: 0;

			@media (max-width: 450px) {
				width: 50px;
				height: 50px;
			}
		}

		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				> .cw {
					cursor: default;
					display: block;
					margin: 0;
					padding: 0;
					overflow-wrap: break-word;

					> .text {
						margin-right: 8px;
					}
				}

				> .content {

					> .text {
						display: block;
						margin: 0;
						padding: 0;
						overflow-wrap: break-word;
						font-size: 1em;

						> .rp {
							margin-left: 4px;
							font-style: oblique;
							color: var(--renoteText);
						}
					}

					.dp-url-preview {
						margin-top: 8px;
					}

					> .files {
						> img {
							display: block;
							max-width: 100%;
						}
					}

					> .dp-poll {
						font-size: 80%;
					}

					> .renote {
						margin: 8px 0;

						> * {
							padding: 16px;
							border: dashed 1px var(--quoteBorder);
							border-radius: 8px;
						}
					}
				}
			}

			> .footer {
				> .button {
					margin: 0;
					padding: 8px;
					opacity: 0.7;

					&:not(:last-child) {
						margin-right: 28px;
					}

					&:hover {
						color: darken(#5c6a73, 30%);
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: $primary;
					}
				}
			}

			> .deleted {
				opacity: 0.7;
			}
		}
	}
}
</style>
