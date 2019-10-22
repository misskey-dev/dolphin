<template>
<div class="dp-toast">
	<x-notification :notification="notification" class="notification"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import anime from 'animejs';
import XNotification from './notification.vue';

export default Vue.extend({
	components: {
		XNotification
	},
	props: {
		notification: {
			type: Object,
			required: true
		}
	},
	mounted() {
		this.$nextTick(() => {
			anime({
				targets: this.$el,
				left: '0px',
				opacity: 1,
				duration: 500,
				easing: 'easeOutQuint'
			});

			setTimeout(() => {
				anime({
					targets: this.$el,
					left: `-${this.$el.offsetWidth}px`,
					opacity: 0,
					duration: 500,
					easing: 'easeOutQuint',
					complete: () => this.destroyDom()
				});
			}, 6000);
		});
	}
});
</script>

<style lang="scss" scoped>
.dp-toast {
	$width: 240px;

	position: fixed;
	z-index: 10000;
	left: -($width);
	width: $width;
	height: 64px;
	top: 32px;
	padding: 0 32px;
	pointer-events: none;
	opacity: 0;

	@media (max-width: 700px) {
		top: initial;
		bottom: 112px;
		padding: 0 16px;
	}

	@media (max-width: 500px) {
		bottom: 92px;
		padding: 0 8px;
	}

	> .notification {
		height: 100%;
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.5);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		color: #0c0c0c;
		overflow: hidden;
	}
}
</style>
