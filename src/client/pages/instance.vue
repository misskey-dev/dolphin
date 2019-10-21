<template>
<div v-if="meta" class="dp-instance-page">
	<header>{{ $t('instance') }}</header>
	<section class="_section users">
		<div class="title">{{ $t('users') }}</div>
		<div class="content">
			<ui-pagination :pagination="usersPagination" #default="{items}" class="users">
				<div class="user" v-for="(user, i) in items" :key="user.id" :data-index="i">
					<dp-avatar :user="user" class="avatar"/>
					<div class="body">
						<dp-user-name :user="user"/>
						<dp-acct :user="user"/>
					</div>
				</div>
			</ui-pagination>
		</div>
		<div class="footer">
			<ui-button primary @click="addUser()">{{ $t('addUser') }}</ui-button>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			meta: null,
			usersPagination: {
				endpoint: 'admin/show-users',
				limit: 10,
				offsetMode: true
			},
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
				title: this.$t('username'),
				input: true
			});
			if (canceled1) return;

			const { canceled: canceled2, result: password } = await this.$root.dialog({
				title: this.$t('password'),
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

	> .users {
		> .content {
			> .users {
				> .user {
					display: flex;

					> .avatar {
						width: 50px;
						height: 50px;
					}

					> .body {
						padding: 8px;
					}
				}
			}
		}
	}
}
</style>
