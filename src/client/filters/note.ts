import Vue from 'vue';

Vue.filter('notePage', note => {
	return `/note/${note.id}`;
});
