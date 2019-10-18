<template>
<div class="dp-app">
	<main>
		<router-view v-hotkey.global="keymap"></router-view>
	</main>
	<button v-if="$store.getters.isSignedIn" class="button post" @click="post()"><fa :icon="faPencilAlt"/></button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import i18n from './i18n';
import { search } from './scripts/search';

export default Vue.extend({
	i18n: i18n(),

	data() {
		return {
			searching: false,
			faPencilAlt
		};
	},

	computed: {
		keymap(): any {
			return {
				'p|n': this.post,
				's': this.search,
			};
		}
	},

	methods: {
		post() {
			this.$root.post();
		},

		search() {
			if (this.searching) return;

			this.$root.dialog({
				title: this.$t('search'),
				input: true
			}).then(async ({ canceled, result: query }) => {
				if (canceled) return;

				this.searching = true;
				search(this, query).finally(() => {
					this.searching = false;
				});
			});
		},
	}
});
</script>

<style lang="scss" scoped>
@import './theme';

.dp-app {
	> .button {
		position: fixed;
		z-index: 1000;
		bottom: 28px;
		padding: 0;
		width: 64px;
		height: 64px;
		border: none;
		border-radius: 100%;
		box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);

		> * {
			font-size: 24px;
		}

		&.nav {
			left: 28px;
			background: var(--secondary);
			color: var(--text);

			> i {
				position: absolute;
				top: 0;
				left: 0;
				color: var(--notificationIndicator);
				font-size: 16px;
				animation: blink 1s infinite;
			}
		}

		&.post {
			right: 28px;
			background: $primary;
			color: #fff;
		}
	}
}
</style>
