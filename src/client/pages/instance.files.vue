<template>
<section class="_section dp-instance-files">
	<div class="title">{{ $t('files') }}</div>
	<div class="content">
		<x-switch v-model="cacheRemoteFiles">{{ $t('cacheRemoteFiles') }}<template #desc>{{ $t('cacheRemoteFilesDescription') }}</template></x-switch>
		<x-input v-model="remoteDriveCapacityMb" type="number" :disabled="!cacheRemoteFiles" style="margin-bottom: 0;">{{ $t('remoteFilesCacheCapacityPerAccount') }}<template #suffix>MB</template></x-input>
	</div>
	<div class="footer">
		<x-button primary @click="save()">{{ $t('save') }}</x-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XButton from '../components/ui/button.vue';
import XInput from '../components/ui/input.vue';
import XSwitch from '../components/ui/switch.vue';

export default Vue.extend({
	components: {
		XButton,
		XInput,
		XSwitch,
	},

	props: {
		meta: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			cacheRemoteFiles: this.meta.cacheRemoteFiles,
			remoteDriveCapacityMb: this.meta.driveCapacityPerRemoteUserMb,
			faTrashAlt, faPlus
		}
	},

	methods: {
		save() {
			this.$root.api('admin/update-meta', {
				cacheRemoteFiles: this.cacheRemoteFiles,
				remoteDriveCapacityMb: this.remoteDriveCapacityMb,
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
