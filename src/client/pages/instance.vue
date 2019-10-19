<template>
<div v-if="meta" class="dp-instance-page">
	<header>{{ $t('instance') }}</header>
	<section>
		<div class="title">{{ $t('users') }}</div>
		<div class="content">
			<ui-button @click="addUser()">{{ $t('addUser') }}</ui-button>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			meta: null
		}
	},

	created() {
		this.$root.getMeta().then(meta => {
			this.meta = meta;
		});
	},

	methods: {
		async addUser() {
			const { canceled: canceled1, result: username } = await this.$root.dialog({
				title: this.$t('enterNewUserUsername'),
				input: true
			});
			if (canceled1) return;

			const { canceled: canceled2, result: password } = await this.$root.dialog({
				title: this.$t('enterNewUserPassword'),
				input: { type: 'password' }
			});
			if (canceled2) return;

			this.$root.api('admin/accounts/create', {
				username: username,
				password: password,
			}).then(res => {
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.id
				});
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.dp-instance-page {
	> header {
		padding: 16px;
		margin-bottom: 16px;
		font-weight: bold;
		text-align: center;
		background: rgba(0, 0, 0, 0.3);
		color: #fff;
		-webkit-backdrop-filter: blur(16px);
		backdrop-filter: blur(16px);
		border-radius: 6px;
	}

	> section {
		overflow: hidden;
		background: #fff;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border-radius: 6px;

		> .title {
			margin: 0;
			padding: 16px;
			font-size: 1.2em;
			border-bottom: solid 1px rgba(0, 0, 0, 0.1);
		}

		> .content {
			padding: 16px;
		}
	}
}
</style>
