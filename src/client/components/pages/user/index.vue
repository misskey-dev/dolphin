<template>
<div class="dp-user-page" v-if="user">
	<div class="profile">
		<div class="banner-container" :style="style">
			<div class="banner" ref="banner" :style="style"></div>
			<div class="fade"></div>
			<div class="title">
				<p class="name">
					<dp-user-name :user="user" :nowrap="false"/>
				</p>
				<div>
					<span class="username"><dp-acct :user="user" :detail="true" /></span>
					<span v-if="user.isBot" :title="$t('is-bot')"><fa icon="robot"/></span>
				</div>
			</div>
			<span class="followed" v-if="$store.getters.isSignedIn && $store.state.i.id != user.id && user.isFollowed">{{ $t('follows-you') }}</span>
			<div class="actions" v-if="$store.getters.isSignedIn">
				<button @click="menu" class="menu" ref="menu"><fa :icon="faEllipsisH"/></button>
				<dp-follow-button v-if="$store.state.i.id != user.id" :user="user" :inline="true" :transparent="false" class="follow"/>
			</div>
		</div>
		<dp-avatar class="avatar" :user="user" :disable-preview="true"/>
		<div class="body">
			<div class="description">
				<mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$store.state.i" :custom-emojis="user.emojis"/>
				<p v-else class="empty">{{ $t('no-description') }}</p>
			</div>
			<div class="fields" v-if="user.fields">
				<dl class="field" v-for="(field, i) in user.fields" :key="i">
					<dt class="name">
						<mfm :text="field.name" :plain="true" :custom-emojis="user.emojis"/>
					</dt>
					<dd class="value">
						<mfm :text="field.value" :author="user" :i="$store.state.i" :custom-emojis="user.emojis"/>
					</dd>
				</dl>
			</div>
		</div>
	</div>
	<x-user-timeline :user="user"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import XUserTimeline from '../../user-timeline.vue';
import Progress from '../../../scripts/loading';
import parseAcct from '../../../../misc/acct/parse';

export default Vue.extend({
	components: {
		XUserTimeline
	},

	data() {
		return {
			fetching: true,
			user: null,
			faEllipsisH
		};
	},

	computed: {
		style(): any {
			if (this.user.bannerUrl == null) return {};
			return {
				backgroundImage: `url(${ this.user.bannerUrl })`
			};
		},
	},

	watch: {
		$route: 'fetch'
	},

	created() {
		this.fetch();
	},

	methods: {
		fetch() {
			Progress.start();

			this.$root.api('users/show', parseAcct(this.$route.params.user)).then(user => {
				this.user = user;
				this.fetching = false;

				Progress.done();
				document.title = `${Vue.filter('userName')(this.user)} | ${this.$root.instanceName}`;
			});
		},

		menu() {
			this.$root.new(XUserMenu, {
				source: this.$refs.menu,
				user: this.user
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.dp-user-page {
	padding: 32px;

	> .profile {
		position: relative;
		background: #fff;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		overflow: hidden;

		> .banner-container {
			position: relative;
			height: 250px;
			overflow: hidden;
			background-size: cover;
			background-position: center;

			> .banner {
				height: 100%;
				background-color: #383838;
				background-size: cover;
				background-position: center;
				box-shadow: 0 0 128px rgba(0, 0, 0, 0.5) inset;
			}

			> .fade {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 78px;
				background: linear-gradient(transparent, rgba(#000, 0.7));
				backdrop-filter: blur(4px);
			}

			> .followed {
				position: absolute;
				top: 12px;
				left: 12px;
				padding: 4px 6px;
				color: #fff;
				background: rgba(0, 0, 0, 0.7);
				font-size: 12px;
			}

			> .actions {
				position: absolute;
				top: 12px;
				right: 12px;

				> .menu {
					height: 100%;
					padding: 0 14px;
					color: #fff;
					text-shadow: 0 0 8px #000;
					font-size: 16px;
				}
			}

			> .title {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				padding: 0 0 8px 154px;
				color: #fff;

				> .name {
					display: block;
					margin: 0;
					line-height: 32px;
					font-weight: bold;
					font-size: 1.8em;
					text-shadow: 0 0 8px #000;
				}

				> div {
					> * {
						display: inline-block;
						margin-right: 16px;
						line-height: 20px;
						opacity: 0.8;

						&.username {
							font-weight: bold;
						}
					}
				}
			}
		}

		> .avatar {
			display: block;
			position: absolute;
			top: 170px;
			left: 16px;
			z-index: 2;
			width: 120px;
			height: 120px;
			box-shadow: 1px 1px 3px rgba(#000, 0.2);
		}

		> .body {
			padding: 16px 16px 16px 154px;
			color: var(--text);

			> .description {
				font-size: 15px;

				> .empty {
					margin: 0;
					opacity: 0.5;
				}
			}

			> .fields {
				margin-top: 16px;

				> .field {
					display: flex;
					padding: 0;
					margin: 0;
					align-items: center;

					> .name {
						border-right: solid 1px var(--faceDivider);
						padding: 4px;
						margin: 4px;
						width: 30%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						font-weight: bold;
						text-align: center;
					}

					> .value {
						padding: 4px;
						margin: 4px;
						width: 70%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
				}
			}

			> .info {
				margin-top: 16px;
				padding-top: 16px;
				border-top: solid 1px var(--faceDivider);
				font-size: 15px;

				&:empty {
					display: none;
				}

				> * {
					margin-right: 16px;
				}
			}
		}
	}

	> * {
		max-width: 600px;
		margin: 0 auto;
	}
}
</style>
