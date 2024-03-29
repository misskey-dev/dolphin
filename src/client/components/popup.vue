<template>
<div class="dp-popup">
	<transition name="bg-fade" appear>
		<div class="bg" ref="bg" @click="close()" v-if="show"></div>
	</transition>
	<transition name="popup" appear @after-leave="() => { $emit('closed'); destroyDom(); }">
		<div class="content" ref="content" v-if="show"><slot></slot></div>
	</transition>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		source: {
			required: true
		},
	},
	data() {
		return {
			show: true,
		};
	},
	mounted() {
		this.$nextTick(() => {
			const popover = this.$refs.content as any;

			const rect = this.source.getBoundingClientRect();
			const width = popover.offsetWidth;
			const height = popover.offsetHeight;

			let left;
			let top;

			if (this.$root.isMobile) {
				const x = rect.left + window.pageXOffset + (this.source.offsetWidth / 2);
				const y = rect.top + window.pageYOffset + (this.source.offsetHeight / 2);
				left = (x - (width / 2));
				top = (y - (height / 2));
				popover.style.transformOrigin = 'center';
			} else {
				const x = rect.left + window.pageXOffset + (this.source.offsetWidth / 2);
				const y = rect.top + window.pageYOffset + this.source.offsetHeight;
				left = (x - (width / 2));
				top = y;
			}

			if (left + width - window.pageXOffset > window.innerWidth) {
				left = window.innerWidth - width + window.pageXOffset;
				popover.style.transformOrigin = 'center';
			}

			if (top + height - window.pageYOffset > window.innerHeight) {
				top = window.innerHeight - height + window.pageYOffset;
				popover.style.transformOrigin = 'center';
			}

			if (top < 0) {
				top = 0;
			}

			popover.style.left = left + 'px';
			popover.style.top = top + 'px';
		});
	},
	methods: {
		close() {
			this.show = false;
			(this.$refs.bg as any).style.pointerEvents = 'none';
			(this.$refs.content as any).style.pointerEvents = 'none';
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.popup-enter-active, .popup-leave-active {
	transition: opacity 0.3s, transform 0.3s !important;
}
.popup-enter, .popup-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.bg-fade-enter-active, .bg-fade-leave-active {
	transition: opacity 0.3s !important;
}
.bg-fade-enter, .bg-fade-leave-to {
	opacity: 0;
}

.dp-popup {
	> .bg {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		width: 100%;
		height: 100%;
		background: var(--modalBg)
	}

	> .content {
		position: absolute;
		z-index: 10001;
		background: var(--bg);
		border-radius: 4px;
		box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
		overflow: hidden;
		transform-origin: center top;
	}
}
</style>
