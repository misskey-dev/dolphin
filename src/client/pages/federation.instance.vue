<template>
<x-modal ref="modal" @closed="() => { $emit('closed'); destroyDom(); }" :width="350" :height="350">
	<div class="dp-instance-info">
		<div class="header">
			<span>{{ instance.host }}</span>
			<button class="_button" @click="$refs.modal.close()"><fa :icon="faTimes"/></button>
		</div>
		<div class="table">
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('foundAt') }}</div>
					<div class="data">{{ new Date(instance.caughtAt).toLocaleString() }}</div>
				</div>
			</div>
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('following') }}</div>
					<div class="data">{{ instance.followingCount | number }}</div>
				</div>
				<div class="cell">
					<div class="label">{{ $t('followers') }}</div>
					<div class="data">{{ instance.followersCount | number }}</div>
				</div>
			</div>
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('users') }}</div>
					<div class="data">{{ instance.usersCount | number }}</div>
				</div>
				<div class="cell">
					<div class="label">{{ $t('notes') }}</div>
					<div class="data">{{ instance.notesCount | number }}</div>
				</div>
			</div>
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('files') }}</div>
					<div class="data">{{ instance.driveFiles | number }}</div>
				</div>
				<div class="cell">
					<div class="label">{{ $t('storageUsage') }}</div>
					<div class="data">{{ instance.driveUsage | bytes }}</div>
				</div>
			</div>
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('latestRequestSentAt') }}</div>
					<div class="data">{{ new Date(instance.latestRequestSentAt).toLocaleString() }}</div>
				</div>
				<div class="cell">
					<div class="label">{{ $t('latestStatus') }}</div>
					<div class="data">{{ instance.latestStatus }}</div>
				</div>
			</div>
			<div class="row">
				<div class="cell">
					<div class="label">{{ $t('latestRequestReceivedAt') }}</div>
					<div class="data">{{ new Date(instance.latestRequestReceivedAt).toLocaleString() }}</div>
				</div>
			</div>
		</div>
	</div>
</x-modal>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import XModal from '../components/modal.vue';

export default Vue.extend({
	i18n,

	components: {
		XModal,
	},

	props: {
		instance: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			faTimes
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../theme';

.dp-instance-info {
	height: 100%;
	background: var(--bg);
	border-radius: 6px;
	overflow: hidden;
	display: flex;
	flex-direction: column;

	> .header {
		display: flex;

		> button {
			height: 42px;
			width: 42px;
		}

		> span {
			flex: 1;
			line-height: 42px;
			padding-left: 16px;
			font-weight: bold;
		}
	}

	> .table {
		padding: 0 16px;

		> .row {
			display: flex;

			&:not(:last-child) {
				margin-bottom: 8px;
			}

			> .cell {
				flex: 1;

				> .label {
					font-size: 80%;
					opacity: 0.7;
				}
			}
		}
	}
}
</style>
