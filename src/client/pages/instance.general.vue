<template>
<section class="_section dp-instance-general">
	<div class="title"><fa :icon="faCog"/> {{ $t('general') }}</div>
	<div class="content">
		<b>Dolphin v{{ version }}</b>
		<x-button @click="$router.push('/federation')">{{ $t('federation') }}</x-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import XButton from '../components/ui/button.vue';
import { version } from '../config';
import i18n from '../i18n';

export default Vue.extend({
	i18n,

	components: {
		XButton,
	},

	props: {
		meta: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			version: version,
			faCog
		}
	},

	methods: {
	}
});
</script>
