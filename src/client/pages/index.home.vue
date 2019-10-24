<template>
<div class="dp-home">
	<x-home-timeline @before="before()" @after="after()"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Progress from '../scripts/loading';
import XHomeTimeline from './index.home.timeline.vue';

export default Vue.extend({
	components: {
		XHomeTimeline
	},
	methods: {
		before() {
			Progress.start();
		},
		after() {
			Progress.done();
		}
	}
});
</script>
