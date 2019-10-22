<template>
<section class="dp-settings-page-import-export _section">
	<div class="title"><fa :icon="faBoxes"/> {{ $t('importAndExport') }}</div>
	<div class="content">
		<ui-select v-model="exportTarget">
			<option value="notes">{{ $t('_exportTargets.all-notes') }}</option>
			<option value="following">{{ $t('_exportTargets.following-list') }}</option>
			<option value="mute">{{ $t('_exportTargets.mute-list') }}</option>
			<option value="blocking">{{ $t('_exportTargets.blocking-list') }}</option>
			<option value="user-lists">{{ $t('_exportTargets.user-lists') }}</option>
		</ui-select>
		<ui-button inline @click="doExport()"><fa :icon="faDownload"/> {{ $t('export') }}</ui-button>
		<ui-button inline @click="doImport()" :disabled="!['following', 'user-lists'].includes(exportTarget)"><fa :icon="faUpload"/> {{ $t('import') }}</ui-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faDownload, faUpload, faBoxes } from '@fortawesome/free-solid-svg-icons';
import i18n from '../i18n';

export default Vue.extend({
	i18n,

	data() {
		return {
			exportTarget: 'notes',
			faDownload, faUpload, faBoxes
		}
	},

	methods: {
		doExport() {
			this.$root.api(
				this.exportTarget == 'notes' ? 'i/export-notes' :
				this.exportTarget == 'following' ? 'i/export-following' :
				this.exportTarget == 'blocking' ? 'i/export-blocking' :
				this.exportTarget == 'user-lists' ? 'i/export-user-lists' :
				null, {})
			.then(() => {
				this.$root.dialog({
					type: 'info',
					text: this.$t('export-requested')
				});
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		},

		doImport() {
			this.$chooseDriveFile().then(file => {
				this.$root.api(
					this.exportTarget == 'following' ? 'i/import-following' :
					this.exportTarget == 'user-lists' ? 'i/import-user-lists' :
					null, {
						fileId: file.id
				}).then(() => {
					this.$root.dialog({
						type: 'info',
						text: this.$t('import-requested')
					});
				}).catch((e: any) => {
					this.$root.dialog({
						type: 'error',
						text: e.message
					});
				});
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.dp-settings-page-import-export {
}
</style>
