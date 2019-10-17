<template>
<form class="dp-signin" :class="{ signing, totpLogin }" @submit.prevent="onSubmit">
	<div class="avatar" :style="{ backgroundImage: user ? `url('${ user.avatarUrl }')` : null }" v-show="withAvatar"></div>
	<div>
		<ui-input v-model="username" type="text" pattern="^[a-zA-Z0-9_]+$" spellcheck="false" autofocus required @input="onUsernameChange">
			<span>{{ $t('username') }}</span>
			<template #prefix>@</template>
			<template #suffix>@{{ host }}</template>
		</ui-input>
		<ui-input v-model="password" type="password" :with-password-toggle="true" v-if="!user || user && !user.usePasswordLessLogin" required>
			<span>{{ $t('password') }}</span>
			<template #prefix><fa :icon="faLock"/></template>
		</ui-input>
		<footer>
			<ui-button type="submit" :disabled="signing">{{ signing ? $t('signing-in') : $t('@.signin') }}</ui-button>
		</footer>
	</div>
</form>
</template>

<script lang="ts">
import Vue from 'vue';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import i18n from '../i18n';
import { apiUrl, host } from '../config';
import { toUnicode } from 'punycode';

export default Vue.extend({
	i18n: i18n('common/views/components/signin.vue'),

	props: {
		withAvatar: {
			type: Boolean,
			required: false,
			default: true
		}
	},

	data() {
		return {
			signing: false,
			user: null,
			username: '',
			password: '',
			token: '',
			apiUrl,
			host: toUnicode(host),
			meta: null,
			faLock
		};
	},

	created() {
		this.$root.getMeta().then(meta => {
			this.meta = meta;
		});
	},

	methods: {
		onUsernameChange() {
			this.$root.api('users/show', {
				username: this.username
			}).then(user => {
				this.user = user;
			}, () => {
				this.user = null;
			});
		},

		onSubmit() {
			this.signing = true;

			this.$root.api('signin', {
				username: this.username,
				password: this.password,
			}).then(res => {
				localStorage.setItem('i', res.token);
				location.reload();
			}).catch(() => {
				this.$root.dialog({
					type: 'error',
					text: this.$t('login-failed')
				});
				this.signing = false;
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.dp-signin
	max-width: 450px;
	background: #fff;
	border-radius: 6px;
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	padding: 32px;

	> .avatar
		margin 0 auto 0 auto
		width 64px
		height 64px
		background #ddd
		background-position center
		background-size cover
		border-radius 100%

	> div
		> footer
			> *
				margin: 0 auto;
</style>
