<template>
<transition-group
	name="staggered-fade"
	tag="div"
	:css="false"
	@before-enter="beforeEnter"
	@enter="enter"
	@leave="leave"
>
	<slot></slot>
</transition-group>
</template>

<script lang="ts">
import Vue from 'vue';

const delay = 50;

export default Vue.extend({
	methods: {
		beforeEnter(el) {
			el.style.opacity = 0;
			el.style.transform = 'translateY(-64px)';
		},
		enter(el, done) {
			el.style.transition = 'transform 1s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1)';
			setTimeout(() => {
				el.style.opacity = 1;
				el.style.transform = 'translateY(0px)';
				setTimeout(done, 1000);
			}, delay * el.dataset.index)
		},
		leave(el, done) {
			setTimeout(() => {
				el.style.opacity = 0;
				el.style.transform = 'translateY(64px)';
				setTimeout(done, 1000);
			}, delay * el.dataset.index)
		}
	}
});
</script>

<style lang="scss">
.staggered-fade-move {
	transition: transform 1s;
}
</style>
