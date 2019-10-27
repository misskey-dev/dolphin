<template>
<div class="dp-user-select">
	<transition name="user-select-fade" appear>
		<div class="bg" ref="bg" v-if="show"></div>
	</transition>
	<div class="main" ref="main">
		<transition name="user-select" appear @after-leave="destroyDom">
			<div class="form" ref="form" v-if="show">
				<div class="header">
					<button class="_button" @click="close()"><fa :icon="faTimes"/></button>
					<span>{{ $t('selectUser') }}</span>
					<button class="_button" :disabled="selected == null" @click="ok()"><fa :icon="faCheck"/></button>
				</div>
				<div class="inputs">
					<x-input v-model="username" class="input" @input="search" ref="username"><span>{{ $t('username') }}</span><template #prefix>@</template></x-input>
					<x-input v-model="host" class="input" @input="search"><span>{{ $t('host') }}</span><template #prefix>@</template></x-input>
				</div>
				<div class="users">
					<div class="user" v-for="user in users" :key="user.id" :class="{ selected: selected && selected.id === user.id }" @click="selected = user" @dblclick="ok()">
						<dp-avatar :user="user" class="avatar" :disable-link="true"/>
						<div class="body">
							<dp-user-name :user="user" class="name"/>
							<dp-acct :user="user" class="acct"/>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import XInput from './ui/input.vue';

export default Vue.extend({
	i18n,

	components: {
		XInput
	},

	props: {
	},

	data() {
		return {
			show: true,
			username: '',
			host: '',
			users: [],
			selected: null,
			faTimes, faCheck
		};
	},

	mounted() {
		this.focus();

		this.$nextTick(() => {
			this.focus();
		});
	},

	methods: {
		search() {
			if (this.username == '' && this.host == '') {
				this.users = [];
				return;
			}
			this.$root.api('users/search', {
				username: this.username,
				host: this.host,
				limit: 10,
				detail: false
			}).then(users => {
				this.users = users;
			});
		},

		focus() {
			this.$refs.username.focus();
		},

		close() {
			this.show = false;
			(this.$refs.bg as any).style.pointerEvents = 'none';
			(this.$refs.main as any).style.pointerEvents = 'none';
		},

		ok() {
			this.$emit('selected', this.selected);
			this.close();
		},
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.user-select-enter-active, .user-select-leave-active {
	transition: opacity 0.3s, transform 0.3s !important;
}
.user-select-enter, .user-select-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.user-select-fade-enter-active, .user-select-fade-leave-active {
	transition: opacity 0.3s !important;
}
.user-select-fade-enter, .user-select-fade-leave-to {
	opacity: 0;
}

.dp-user-select {
	> .bg {
		display: block;
		position: fixed;
		z-index: 10000;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(#000, 0.7);
	}

	> .main {
		display: block;
		position: fixed;
		z-index: 10000;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 350px;
    height: 350px;
		max-width: calc(100% - 16px);
		max-height: calc(100% - 16px);
		overflow: auto;
		margin: auto;

		> .form {
			height: 100%;
			background: var(--bg);
			border-radius: 6px;
			overflow: hidden;
			display: flex;
			flex-direction: column;

			> .header {
				display: flex;
				border-bottom: solid 1px rgba(0, 0, 0, 0.1);

				> button {
					height: 42px;
					width: 42px;
				}

				> span {
					flex: 1;
					line-height: 42px;
				}
			}

			> .inputs {
				padding: 16px;

				> .input {
					display: inline-block;
					width: 50%;
					margin: 0;
				}
			}

			> .users {
				flex: 1;
				overflow: auto;
		
				> .user {
					display: flex;
					align-items: center;
					padding: 8px;

					&:hover {
						background: rgba(0, 0, 0, 0.05);

						@media (prefers-color-scheme: dark) {
							background: rgba(255, 255, 255, 0.05);
						}
					}

					&:active {
						background: rgba(0, 0, 0, 0.1);

						@media (prefers-color-scheme: dark) {
							background: rgba(255, 255, 255, 0.1);
						}
					}

					&.selected {
						background: $primary;
						color: #fff;
					}

					> * {
						pointer-events: none;
						user-select: none;
					}

					> .avatar {
						width: 50px;
						height: 50px;
					}

					> .body {
						padding: 8px;

						> .name {
							display: block;
							font-weight: bold;
						}

						> .acct {
							opacity: 0.5;
						}
					}
				}
			}
		}
	}
}
</style>
