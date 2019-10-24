<template>
<x-popup :source="source" ref="popup" @closed="() => { $emit('closed'); destroyDom(); }" v-hotkey.global="keymap">
	<div class="rdfaahpb">
		<div class="buttons" ref="buttons" :class="{ showFocus }">
			<button class="_button" v-for="(reaction, i) in $store.state.settings.reactions" :key="reaction" @click="react(reaction)" @mouseover="onMouseover" @mouseout="onMouseout" :tabindex="i + 1" :title="/^[a-z]+$/.test(reaction) ? $t('@.reactions.' + reaction) : reaction"><x-reaction-icon :reaction="reaction"/></button>
		</div>
		<div class="text">
			<input v-model="text" :placeholder="$t('enterEmoji')" @keyup.enter="reactText" @input="tryReactText" v-autocomplete="{ model: 'text' }">
		</div>
	</div>
</x-popup>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import { emojiRegex } from '../../misc/emoji-regex';
import XReactionIcon from './reaction-icon.vue';
import XPopup from './popup.vue';

export default Vue.extend({
	i18n,

	components: {
		XPopup,
		XReactionIcon,
	},

	props: {
		note: {
			type: Object,
			required: true
		},

		source: {
			required: true
		},

		cb: {
			required: false
		},

		showFocus: {
			type: Boolean,
			required: false,
			default: false
		},

		animation: {
			type: Boolean,
			required: false,
			default: true
		}
	},

	data() {
		return {
			title: this.$t('choose-reaction'),
			text: null,
			focus: null
		};
	},

	computed: {
		keymap(): any {
			return {
				'esc': this.close,
				'enter|space|plus': this.choose,
				'up|k': this.focusUp,
				'left|h|shift+tab': this.focusLeft,
				'right|l|tab': this.focusRight,
				'down|j': this.focusDown,
				'1': () => this.react(this.$store.state.settings.reactions[0]),
				'2': () => this.react(this.$store.state.settings.reactions[1]),
				'3': () => this.react(this.$store.state.settings.reactions[2]),
				'4': () => this.react(this.$store.state.settings.reactions[3]),
				'5': () => this.react(this.$store.state.settings.reactions[4]),
				'6': () => this.react(this.$store.state.settings.reactions[5]),
				'7': () => this.react(this.$store.state.settings.reactions[6]),
				'8': () => this.react(this.$store.state.settings.reactions[7]),
				'9': () => this.react(this.$store.state.settings.reactions[8]),
				'0': () => this.react(this.$store.state.settings.reactions[9]),
			};
		}
	},

	watch: {
		focus(i) {
			this.$refs.buttons.children[i].focus();

			if (this.showFocus) {
				this.title = this.$refs.buttons.children[i].title;
			}
		}
	},

	mounted() {
		this.focus = 0;
	},

	methods: {
		react(reaction) {
			this.$root.api('notes/reactions/create', {
				noteId: this.note.id,
				reaction: reaction
			}).then(() => {
				if (this.cb) this.cb();
				this.$emit('closed');
				this.destroyDom();
			});
		},

		reactText() {
			if (!this.text) return;
			this.react(this.text);
		},

		tryReactText() {
			if (!this.text) return;
			if (!this.text.match(emojiRegex)) return;
			this.reactText();
		},

		onMouseover(e) {
			this.title = e.target.title;
		},

		onMouseout(e) {
			this.title = this.$t('choose-reaction');
		},

		focusUp() {
			this.focus = this.focus == 0 ? 9 : this.focus < 5 ? (this.focus + 4) : (this.focus - 5);
		},

		focusDown() {
			this.focus = this.focus == 9 ? 0 : this.focus >= 5 ? (this.focus - 4) : (this.focus + 5);
		},

		focusRight() {
			this.focus = this.focus == 9 ? 0 : (this.focus + 1);
		},

		focusLeft() {
			this.focus = this.focus == 0 ? 9 : (this.focus - 1);
		},

		choose() {
			this.$refs.buttons.childNodes[this.focus].click();
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.rdfaahpb {
	> div {
		width: 280px;

		> button {
			width: 50px;
			height: 50px;
			font-size: 28px;
			border-radius: 4px;
		}
	}

	> .buttons {
		padding: 4px 4px 8px 4px;
		width: 216px;
		box-sizing: border-box;
		text-align: center;

		&.showFocus {
			> button:focus {
				z-index: 1;

				&:after {
					content: "";
					pointer-events: none;
					position: absolute;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					border: 2px solid rgba($primary, 0.3);
					border-radius: 4px;
				}
			}
		}

		> button {
			padding: 0;
			width: 40px;
			height: 40px;
			font-size: 24px;
			border-radius: 2px;

			> * {
				height: 1em;
			}

			&:hover {
				background: rgba(0, 0, 0, 0.05);
			}

			&:active {
				background: $primary;
				box-shadow: inset 0 0.15em 0.3em rgba(27, 31, 35, 0.15);
			}
		}
	}

	> .text {
		width: 216px;
		padding: 0 8px 8px 8px;
		box-sizing: border-box;

		> input {
			width: 100%;
			padding: 10px;
			margin: 0;
			text-align: center;
			font-size: 16px;
			color: var(--desktopPostFormTextareaFg);
			background: var(--desktopPostFormTextareaBg);
			outline: none;
			border: solid 1px var(--primaryAlpha01);
			border-radius: 4px;
			transition: border-color .2s ease;

			&:hover {
				border-color: var(--primaryAlpha02);
				transition: border-color .1s ease;
			}

			&:focus {
				border-color: var(--primaryAlpha05);
				transition: border-color 0s ease;
			}
		}
	}
}
</style>
