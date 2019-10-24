<template>
<div class="dp-settings-page">
	<header>{{ $t('settings') }}</header>
	<x-profile-setting/>
	<x-privacy-setting/>
	<x-reaction-setting/>
	<x-import-export/>
	<x-drive/>
	<x-button @click="$root.signout()">{{ $t('logout') }}</x-button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import XProfileSetting from './settings.profile.vue';
import XPrivacySetting from './settings.privacy.vue';
import XImportExport from './settings.import-export.vue';
import XDrive from './settings.drive.vue';
import XReactionSetting from './settings.reaction.vue';
import XButton from '../components/ui/button.vue';

export default Vue.extend({
	components: {
		XProfileSetting,
		XPrivacySetting,
		XImportExport,
		XDrive,
		XReactionSetting,
		XButton,
	},
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
