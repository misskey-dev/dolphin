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
				bottom: '0px',
				duration: 500,
				easing: 'easeOutQuad'
			});

			setTimeout(() => {
				anime({
					targets: this.$el,
					bottom: `-${this.$el.offsetHeight}px`,
					duration: 500,
					easing: 'easeOutQuad',
					complete: () => this.destroyDom()
				});
			}, 6000);
		});
	}
});
</script>

<style lang="scss" scoped>
.dp-toast {
	$height: 88px;

	position: fixed;
	z-index: 10000;
	left: 0;
	right: 0;
	width: calc(100% - 144px - 16px);
	max-width: 300px;
	box-sizing: border-box;
	height: $height;
	margin: 0 auto;
	padding: 8px 8px 16px 8px;
	pointer-events: none;
	font-size: 80%;
	bottom: -($height);

	> .notification {
		height: 100%;
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		background-color: rgba(255, 255, 255, 0.5);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		overflow: hidden;
	}
}
</style>
