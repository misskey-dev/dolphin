<template>
<div class="dp-note-page">
	<x-note :note="note" :key="note.id"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import Progress from '../scripts/loading';
import XNote from '../components/note.vue';

export default Vue.extend({
	i18n: i18n(),
	components: {
		XNote
	},
	data() {
		return {
			fetching: true,
			note: null
		};
	},
	watch: {
		$route: 'fetch'
	},
	created() {
		this.fetch();
	},
	mounted() {
		document.title = this.$root.instanceName;
	},
	methods: {
		fetch() {
			Progress.start();
			this.fetching = true;

			this.$root.api('notes/show', {
				noteId: this.$route.params.note
			}).then(note => {
				this.note = note;
				this.fetching = false;

				Progress.done();
			});
		}
	}
});
</script>
