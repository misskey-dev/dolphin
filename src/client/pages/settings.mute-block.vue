<template>
<section class="dp-settings-page-mute-block _section">
	<div class="title"><fa :icon="faBan"/> {{ $t('muteAndBlock') }}</div>
	<div class="content">
		<span>{{ $t('mutedUsers') }}</span>
		<x-pagination :pagination="mutingPagination" class="muting">
			<template #empty><span>{{ $t('noUsers') }}</span></template>
			<template #default="{items}">
				<div class="user" v-for="(mute, i) in items" :key="mute.id" :data-index="i">
					<router-link class="name" :to="mute.mutee | userPage">
						<dp-acct :user="mute.mutee"/>
					</router-link>
				</div>
			</template>
		</x-pagination>
	</div>
	<div class="content">
		<span>{{ $t('blockedUsers') }}</span>
		<x-pagination :pagination="blockingPagination" class="blocking">
			<template #empty><span>{{ $t('noUsers') }}</span></template>
			<template #default="{items}">
				<div class="user" v-for="(block, i) in items" :key="block.id" :data-index="i">
					<router-link class="name" :to="block.blockee | userPage">
						<dp-acct :user="block.blockee"/>
					</router-link>
				</div>
			</template>
		</x-pagination>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import XPagination from '../components/ui/pagination.vue';
import i18n from '../i18n';

export default Vue.extend({
	i18n,

	components: {
		XPagination,
	},

	data() {
		return {
			mutingPagination: {
				endpoint: 'muting/list',
				limit: 10,
			},
			blockingPagination: {
				endpoint: 'blocking/list',
				limit: 10,
			},
			faBan
		}
	},
});
</script>

<style lang="scss" scoped>
@import '../theme';

.dp-settings-page-mute-block {
	> .content {
		max-height: 350px;
		overflow: auto;

		> .muting,
		> .blocking {
			> .empty {
				opacity: 0.5 !important;
			}
		}
	}
}
</style>
