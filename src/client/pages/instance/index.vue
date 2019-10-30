<template>
<div v-if="meta" class="dp-instance-page">
	<header>{{ $t('instance') }}</header>

	<section class="_section">
		<div class="title"><fa :icon="faCog"/> {{ $t('general') }}</div>
		<div class="content">
			<b>Dolphin v{{ version }}</b>
		</div>
	</section>

	<section class="_section">
		<div class="title"><fa :icon="faCloud"/> {{ $t('files') }}</div>
		<div class="content">
			<x-switch v-model="cacheRemoteFiles">{{ $t('cacheRemoteFiles') }}<template #desc>{{ $t('cacheRemoteFilesDescription') }}</template></x-switch>
			<x-input v-model="remoteDriveCapacityMb" type="number" :disabled="!cacheRemoteFiles" style="margin-bottom: 0;">{{ $t('remoteFilesCacheCapacityPerAccount') }}<template #suffix>MB</template></x-input>
		</div>
		<div class="footer">
			<x-button primary @click="save()">{{ $t('save') }}</x-button>
		</div>
	</section>

	<section class="_section">
		<div class="title"><fa :icon="faGhost"/> {{ $t('proxyAccount') }}</div>
		<div class="content">
			<x-input v-model="proxyAccount" style="margin: 0;"><template #prefix>@</template>{{ $t('proxyAccount') }}<template #desc>{{ $t('proxyAccountDescription') }}</template></x-input>
		</div>
		<div class="footer">
			<x-button primary @click="save()">{{ $t('save') }}</x-button>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faGhost, faCog, faPlus, faCloud } from '@fortawesome/free-solid-svg-icons';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XButton from '../../components/ui/button.vue';
import XInput from '../../components/ui/input.vue';
import XSwitch from '../../components/ui/switch.vue';
import { version } from '../../config';
import i18n from '../../i18n';

export default Vue.extend({
	i18n,

	metaInfo() {
		return {
			title: this.$t('instance')
		};
	},

	components: {
		XButton,
		XInput,
		XSwitch,
	},

	data() {
		return {
			version,
			meta: null,
			proxyAccount: null,
			cacheRemoteFiles: false,
			remoteDriveCapacityMb: 0,
			faTrashAlt, faGhost, faCog, faPlus, faCloud
		}
	},

	created() {
		this.$root.getMeta().then(meta => {
			this.meta = meta;
			this.proxyAccount = this.meta.proxyAccount;
			this.cacheRemoteFiles = this.meta.cacheRemoteFiles;
			this.remoteDriveCapacityMb = this.meta.driveCapacityPerRemoteUserMb;
		});
	},

	methods: {
		save() {
			this.$root.api('admin/update-meta', {
				proxyAccount: this.proxyAccount,
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
