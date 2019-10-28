<template>
<section class="_section dp-instance-proxy">
	<div class="title"><fa :icon="faGhost"/> {{ $t('proxyAccount') }}</div>
	<div class="content">
		<x-input v-model="proxyAccount" style="margin: 0;"><template #prefix>@</template>{{ $t('proxyAccount') }}<template #desc>{{ $t('proxyAccountDescription') }}</template></x-input>
	</div>
	<div class="footer">
		<x-button primary @click="save()">{{ $t('save') }}</x-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faGhost } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XButton from '../components/ui/button.vue';
import XInput from '../components/ui/input.vue';

export default Vue.extend({
	components: {
		XButton,
		XInput,
	},

	props: {
		meta: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			proxyAccount: this.meta.proxyAccount,
			faTrashAlt, faGhost
		}
	},

	methods: {
		save() {
			this.$root.api('admin/update-meta', {
				proxyAccount: this.proxyAccount,
			}).then(() => {
				this.$root.dialog({
					type: 'success',
					splash: true,
				});
			}).catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			});
		}
	}
});
</script>
