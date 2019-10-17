<template>
<div>
	<x-note v-for="note in notes" :note="note" :key="note.id"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XNote from './note.vue';

export default Vue.extend({
	components: {
		XNote
	},

	data() {
		return {
			notes: []
		};
	},

	created() {
		this.$root.api('notes/timeline', {
			limit: 10
		}).then(notes => {
			this.notes = notes;
		});
	}
});
</script>
