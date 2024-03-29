<template>
<section class="dp-settings-page-import-export _section">
	<div class="title"><fa :icon="faBoxes"/> {{ $t('importAndExport') }}</div>
	<div class="content">
		<input ref="file" type="file" style="display: none;" @change="onChangeFile"/>
		<x-select v-model="exportTarget" style="margin-top: 0;">
			<option value="notes">{{ $t('_exportOrImport.allNotes') }}</option>
			<option value="following">{{ $t('_exportOrImport.followingList') }}</option>
			<option value="user-lists">{{ $t('_exportOrImport.userLists') }}</option>
			<option value="mute">{{ $t('_exportOrImport.muteList') }}</option>
			<option value="blocking">{{ $t('_exportOrImport.blockingList') }}</option>
		</x-select>
		<x-button inline @click="doExport()"><fa :icon="faDownload"/> {{ $t('export') }}</x-button>
		<x-button inline @click="doImport()" :disabled="!['following', 'user-lists'].includes(exportTarget)"><fa :icon="faUpload"/> {{ $t('import') }}</x-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faDownload, faUpload, faBoxes } from '@fortawesome/free-solid-svg-icons';
import XButton from '../components/ui/button.vue';
import XSelect from '../components/ui/select.vue';
import i18n from '../i18n';
import { apiUrl } from '../config';

export default Vue.extend({
	i18n,

	components: {
		XButton,
		XSelect,
	},

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
					text: this.$t('exportRequested')
				});
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		},

		doImport() {
			(this.$refs.file as any).click();
		},

		onChangeFile() {
			const [file] = Array.from((this.$refs.file as any).files);
			
			const data = new FormData();
			data.append('file', file);
			data.append('i', this.$store.state.i.token);

			const dialog = this.$root.dialog({
				type: 'waiting',
				text: this.$t('uploading') + '...',
				showOkButton: false,
				showCancelButton: false,
				cancelableByBgClick: false
			});

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: data
			})
			.then(response => response.json())
			.then(f => {
				this.reqImport(f);
			})
			.catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e
				});
			})
			.finally(() => {
				dialog.close();
			});
		},

		reqImport(file) {
			this.$root.api(
				this.exportTarget == 'following' ? 'i/import-following' :
				this.exportTarget == 'user-lists' ? 'i/import-user-lists' :
				null, {
					fileId: file.id
			}).then(() => {
				this.$root.dialog({
					type: 'info',
					text: this.$t('importRequested')
				});
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		}
	}
});
</script>
