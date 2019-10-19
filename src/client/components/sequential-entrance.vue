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

const delay = 40;

export default Vue.extend({
	methods: {
		beforeEnter(el) {
			el.style.opacity = 0;
			el.style.transform = 'translateY(-64px)';
		},
		enter(el, done) {
			el.style.transition = 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1)';
			setTimeout(() => {
				el.style.opacity = 1;
				el.style.transform = 'translateY(0px)';
				setTimeout(done, 700);
			}, delay * el.dataset.index)
		},
		leave(el, done) {
			setTimeout(() => {
				el.style.opacity = 0;
				el.style.transform = 'translateY(64px)';
				setTimeout(done, 700);
			}, delay * el.dataset.index)
		}
	}
});
</script>

<style lang="scss">
.staggered-fade-move {
	transition: transform 0.7s;
}
</style>
