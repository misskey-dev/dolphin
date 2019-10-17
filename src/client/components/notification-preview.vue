<template>
<div class="dp-notification-preview" :class="notification.type">
	<template v-if="notification.type == 'reaction'">
		<dp-avatar class="avatar" :user="notification.user"/>
		<div class="text">
			<p><dp-reaction-icon :reaction="notification.reaction"/><dp-user-name :user="notification.user"/></p>
			<p class="note-ref"><fa icon="quote-left"/>{{ getNoteSummary(notification.note) }}<fa icon="quote-right"/></p>
		</div>
	</template>

	<template v-if="notification.type == 'renote'">
		<dp-avatar class="avatar" :user="notification.note.user"/>
		<div class="text">
			<p><fa icon="retweet"/><dp-user-name :user="notification.note.user"/></p>
			<p class="note-ref"><fa icon="quote-left"/>{{ getNoteSummary(notification.note.renote) }}<fa icon="quote-right"/></p>
		</div>
	</template>

	<template v-if="notification.type == 'quote'">
		<dp-avatar class="avatar" :user="notification.note.user"/>
		<div class="text">
			<p><fa icon="quote-left"/><dp-user-name :user="notification.note.user"/></p>
			<p class="note-preview">{{ getNoteSummary(notification.note) }}</p>
		</div>
	</template>

	<template v-if="notification.type == 'follow'">
		<dp-avatar class="avatar" :user="notification.user"/>
		<div class="text">
			<p><fa icon="user-plus"/><dp-user-name :user="notification.user"/></p>
		</div>
	</template>

	<template v-if="notification.type == 'receiveFollowRequest'">
		<dp-avatar class="avatar" :user="notification.user"/>
		<div class="text">
			<p><fa icon="user-clock"/><dp-user-name :user="notification.user"/></p>
		</div>
	</template>

	<template v-if="notification.type == 'reply'">
		<dp-avatar class="avatar" :user="notification.note.user"/>
		<div class="text">
			<p><fa icon="reply"/><dp-user-name :user="notification.note.user"/></p>
			<p class="note-preview">{{ getNoteSummary(notification.note) }}</p>
		</div>
	</template>

	<template v-if="notification.type == 'mention'">
		<dp-avatar class="avatar" :user="notification.note.user"/>
		<div class="text">
			<p><fa icon="at"/><dp-user-name :user="notification.note.user"/></p>
			<p class="note-preview">{{ getNoteSummary(notification.note) }}</p>
		</div>
	</template>

	<template v-if="notification.type == 'pollVote'">
		<dp-avatar class="avatar" :user="notification.user"/>
		<div class="text">
			<p><fa icon="chart-pie"/><dp-user-name :user="notification.user"/></p>
			<p class="note-ref"><fa icon="quote-left"/>{{ getNoteSummary(notification.note) }}<fa icon="quote-right"/></p>
		</div>
	</template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import getNoteSummary from '../../misc/get-note-summary';

export default Vue.extend({
	props: ['notification'],
	data() {
		return {
			getNoteSummary
		};
	}
});
</script>

<style lang="scss" scoped>
.dp-notification-preview
	margin 0
	padding 8px
	color #fff
	overflow-wrap break-word

	&:after
		content ""
		display block
		clear both

	> .avatar
		display block
		float left
		width 36px
		height 36px
		border-radius 6px

	> .text
		float right
		width calc(100% - 36px)
		padding-left 8px

		p
			margin 0

			[data-icon], dp-reaction-icon
				margin-right 4px

	.note-ref

		[data-icon]
			font-size 1em
			font-weight normal
			font-style normal
			display inline-block
			margin-right 3px

	&.renote, &.quote
		.text p [data-icon]
			color #77B255

	&.follow
		.text p [data-icon]
			color #53c7ce

	&.receiveFollowRequest
		.text p [data-icon]
			color #888

	&.reply, &.mention
		.text p [data-icon]
			color #fff

</style>

