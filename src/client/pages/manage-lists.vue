<template>
<x-pagination :pagination="pagination" #default="{items}" class="dp-user-lists">
	<div class="list" v-for="(list, i) in items" :key="list.id" :data-index="i">
		{{ list.name }}
	</div>
</x-pagination>
</template>

<script lang="ts">
import Vue from 'vue';
import XPagination from '../components/ui/pagination.vue';

export default Vue.extend({
	components: {
		XPagination
	},

	data() {
		return {
			pagination: {
				endpoint: 'users/lists/list',
				limit: 10,
			},
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../theme';

.dp-user-lists {
	> .list {
		display: flex;
		padding: 16px;
		background: var(--bg);
		border-radius: 6px;
		@include shadow();
	}
}
</style>
