<template>
<div v-if="meta" class="dp-settings-page">
	<header>{{ $t('settings') }}</header>
	<section>
		<div class="title">{{ $t('profile') }}</div>
		<div class="content">
			<ui-input v-model="name" :max="30">
				<span>{{ $t('name') }}</span>
			</ui-input>

			<ui-input v-model="username" readonly>
				<span>{{ $t('account') }}</span>
				<template #prefix>@</template>
				<template #suffix>@{{ host }}</template>
			</ui-input>

			<ui-textarea v-model="description" :max="500">
				<span>{{ $t('description') }}</span>
				<template #desc>{{ $t('you-can-include-hashtags') }}</template>
			</ui-textarea>

			<ui-input type="file" @change="onAvatarChange">
				<span>{{ $t('avatar') }}</span>
				<template #icon><fa icon="image"/></template>
				<template #desc v-if="avatarUploading">{{ $t('uploading') }}<mk-ellipsis/></template>
			</ui-input>

			<ui-input type="file" @change="onBannerChange">
				<span>{{ $t('banner') }}</span>
				<template #icon><fa icon="image"/></template>
				<template #desc v-if="bannerUploading">{{ $t('uploading') }}<mk-ellipsis/></template>
			</ui-input>

			<div class="fields">
				<header>{{ $t('profile-metadata') }}</header>
				<ui-horizon-group>
					<ui-input v-model="fieldName0">{{ $t('metadata-label') }}</ui-input>
					<ui-input v-model="fieldValue0">{{ $t('metadata-content') }}</ui-input>
				</ui-horizon-group>
				<ui-horizon-group>
					<ui-input v-model="fieldName1">{{ $t('metadata-label') }}</ui-input>
					<ui-input v-model="fieldValue1">{{ $t('metadata-content') }}</ui-input>
				</ui-horizon-group>
				<ui-horizon-group>
					<ui-input v-model="fieldName2">{{ $t('metadata-label') }}</ui-input>
					<ui-input v-model="fieldValue2">{{ $t('metadata-content') }}</ui-input>
				</ui-horizon-group>
				<ui-horizon-group>
					<ui-input v-model="fieldName3">{{ $t('metadata-label') }}</ui-input>
					<ui-input v-model="fieldValue3">{{ $t('metadata-content') }}</ui-input>
				</ui-horizon-group>
			</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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

	> section {
		overflow: hidden;
		background: #fff;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border-radius: 6px;

		> .title {
			margin: 0;
			padding: 16px;
			font-size: 1.2em;
			border-bottom: solid 1px rgba(0, 0, 0, 0.1);
		}

		> .content {
			padding: 16px;
		}
	}
}
</style>
