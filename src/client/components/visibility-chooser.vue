<template>
<div class="gqyayizv">
	<div class="backdrop" ref="backdrop" @click="close"></div>
	<div class="popover" ref="popover">
		<button class="_button" @click="choose('public')" :class="{ active: v == 'public' }">
			<div><fa :icon="faGlobe"/></div>
			<div>
				<span>{{ $t('_visibility.public') }}</span>
				<span>{{ $t('_visibility.publicDescription') }}</span>
			</div>
		</button>
		<button class="_button" @click="choose('followers')" :class="{ active: v == 'followers' }">
			<div><fa :icon="faUnlock"/></div>
			<div>
				<span>{{ $t('_visibility.followers') }}</span>
				<span>{{ $t('_visibility.followersDescription') }}</span>
			</div>
		</button>
		<button class="_button" @click="choose('specified')" :class="{ active: v == 'specified' }">
			<div><fa :icon="faEnvelope"/></div>
			<div>
				<span>{{ $t('_visibility.specified') }}</span>
				<span>{{ $t('_visibility.specifiedDescription') }}</span>
			</div>
		</button>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faGlobe, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import anime from 'animejs';

export default Vue.extend({
	i18n,
	props: {
		source: {
			required: true
		},
		currentVisibility: {
			type: String,
			required: false
		}
	},
	data() {
		return {
			v: this.$store.state.settings.rememberNoteVisibility ? (this.$store.state.device.visibility || this.$store.state.settings.defaultNoteVisibility) : (this.currentVisibility || this.$store.state.settings.defaultNoteVisibility),
			faGlobe, faUnlock, faEnvelope
		}
	},
	mounted() {
		this.$nextTick(() => {
			const popover = this.$refs.popover as any;

			const rect = this.source.getBoundingClientRect();
			const width = popover.offsetWidth;
			const height = popover.offsetHeight;

			const x = rect.left + window.pageXOffset + (this.source.offsetWidth / 2);
			const y = rect.top + window.pageYOffset + this.source.offsetHeight;
			const left = (x - (width / 2));
			const top = y;

			if (left + width > window.innerWidth) {
				left = window.innerWidth - width;
			}

			popover.style.left = left + 'px';
			popover.style.top = top + 'px';

			anime({
				targets: this.$refs.backdrop,
				opacity: 1,
				duration: 100,
				easing: 'linear'
			});

			anime({
				targets: this.$refs.popover,
				opacity: 1,
				scale: [0.5, 1],
				duration: 500,
			});
		});
	},
	methods: {
		choose(visibility) {
			if (this.$store.state.settings.rememberNoteVisibility) {
				this.$store.commit('device/setVisibility', visibility);
			}
			this.$emit('chosen', visibility);
			this.destroyDom();
		},
		close() {
			(this.$refs.backdrop as any).style.pointerEvents = 'none';
			anime({
				targets: this.$refs.backdrop,
				opacity: 0,
				duration: 200,
				easing: 'linear'
			});

			(this.$refs.popover as any).style.pointerEvents = 'none';
			anime({
				targets: this.$refs.popover,
				opacity: 0,
				scale: 0.5,
				duration: 200,
				easing: 'easeInBack',
				complete: () => this.destroyDom()
			});
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.gqyayizv {
	position: initial;

	> .backdrop {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
		opacity: 0;
	}

	> .popover {
		$bgcolor: #fff;
		position: absolute;
		z-index: 10001;
		width: 240px;
		padding: 8px 0;
		background: $bgcolor;
		border-radius: 4px;
		box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
		transform: scale(0.5);
		opacity: 0;

		> button {
			display: flex;
			padding: 8px 14px;
			font-size: 12px;
			text-align: left;
			width: 100%;
			box-sizing: border-box;

			&:hover {
				background: rgba(0, 0, 0, 0.05);
			}

			&:active {
				background: rgba(0, 0, 0, 0.1);
			}

			&.active {
				color: #fff;
				background: $primary;
			}

			> *:first-child {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-right: 10px;
				width: 16px;
				top: 0;
				bottom: 0;
				margin-top: auto;
				margin-bottom: auto;
			}

			> *:last-child {
				flex: 1 1 auto;

				> span:first-child {
					display: block;
					font-weight: bold;
				}

				> span:last-child:not(:first-child) {
					opacity: 0.6;
				}
			}
		}
	}
}
</style>
