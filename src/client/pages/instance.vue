<template>
<div v-if="meta" class="dp-instance-page">
	<header>{{ $t('instance') }}</header>
	<x-general :meta="meta"/>
	<x-monitor/>
	<x-queue/>
	<x-files :meta="meta"/>
	<x-emojis/>
	<x-users/>
	<x-proxy :meta="meta"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XGeneral from './instance.general.vue';
import XMonitor from './instance.monitor.vue';
import XQueue from './instance.queue.vue';
import XFiles from './instance.files.vue';
import XEmojis from './instance.emojis.vue';
import XUsers from './instance.users.vue';
import XProxy from './instance.proxy.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('instance')
		};
	},

	components: {
		XGeneral,
		XMonitor,
		XQueue,
		XEmojis,
		XUsers,
		XFiles,
		XProxy,
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
