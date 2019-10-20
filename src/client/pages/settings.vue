<template>
<div class="dp-settings-page">
	<header>{{ $t('settings') }}</header>
	<x-profile-setting/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XProfileSetting from './settings.profile.vue';

export default Vue.extend({
	components: {
		XProfileSetting
	},

	data() {
		return {
		}
	},

	methods: {
	}
});
</script>

<style lang="scss" scoped>
.dp-settings-page {
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
