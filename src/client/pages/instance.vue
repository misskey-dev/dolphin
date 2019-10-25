<template>
<div v-if="meta" class="dp-instance-page">
	<header>{{ $t('instance') }}</header>
	<x-emojis/>
	<x-users/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XEmojis from './instance.emojis.vue';
import XUsers from './instance.users.vue';

export default Vue.extend({
	components: {
		XEmojis,
		XUsers,
	},

	data() {
		return {
			meta: null,
		}
	},

	created() {
		this.$root.getMeta().then(meta => {
			this.meta = meta;
		});
	},
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
}
</style>
