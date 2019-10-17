<template>
<div class="gafaadew">
	<div class="form"
		@dragover.stop="onDragover"
		@dragenter="onDragenter"
		@dragleave="onDragleave"
		@drop.stop="onDrop"
	>
		<header>
			<button class="cancel" @click="cancel"><fa icon="times"/></button>
			<div>
				<span class="text-count" :class="{ over: trimmedLength(text) > maxNoteTextLength }">{{ maxNoteTextLength - trimmedLength(text) }}</span>
				<button class="submit" :disabled="!canPost" @click="post">{{ submitText }}</button>
			</div>
		</header>
		<div class="form">
			<dp-note-preview class="preview" v-if="reply" :note="reply"/>
			<dp-note-preview class="preview" v-if="renote" :note="renote"/>
			<div class="with-quote" v-if="quoteId"><fa icon="quote-left"/> {{ $t('@.post-form.quote-attached') }}<button @click="quoteId = null"><fa icon="times"/></button></div>
			<div v-if="visibility === 'specified'" class="to-specified">
				<fa icon="envelope"/> {{ $t('@.post-form.specified-recipient') }}
				<div class="visibleUsers">
					<span v-for="u in visibleUsers">
						<dp-user-name :user="u"/>
						<button @click="removeVisibleUser(u)"><fa icon="times"/></button>
					</span>
					<button @click="addVisibleUser">{{ $t('@.post-form.add-visible-user') }}</button>
				</div>
			</div>
			<input v-show="useCw" ref="cw" v-model="cw" :placeholder="$t('@.post-form.cw-placeholder')" v-autocomplete="{ model: 'cw' }">
			<textarea v-model="text" ref="text" :disabled="posting" :placeholder="placeholder" v-autocomplete="{ model: 'text' }" @paste="onPaste"></textarea>
			<x-post-form-attaches class="attaches" :files="files"/>
			<x-poll-editor v-if="poll" ref="poll" @destroyed="poll = false" @updated="onPollUpdate()"/>
			<dp-uploader ref="uploader" @uploaded="attachMedia" @change="onChangeUploadings"/>
			<footer>
				<button class="upload" @click="chooseFile"><fa icon="upload"/></button>
				<button class="drive" @click="chooseFileFromDrive"><fa icon="cloud"/></button>
				<button class="poll" @click="poll = true"><fa icon="chart-pie"/></button>
				<button class="poll" @click="useCw = !useCw"><fa :icon="['far', 'eye-slash']"/></button>
				<button class="visibility" @click="setVisibility" ref="visibilityButton">
					<span v-if="visibility === 'public'"><fa icon="globe"/></span>
					<span v-if="visibility === 'home'"><fa icon="home"/></span>
					<span v-if="visibility === 'followers'"><fa icon="unlock"/></span>
					<span v-if="visibility === 'specified'"><fa icon="envelope"/></span>
				</button>
			</footer>
			<input ref="file" class="file" type="file" multiple="multiple" @change="onChangeFile"/>
		</div>
	</div>
	<div class="hashtags" v-if="recentHashtags.length > 0 && $store.state.settings.suggestRecentHashtags">
		<a v-for="tag in recentHashtags.slice(0, 5)" @click="addTag(tag)">#{{ tag }}</a>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import insertTextAtCursor from 'insert-text-at-cursor';
import { length } from 'stringz';
import { toASCII } from 'punycode';
import DpVisibilityChooser from '../components/visibility-chooser.vue';
import { parse } from '../../mfm/parse';
import { host, url } from '../config';
import { erase, unique } from '../../prelude/array';
import extractMentions from '../../misc/extract-mentions';
import { formatTimeString } from '../../misc/format-time-string';

export default Vue.extend({
	i18n: i18n(),

	components: {
		XPostFormAttaches: () => import('../components/post-form-attaches.vue').then(m => m.default),
		XPollEditor: () => import('../components/poll-editor.vue').then(m => m.default)
	},

	props: {
		reply: {
			type: Object,
			required: false
		},
		renote: {
			type: Object,
			required: false
		},
		mention: {
			type: Object,
			required: false
		},
		initialText: {
			type: String,
			required: false
		},
		initialNote: {
			type: Object,
			required: false
		},
		instant: {
			type: Boolean,
			required: false,
			default: false
		}
	},

	data() {
		return {
			posting: false,
			text: '',
			files: [],
			uploadings: [],
			poll: false,
			pollChoices: [],
			pollMultiple: false,
			pollExpiration: [],
			useCw: false,
			cw: null,
			visibility: 'public',
			visibleUsers: [],
			autocomplete: null,
			draghover: false,
			quoteId: null,
			recentHashtags: JSON.parse(localStorage.getItem('hashtags') || '[]'),
			maxNoteTextLength: 1000
		};
	},

	computed: {
		draftId(): string {
			return this.renote
				? `renote:${this.renote.id}`
				: this.reply
					? `reply:${this.reply.id}`
					: 'note';
		},

		placeholder(): string {
			const xs = [
				this.$t('@.note-placeholders.a'),
				this.$t('@.note-placeholders.b'),
				this.$t('@.note-placeholders.c'),
				this.$t('@.note-placeholders.d'),
				this.$t('@.note-placeholders.e'),
				this.$t('@.note-placeholders.f')
			];
			const x = xs[Math.floor(Math.random() * xs.length)];

			return this.renote
				? opts.mobile ? this.$t('@.post-form.option-quote-placeholder') : this.$t('@.post-form.quote-placeholder')
				: this.reply
					? this.$t('@.post-form.reply-placeholder')
					: x;
		},

		submitText(): string {
			return this.renote
				? this.$t('@.post-form.renote')
				: this.reply
					? this.$t('@.post-form.reply')
					: this.$t('@.post-form.submit');
		},

		canPost(): boolean {
			return !this.posting &&
				(1 <= this.text.length || 1 <= this.files.length || this.poll || this.renote) &&
				(length(this.text.trim()) <= this.maxNoteTextLength) &&
				(!this.poll || this.pollChoices.length >= 2);
		}
	},

	created() {
		this.$root.getMeta().then(meta => {
			this.maxNoteTextLength = meta.maxNoteTextLength;
		});
	},

	mounted() {
		if (this.initialText) {
			this.text = this.initialText;
		}

		if (this.mention) {
			this.text = this.mention.host ? `@${this.mention.username}@${toASCII(this.mention.host)}` : `@${this.mention.username}`;
			this.text += ' ';
		}

		if (this.reply && this.reply.user.host != null) {
			this.text = `@${this.reply.user.username}@${toASCII(this.reply.user.host)} `;
		}

		if (this.reply && this.reply.text != null) {
			const ast = parse(this.reply.text);

			for (const x of extractMentions(ast)) {
				const mention = x.host ? `@${x.username}@${toASCII(x.host)}` : `@${x.username}`;

				// 自分は除外
				if (this.$store.state.i.username == x.username && x.host == null) continue;
				if (this.$store.state.i.username == x.username && x.host == host) continue;

				// 重複は除外
				if (this.text.indexOf(`${mention} `) != -1) continue;

				this.text += `${mention} `;
			}
		}

		// デフォルト公開範囲
		this.applyVisibility(this.$store.state.settings.rememberNoteVisibility ? (this.$store.state.device.visibility || this.$store.state.settings.defaultNoteVisibility) : this.$store.state.settings.defaultNoteVisibility);

		// 公開以外へのリプライ時は元の公開範囲を引き継ぐ
		if (this.reply && ['home', 'followers', 'specified'].includes(this.reply.visibility)) {
			this.visibility = this.reply.visibility;
			if (this.reply.visibility === 'specified') {
				this.$root.api('users/show', {
					userIds: this.reply.visibleUserIds.filter(uid => uid !== this.$store.state.i.id && uid !== this.reply.userId)
				}).then(users => {
					this.visibleUsers.push(...users);
				});

				if (this.reply.userId !== this.$store.state.i.id) {
					this.$root.api('users/show', { userId: this.reply.userId }).then(user => {
						this.visibleUsers.push(user);
					});
				}
			}
		}

		// keep cw when reply
		if (this.$store.state.settings.keepCw && this.reply && this.reply.cw) {
			this.useCw = true;
			this.cw = this.reply.cw;
		}

		this.focus();

		this.$nextTick(() => {
			this.focus();
		});

		this.$nextTick(() => {
			// 書きかけの投稿を復元
			if (!this.instant && !this.mention) {
				const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[this.draftId];
				if (draft) {
					this.text = draft.data.text;
					this.files = (draft.data.files || []).filter(e => e);
					if (draft.data.poll) {
						this.poll = true;
						this.$nextTick(() => {
							(this.$refs.poll as any).set(draft.data.poll);
						});
					}
					this.$emit('change-attached-files', this.files);
				}
			}

			// 削除して編集
			if (this.initialNote) {
				const init = this.initialNote;
				this.text = init.text ? init.text : '';
				this.files = init.files;
				this.cw = init.cw;
				this.useCw = init.cw != null;
				if (init.poll) {
					this.poll = true;
					this.$nextTick(() => {
						(this.$refs.poll as any).set({
							choices: init.poll.choices.map(c => c.text),
							multiple: init.poll.multiple
						});
					});
				}
				this.visibility = init.visibility;
				this.quoteId = init.renote ? init.renote.id : null;
			}

			this.$nextTick(() => this.watch());
		});
	},

	methods: {
		watch() {
			this.$watch('text', () => this.saveDraft());
			this.$watch('poll', () => this.saveDraft());
			this.$watch('files', () => this.saveDraft());
		},

		trimmedLength(text: string) {
			return length(text.trim());
		},

		addTag(tag: string) {
			insertTextAtCursor(this.$refs.text, ` #${tag} `);
		},

		focus() {
			(this.$refs.text as any).focus();
		},

		chooseFile() {
			(this.$refs.file as any).click();
		},

		chooseFileFromDrive() {
			this.$chooseDriveFile({
				multiple: true
			}).then(files => {
				for (const x of files) this.attachMedia(x);
			});
		},

		attachMedia(driveFile) {
			this.files.push(driveFile);
			this.$emit('change-attached-files', this.files);
		},

		detachMedia(id) {
			this.files = this.files.filter(x => x.id != id);
			this.$emit('change-attached-files', this.files);
		},

		onChangeFile() {
			for (const x of Array.from((this.$refs.file as any).files)) this.upload(x);
		},

		upload(file: File, name?: string) {
			(this.$refs.uploader as any).upload(file, this.$store.state.settings.uploadFolder, name);
		},

		onChangeUploadings(uploads) {
			this.$emit('change-uploadings', uploads);
		},

		onPollUpdate() {
			const got = this.$refs.poll.get();
			this.pollChoices = got.choices;
			this.pollMultiple = got.multiple;
			this.pollExpiration = [got.expiration, got.expiresAt || got.expiredAfter];
			this.saveDraft();
		},

		setVisibility() {
			const w = this.$root.new(DpVisibilityChooser, {
				source: this.$refs.visibilityButton,
				currentVisibility: this.visibility
			});
			w.$once('chosen', v => {
				this.applyVisibility(v);
			});
			this.$once('hook:beforeDestroy', () => {
				w.close();
			});
		},

		applyVisibility(v: string) {
			this.visibility = v;
		},

		addVisibleUser() {
			this.$root.dialog({
				title: this.$t('@.post-form.enter-username'),
				user: true
			}).then(({ canceled, result: user }) => {
				if (canceled) return;
				this.visibleUsers.push(user);
			});
		},

		removeVisibleUser(user) {
			this.visibleUsers = erase(user, this.visibleUsers);
		},

		clear() {
			this.text = '';
			this.files = [];
			this.poll = false;
			this.quoteId = null;
			this.$emit('change-attached-files', this.files);
		},

		onKeydown(e) {
			if ((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey) && this.canPost) this.post();
		},

		async onPaste(e: ClipboardEvent) {
			for (const { item, i } of Array.from(e.clipboardData.items).map((item, i) => ({item, i}))) {
				if (item.kind == 'file') {
					const file = item.getAsFile();
					const lio = file.name.lastIndexOf('.');
					const ext = lio >= 0 ? file.name.slice(lio) : '';
					const formatted = `${formatTimeString(new Date(file.lastModified), this.$store.state.settings.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
					const name = this.$store.state.settings.pasteDialog
						? await this.$root.dialog({
								title: this.$t('@.post-form.enter-file-name'),
								input: {
									default: formatted
								},
								allowEmpty: false
							}).then(({ canceled, result }) => canceled ? false : result)
						: formatted;
					if (name) this.upload(file, name);
				}
			}

			const paste = e.clipboardData.getData('text');

			if (!this.renote && !this.quoteId && paste.startsWith(url + '/notes/')) {
				e.preventDefault();

				this.$root.dialog({
					type: 'info',
					text: this.$t('@.post-form.quote-question'),
					showCancelButton: true
				}).then(({ canceled }) => {
					if (canceled) {
						insertTextAtCursor(this.$refs.text, paste);
						return;
					}

					this.quoteId = paste.substr(url.length).match(/^\/notes\/(.+?)\/?$/)[1];
				});
			}
		},

		onDragover(e) {
			const isFile = e.dataTransfer.items[0].kind == 'file';
			const isDriveFile = e.dataTransfer.types[0] == 'mk_drive_file';
			if (isFile || isDriveFile) {
				e.preventDefault();
				this.draghover = true;
				e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed == 'all' ? 'copy' : 'move';
			}
		},

		onDragenter(e) {
			this.draghover = true;
		},

		onDragleave(e) {
			this.draghover = false;
		},

		onDrop(e): void {
			this.draghover = false;

			// ファイルだったら
			if (e.dataTransfer.files.length > 0) {
				e.preventDefault();
				for (const x of Array.from(e.dataTransfer.files)) this.upload(x);
				return;
			}

			//#region ドライブのファイル
			const driveFile = e.dataTransfer.getData('mk_drive_file');
			if (driveFile != null && driveFile != '') {
				const file = JSON.parse(driveFile);
				this.files.push(file);
				this.$emit('change-attached-files', this.files);
				e.preventDefault();
			}
			//#endregion
		},

		async emoji() {
			/*
			const Picker = await import('../../desktop/views/components/emoji-picker-dialog.vue').then(m => m.default);
			const button = this.$refs.emoji;
			const rect = button.getBoundingClientRect();
			const vm = this.$root.new(Picker, {
				x: button.offsetWidth + rect.left + window.pageXOffset,
				y: rect.top + window.pageYOffset
			});
			vm.$once('chosen', emoji => {
				insertTextAtCursor(this.$refs.text, emoji);
			});
			this.$once('hook:beforeDestroy', () => {
				vm.close();
			});*/
		},

		saveDraft() {
			if (this.instant) return;

			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			data[this.draftId] = {
				updatedAt: new Date(),
				data: {
					text: this.text,
					files: this.files,
					poll: this.poll && this.$refs.poll ? (this.$refs.poll as any).get() : undefined
				}
			};

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		deleteDraft() {
			const data = JSON.parse(localStorage.getItem('drafts') || '{}');

			delete data[this.draftId];

			localStorage.setItem('drafts', JSON.stringify(data));
		},

		post() {
			this.posting = true;
			this.$root.api('notes/create', {
				text: this.text == '' ? undefined : this.text,
				fileIds: this.files.length > 0 ? this.files.map(f => f.id) : undefined,
				replyId: this.reply ? this.reply.id : undefined,
				renoteId: this.renote ? this.renote.id : this.quoteId ? this.quoteId : undefined,
				poll: this.poll ? (this.$refs.poll as any).get() : undefined,
				cw: this.useCw ? this.cw || '' : undefined,
				visibility: this.visibility,
				visibleUserIds: this.visibility == 'specified' ? this.visibleUsers.map(u => u.id) : undefined,
			}).then(data => {
				this.clear();
				this.deleteDraft();
				this.$emit('posted');
				if (opts.onSuccess) opts.onSuccess(this);
			}).catch(err => {
				if (opts.onSuccess) opts.onFailure(this);
			}).then(() => {
				this.posting = false;
			});

			if (this.text && this.text != '') {
				const hashtags = parse(this.text).filter(x => x.node.type === 'hashtag').map(x => x.node.props.hashtag);
				const history = JSON.parse(localStorage.getItem('hashtags') || '[]') as string[];
				localStorage.setItem('hashtags', JSON.stringify(unique(hashtags.concat(history))));
			}
		},

		cancel() {
			this.$emit('cancel');
			this.close();
		}
	}
});
</script>

<style lang="stylus" scoped>
.gafaadew
	position relative
	max-width 500px
	width calc(100% - 16px)
	margin 8px auto

	@media (min-width 500px)
		margin 16px auto
		width calc(100% - 32px)

		> .form
			box-shadow 0 8px 32px rgba(#000, 0.1)

	@media (min-width 600px)
		margin 32px auto

	> .form
		background var(--face)
		border-radius 8px
		box-shadow 0 0 2px rgba(#000, 0.1)

		> header
			z-index 1000
			height 50px
			box-shadow 0 1px 0 0 var(--mobilePostFormDivider)

			> .cancel
				padding 0
				width 50px
				line-height 50px
				font-size 24px
				color var(--text)

			> div
				position absolute
				top 0
				right 0
				color var(--text)

				> .text-count
					line-height 50px

				> .submit
					margin 8px
					padding 0 16px
					line-height 34px
					vertical-align bottom
					color var(--primaryForeground)
					background #5da1c1
					border-radius 4px

					&:disabled
						opacity 0.7

		> .form
			max-width 500px
			margin 0 auto

			> .preview
				padding 16px

			> .with-quote
				margin 0 0 8px 0
				color #5da1c1

				> button
					padding 4px 8px
					color var(--primaryAlpha04)

					&:hover
						color var(--primaryAlpha06)

					&:active
						color var(--primaryDarken30)

			> .to-specified
				margin 0 0 8px 0
				color #5da1c1

				> .visibleUsers
					display inline
					top -1px
					font-size 14px

					> span
						margin-left 14px

						> button
							padding 4px 8px
							color var(--primaryAlpha04)

							&:hover
								color var(--primaryAlpha06)

							&:active
								color var(--primaryDarken30)

			> .local-only
				margin 0 0 8px 0
				color #5da1c1

			> input
				z-index 1

			> input
			> textarea
				display block
				padding 12px
				margin 0
				width 100%
				font-size 16px
				color var(--inputText)
				background var(--mobilePostFormTextareaBg)
				border none
				border-radius 0
				box-shadow 0 1px 0 0 var(--mobilePostFormDivider)

				&:disabled
					opacity 0.5

			> textarea
				max-width 100%
				min-width 100%
				min-height 80px

			> .dp-uploader
				margin 8px 0 0 0
				padding 8px

			> .file
				display none

			> footer
				white-space nowrap
				overflow auto
				-webkit-overflow-scrolling touch
				overflow-scrolling touch

				> *
					display inline-block
					padding 0
					margin 0
					width 48px
					height 48px
					font-size 20px
					color var(--mobilePostFormButton)
					background transparent
					outline none
					border none
					border-radius 0
					box-shadow none

	> .hashtags
		margin 8px

		> *
			margin-right 8px

</style>