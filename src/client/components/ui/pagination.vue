<template>
<sequential-entrance class="ui-pagination" mode="out-in">
	<slot :items="items"></slot>
	<div class="more" v-if="more" key="more">
		<x-button :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }" @click="fetchMore()">
			<template v-if="!moreFetching">{{ $t('loadMore') }}</template>
			<template v-if="moreFetching"><fa :icon="faSpinner" pulse fixed-width/></template>
		</x-button>
	</div>
</sequential-entrance>
</template>

<script lang="ts">
import Vue from 'vue';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import XButton from './button.vue';
import paging from '../../scripts/paging';

export default Vue.extend({
	mixins: [
		paging({
			captureWindowScroll: false,
		}),
	],

	components: {
		XButton
	},

	props: {
		pagination: {
			required: true
		},
	},

	data() {
		return {
			faSpinner
		};
	},
});
</script>

<style lang="scss" scoped>
.ui-pagination {
	> *:not(:last-child) {
		margin-bottom: 16px;

		@media (max-width: 500px) {
			margin-bottom: 8px;
		}
	}
}
</style>
