<template>
<div>
	<x-notes :pagination="pagination" :detail="true" :extract="items => items.map(item => item.note)"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XNotes from '../components/notes.vue';

export default Vue.extend({
	components: {
		XNotes
	},

	data() {
		return {
			pagination: {
				endpoint: 'i/favorites',
				limit: 10,
				params: () => ({
				})
			}
		};
	},
});
</script>
