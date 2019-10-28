<template>
<div class="dp-modal">
	<transition name="bg-fade" appear>
		<div class="bg" ref="bg" v-if="show"></div>
	</transition>
	<transition name="modal" appear @after-leave="() => { $emit('closed'); destroyDom(); }">
		<div class="content" ref="content" v-if="show" :style="{ width: width + 'px', height: height + 'px' }"><slot></slot></div>
	</transition>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		width: {
			type: Number,
			required: true,
		},
		height: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			show: true,
		};
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

.modal-enter-active, .modal-leave-active {
	transition: opacity 0.3s, transform 0.3s !important;
}
.modal-enter, .modal-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.bg-fade-enter-active, .bg-fade-leave-active {
	transition: opacity 0.3s !important;
}
.bg-fade-enter, .bg-fade-leave-to {
	opacity: 0;
}

.dp-modal {
	> .bg {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
	}

	> .content {
		position: fixed;
		z-index: 10000;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: calc(100% - 16px);
		max-height: calc(100% - 16px);
		overflow: auto;
		margin: auto;
	}
}
</style>
