<template>
<div class="dp-home">
	<x-home-timeline/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XHomeTimeline from './home-timeline.vue';

export default Vue.extend({
	components: {
		XHomeTimeline
	}
});
</script>

<style lang="stylus" scoped>
.dp-home
	padding 32px

	> *
		max-width 500px
		margin 0 auto

</style>
