<template>
<div class="dp-app">
	<transition name="title-left">
		<div class="title" :key="title">
			<h1 v-text="title"></h1>
			<h2 v-text="subTitle"></h2>
		</div>
	</transition>
	<main>
		<transition name="title-top">
			<h1 class="title" v-if="showTitle" v-text="title" :key="title"></h1>
		</transition>
		<transition name="page" mode="out-in">
			<router-view :class="{ withTitle: showTitle }"></router-view>
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

	metaInfo() {
		return {
			changed: meta => {
				const title = meta.titleChunk.split('|');
				this.title = title.shift().trim();
				this.subTitle = title.join('|').trim();
				this.showTitle = !['index', 'user', 'note'].includes(this.$route.name);
			}
		};
	},

	components: {
		XNotifications: () => import('./components/notifications.vue').then(m => m.default),
		XLogo: () => import('./components/logo.vue').then(m => m.default),
		XUi: () => import('./app.ui.vue').then(m => m.default),
	},

	data() {
		return {
			title: null,
			subTitle: null,
			showTitle: false
		};
	},

	watch:{
		$route(to, from) {
			this.title = null;
			this.subTitle = null;
		}
	}
});
</script>

<style lang="scss" scoped>
@import './theme';

.title-left-enter-active, .title-left-leave-active {
	transition: opacity 0.5s, transform 0.5s !important;
}
.title-left-enter {
	opacity: 0;
	transform: translateX(32px);
}
.title-left-leave-to {
	opacity: 0;
	transform: translateX(-32px);
}

.title-top-enter-active, .title-top-leave-active {
	transition: opacity 0.5s, transform 0.5s !important;
}
.title-top-enter {
	opacity: 0;
	transform: scale(0.9);
}
.title-top-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.page-enter-active, .page-leave-active {
	transition: opacity 0.5s, transform 0.5s !important;
}
.page-enter {
	opacity: 0;
	transform: translateY(-32px);
}
.page-leave-to {
	opacity: 0;
	transform: translateY(32px);
}

.dp-app {
	> .title {
		position: fixed;
		z-index: -1;
		top: 64px;
		width: calc(50% - 352px);
		text-align: right;
		padding-left: 32px;
		box-sizing: border-box;

		@media (max-width: 1024px) {
			display: none;
		}

		> h1 {
			margin: 0;
		}

		> h2 {
			margin: 0;
			opacity: 0.5;
		}
	}

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

		> .title {
			position: absolute;
			z-index: -1;
			margin: 0;
			line-height: 48px;

			@media (min-width: 1025px) {
				display: none;
			}

			@media (max-width: 700px) {
				font-size: 24px;
				line-height: 60px;
				left: 0;
				right: 0;
				text-align: center;
			}

			@media (max-width: 500px) {
				font-size: 18px;
			}
		}

		> .withTitle {
			margin-top: 70px;

			@media (max-width: 500px) {
				margin-top: 60px;
			}

			@media (min-width: 1025px) {
				margin-top: 0;
			}
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
