<template>
<x-notes ref="timeline" :pagination="pagination" @inited="() => $emit('loaded')"/>
</template>

<script lang="ts">
import Vue from 'vue';
import XNotes from './notes.vue';

export default Vue.extend({
	components: {
		XNotes
	},

	props: {
		user: {
			type: Object,
			required: true,
		},
		withMedia: {
			type: Boolean,
			required: false,
			default: false
		}
	},

	data() {
		return {
			date: null,
			pagination: {
				endpoint: 'users/notes',
				limit: 10,
				params: init => ({
					userId: this.user.id,
					withFiles: this.withMedia,
					untilDate: init ? undefined : (this.date ? this.date.getTime() : undefined),
				})
			}
		};
	},
});
</script>
