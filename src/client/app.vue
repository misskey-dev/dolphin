<template>
<div class="dp-app">
	<main>
		<transition name="fade-in-top" mode="out-in">
			<router-view></router-view>
		</transition>
		<div class="powerd-by" :style="{ visibility: $store.getters.isSignedIn ? 'hidden' : 'visible' }">
			<span>Powered by</span>
			<x-logo class="logo"/>
		</div>
	</main>
	<x-ui/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from './i18n';

export default Vue.extend({
	i18n,

	components: {
		XNotifications: () => import('./components/notifications.vue').then(m => m.default),
		XLogo: () => import('./components/logo.vue').then(m => m.default),
		XUi: () => import('./app.ui.vue').then(m => m.default),
	},
});
</script>

<style lang="scss" scoped>
@import './theme';

.dp-app {
	> main {
		max-width: 650px;
		margin: 0 auto;
		padding: 32px;
		box-sizing: border-box;

		@media (max-width: 700px) {
			padding: 16px;
		}

		@media (max-width: 500px) {
			padding: 8px;
		}

		> .powerd-by {
			color: #fff;
			font-size: 14px;
			text-align: center;
			opacity: 0.7;
			margin-top: 16px;
			transition: opacity 1s ease;

			@media (max-width: 500px) {
				margin-top: 8px;
			}

			> .logo {
				display: block;
				width: 50px;
				margin: 8px auto 0 auto;
			}
		}
	}
}
</style>
