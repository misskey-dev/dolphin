<template>
<div class="dp-user-page" v-if="user">
	<div class="profile">
		<h1>{{ user.name }}</h1>
	</div>
	<x-user-timeline :user="user"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XUserTimeline from '../../user-timeline.vue';
import Progress from '../../../scripts/loading';
import parseAcct from '../../../../misc/acct/parse';

export default Vue.extend({
	components: {
		XUserTimeline
	},

	data() {
		return {
			fetching: true,
			user: null,
		};
	},

	watch: {
		$route: 'fetch'
	},

	created() {
		this.fetch();
	},

	methods: {
		fetch() {
			Progress.start();

			this.$root.api('users/show', parseAcct(this.$route.params.user)).then(user => {
				this.user = user;
				this.fetching = false;

				Progress.done();
				document.title = `${Vue.filter('userName')(this.user)} | ${this.$root.instanceName}`;
			});
		},

		menu() {
			this.$root.new(XUserMenu, {
				source: this.$refs.menu,
				user: this.user
			});
		},
	}
});
</script>

<style lang="stylus" scoped>
.dp-user-page
	padding 32px

	> *
		max-width 500px
		margin 0 auto

</style>
