<template>
<section class="dp-settings-page-reaction _section">
	<div class="title"><fa :icon="faLaugh"/> {{ $t('reaction') }}</div>
	<div class="content">
		<x-textarea v-model="reactions">
			{{ $t('reaction') }}<template #desc>{{ $t('reactionSettingDescription') }}</template>
		</x-textarea>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faLaugh } from '@fortawesome/free-regular-svg-icons';
import XTextarea from '../components/ui/textarea.vue';
import i18n from '../i18n';

export default Vue.extend({
	i18n,

	components: {
		XTextarea,
	},
	
	data() {
		return {
			faLaugh
		}
	},

	computed: {
		reactions: {
			get() { return this.$store.state.settings.reactions.join('\n'); },
			set(value: string) { this.$store.dispatch('settings/set', { key: 'reactions', value: value.trim().split('\n') }); }
		},
	},
});
</script>

<style lang="scss" scoped>

</style>
