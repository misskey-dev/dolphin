<template>
<div class="dp-settings-page-profile">
	<ui-input v-model="name" :max="30">
		<span>{{ $t('_profile.name') }}</span>
	</ui-input>

	<ui-input :value="$store.state.i.username" readonly>
		<span>{{ $t('_profile.username') }}</span>
		<template #prefix>@</template>
		<template #suffix>@{{ host }}</template>
	</ui-input>

	<ui-textarea v-model="description" :max="500">
		<span>{{ $t('_profile.description') }}</span>
		<template #desc>{{ $t('_profile.youCanIncludeHashtags') }}</template>
	</ui-textarea>

	<ui-input type="file" @change="onAvatarChange">
		<span>{{ $t('_profile.avatar') }}</span>
		<template #icon><fa icon="image"/></template>
		<template #desc v-if="avatarUploading">{{ $t('uploading') }}<mk-ellipsis/></template>
	</ui-input>

	<ui-input type="file" @change="onBannerChange">
		<span>{{ $t('_profile.banner') }}</span>
		<template #icon><fa icon="image"/></template>
		<template #desc v-if="bannerUploading">{{ $t('uploading') }}<mk-ellipsis/></template>
	</ui-input>

	<div class="fields">
		<header>{{ $t('_profile.metadata') }}</header>
		<div class="row">
			<ui-input v-model="fieldName0">{{ $t('_profile.metadataLabel') }}</ui-input>
			<ui-input v-model="fieldValue0">{{ $t('_profile.metadataContent') }}</ui-input>
		</div>
		<div class="row">
			<ui-input v-model="fieldName1">{{ $t('_profile.metadataLabel') }}</ui-input>
			<ui-input v-model="fieldValue1">{{ $t('_profile.metadataContent') }}</ui-input>
		</div>
		<div class="row">
			<ui-input v-model="fieldName2">{{ $t('_profile.metadataLabel') }}</ui-input>
			<ui-input v-model="fieldValue2">{{ $t('_profile.metadataContent') }}</ui-input>
		</div>
		<div class="row">
			<ui-input v-model="fieldName3">{{ $t('_profile.metadataLabel') }}</ui-input>
			<ui-input v-model="fieldValue3">{{ $t('_profile.metadataContent') }}</ui-input>
		</div>
	</div>

	<ui-button @click="save(true)" primary><fa :icon="faSave"/> {{ $t('save') }}</ui-button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faDownload, faUpload, faUnlockAlt, faBoxes, faCogs } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import { apiUrl, host } from '../config';

export default Vue.extend({
	i18n,
	data() {
		return {
			host,
			name: null,
			description: null,
			fieldName0: null,
			fieldValue0: null,
			fieldName1: null,
			fieldValue1: null,
			fieldName2: null,
			fieldValue2: null,
			fieldName3: null,
			fieldValue3: null,
			avatarId: null,
			bannerId: null,
			isBot: false,
			isLocked: false,
			autoAcceptFollowed: false,
			saving: false,
			avatarUploading: false,
			bannerUploading: false,
			exportTarget: 'notes',
			faSave, faDownload, faUpload, faUnlockAlt, faBoxes, faCogs
		}
	},

	created() {
		this.name = this.$store.state.i.name;
		this.description = this.$store.state.i.description;
		this.avatarId = this.$store.state.i.avatarId;
		this.bannerId = this.$store.state.i.bannerId;
		this.isBot = this.$store.state.i.isBot;
		this.isLocked = this.$store.state.i.isLocked;
		this.autoAcceptFollowed = this.$store.state.i.autoAcceptFollowed;

		this.fieldName0 = this.$store.state.i.fields[0] ? this.$store.state.i.fields[0].name : null;
		this.fieldValue0 = this.$store.state.i.fields[0] ? this.$store.state.i.fields[0].value : null;
		this.fieldName1 = this.$store.state.i.fields[1] ? this.$store.state.i.fields[1].name : null;
		this.fieldValue1 = this.$store.state.i.fields[1] ? this.$store.state.i.fields[1].value : null;
		this.fieldName2 = this.$store.state.i.fields[2] ? this.$store.state.i.fields[2].name : null;
		this.fieldValue2 = this.$store.state.i.fields[2] ? this.$store.state.i.fields[2].value : null;
		this.fieldName3 = this.$store.state.i.fields[3] ? this.$store.state.i.fields[3].name : null;
		this.fieldValue3 = this.$store.state.i.fields[3] ? this.$store.state.i.fields[3].value : null;
	},

	methods: {
		onAvatarChange([file]) {
			this.avatarUploading = true;

			const data = new FormData();
			data.append('file', file);
			data.append('i', this.$store.state.i.token);

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: data
			})
				.then(response => response.json())
				.then(f => {
					this.avatarId = f.id;
					this.avatarUploading = false;
				})
				.catch(e => {
					this.avatarUploading = false;
					alert('%18n:@upload-failed%');
				});
		},

		onBannerChange([file]) {
			this.bannerUploading = true;

			const data = new FormData();
			data.append('file', file);
			data.append('i', this.$store.state.i.token);

			fetch(apiUrl + '/drive/files/create', {
				method: 'POST',
				body: data
			})
				.then(response => response.json())
				.then(f => {
					this.bannerId = f.id;
					this.bannerUploading = false;
				})
				.catch(e => {
					this.bannerUploading = false;
					alert('%18n:@upload-failed%');
				});
		},

		save(notify) {
			const fields = [
				{ name: this.fieldName0, value: this.fieldValue0 },
				{ name: this.fieldName1, value: this.fieldValue1 },
				{ name: this.fieldName2, value: this.fieldValue2 },
				{ name: this.fieldName3, value: this.fieldValue3 },
			];

			this.saving = true;

			this.$root.api('i/update', {
				name: this.name || null,
				description: this.description || null,
				avatarId: this.avatarId || undefined,
				bannerId: this.bannerId || undefined,
				fields,
				isBot: !!this.isBot,
				isLocked: !!this.isLocked,
				autoAcceptFollowed: !!this.autoAcceptFollowed
			}).then(i => {
				this.saving = false;
				this.$store.state.i.avatarId = i.avatarId;
				this.$store.state.i.avatarUrl = i.avatarUrl;
				this.$store.state.i.bannerId = i.bannerId;
				this.$store.state.i.bannerUrl = i.bannerUrl;

				if (notify) {
					this.$root.dialog({
						type: 'success',
						text: this.$t('saved')
					});
				}
			}).catch(err => {
				this.saving = false;
				this.$root.dialog({
					type: 'error',
					text: err.id
				});
			});
		},

		doExport() {
			this.$root.api(
				this.exportTarget == 'notes' ? 'i/export-notes' :
				this.exportTarget == 'following' ? 'i/export-following' :
				this.exportTarget == 'blocking' ? 'i/export-blocking' :
				this.exportTarget == 'user-lists' ? 'i/export-user-lists' :
				null, {}).then(() => {
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
.dp-settings-page-profile {
	> *:first-child {
		margin-top: 0;
	}

	> .fields {
		> .row {
			> * {
				display: inline-block;
				width: 50%;
				margin-bottom: 0;
			}
		}
	}
}
</style>
