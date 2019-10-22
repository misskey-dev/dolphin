<template>
<div>
	<x-notes :pagination="pagination" :detail="true"/>
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
				endpoint: 'notes/mentions',
				limit: 10,
				params: () => ({
					visibility: 'specified'
				})
			}
		};
	},
});
</script>
