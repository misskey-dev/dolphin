<template>
<header class="bvonvjxbwzaiskogyhbwgyxvcgserpmu">
	<router-link class="name" :to="note.user | userPage" v-user-preview="note.user.id">
		<dp-user-name :user="note.user"/>
	</router-link>
	<span class="is-bot" v-if="note.user.isBot">bot</span>
	<span class="username"><dp-acct :user="note.user"/></span>
	<div class="info">
		<router-link class="created-at" :to="note | notePage">
			<dp-time :time="note.createdAt"/>
		</router-link>
		<span class="visibility" v-if="note.visibility != 'public'">
			<fa v-if="note.visibility == 'home'" icon="home"/>
			<fa v-if="note.visibility == 'followers'" icon="unlock"/>
			<fa v-if="note.visibility == 'specified'" icon="envelope"/>
		</span>
	</div>
</header>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		note: {
			type: Object,
			required: true
		},
	}
});
</script>

<style lang="scss" scoped>
.bvonvjxbwzaiskogyhbwgyxvcgserpmu {
	display: flex;
	align-items: baseline;
	white-space: nowrap;

	> .name {
		display: block;
		margin: 0 .5em 0 0;
		padding: 0;
		overflow: hidden;
		color: var(--noteHeaderName);
		font-size: 1em;
		font-weight: bold;
		text-decoration: none;
		text-overflow: ellipsis;

		&:hover {
			text-decoration: underline;
		}
	}

	> .is-bot {
		flex-shrink: 0;
		align-self: center;
		margin: 0 .5em 0 0;
		padding: 1px 6px;
		font-size: 80%;
		color: var(--noteHeaderBadgeFg);
		background: var(--noteHeaderBadgeBg);
		border-radius: 3px;
	}

	> .username {
		margin: 0 .5em 0 0;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--noteHeaderAcct);
		flex-shrink: 2147483647;
	}

	> .info {
		margin-left: auto;
		font-size: 0.9em;

		> * {
			color: var(--noteHeaderInfo);
		}

		> .visibility {
			margin-left: 8px;
		}
	}
}
</style>
