<template>
<form class="dp-setup" @submit.prevent="submit()">
	<h1>Welcome to Dolphin!</h1>
	<div>
		<p>Dolphinのインストールが完了しました。あなたのアカウントを作成してください。</p>
		<ui-input v-model="username" pattern="^[a-zA-Z0-9_]{1,20}$" spellcheck="false" required>
			<span>ユーザー名</span>
			<template #prefix>@</template>
			<template #suffix>@{{ host }}</template>
		</ui-input>
		<ui-input v-model="password" type="password">
			<span>パスワード</span>
			<template #prefix><fa :icon="faLock"/></template>
		</ui-input>
		<footer>
			<ui-button primary type="submit" :disabled="submitting">{{ submitting ? '処理中' : '完了' }}<dp-ellipsis v-if="submitting"/></ui-button>
		</footer>
	</div>
</form>
</template>

<script lang="ts">
import Vue from 'vue';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { host } from '../config';

export default Vue.extend({
	components: {
	},

	data() {
		return {
			username: '',
			password: '',
			submitting: false,
			host,
			faLock
		}
	},

	methods: {
		submit() {
			if (this.submitting) return;
			this.submitting = true;

			this.$root.api('admin/accounts/create', {
				username: this.username,
				password: this.password,
			}).then(() => {
				this.$root.api('signin', {
					username: this.username,
					password: this.password
				}).then(res => {
					localStorage.setItem('i', res.i);
					location.href = '/';
				});
			}).catch(() => {
				this.submitting = false;

				this.$root.dialog({
					type: 'error',
					text: this.$t('some-error')
				});
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.dp-setup
	max-width: 500px;
	background: #fff;
	border-radius: 6px;
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	overflow: hidden;

	> h1
		margin: 0;
		font-size: 1.5em;
		text-align: center;
		padding: 32px;
		background: #5da1c1;
		color: #fff;

	> div
		padding: 32px;

		> p
			margin-top: 0;

		> footer
			> *
				margin 0 auto

</style>
