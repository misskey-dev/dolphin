<template>
<a class="dp-logo" href="https://github.com/syuilo/dolphin" target="_blank">
	<img svg-inline src="../../../assets/dolphin-logo-square.svg" alt="Dolphin" class="logo">
</a>
</template>

<script lang="ts">
import Vue from 'vue';
import VanillaTilt from 'vanilla-tilt';

export default Vue.extend({
	mounted() {
		VanillaTilt.init(this.$el, {
			max: 25,
			speed: 400,
			scale: 1.2
		});
	}
});
</script>

<style lang="scss" scoped>
.dp-logo {
	display: block;
	background: #fff;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	transform-style: preserve-3d;
	
	> * {
		vertical-align: bottom;
		transform: translateZ(16px);
	}
}
</style>
