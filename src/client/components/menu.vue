<template>
<div class="onchrpzrvnoruiaenfcqvccjfuupzzwv">
	<transition name="bg-fade" appear>
		<div class="backdrop" ref="backdrop" @click="close" v-if="show"></div>
	</transition>
	<transition name="menu" appear
		@after-leave="() => { $emit('closed'); destroyDom(); }"
	>
		<sequential-entrance class="popover" ref="popover" :delay="20" v-if="show">
			<template v-for="(item, i) in items">
				<div v-if="item === null" :key="i" :data-index="i"></div>
				<button v-if="item" @click="clicked(item.action)" :tabindex="i" class="_button" :key="i" :data-index="i">
					<fa v-if="item.icon" :icon="item.icon"/>{{ item.text }}
				</button>
			</template>
		</sequential-entrance>
	</transition>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		source: {
			required: true
		},
		items: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			show: true,
		};
	},
	mounted() {
		this.$nextTick(() => {
			const popover = this.$refs.popover.$el as any;

			const rect = this.source.getBoundingClientRect();
			const width = popover.offsetWidth;
			const height = popover.offsetHeight;

			let left;
			let top;

			if (window.innerWidth < 576) {
				const x = rect.left + window.pageXOffset + (this.source.offsetWidth / 2);
				const y = rect.top + window.pageYOffset + (this.source.offsetHeight / 2);
				left = (x - (width / 2));
				top = (y - (height / 2));
			} else {
				const x = rect.left + window.pageXOffset + (this.source.offsetWidth / 2);
				const y = rect.top + window.pageYOffset + this.source.offsetHeight;
				left = (x - (width / 2));
				top = y;
			}

			if (left + width - window.pageXOffset > window.innerWidth) {
				left = window.innerWidth - width + window.pageXOffset;
				popover.style.transformOrigin = 'center';
			}

			if (top + height - window.pageYOffset > window.innerHeight) {
				top = window.innerHeight - height + window.pageYOffset;
				popover.style.transformOrigin = 'center';
			}

			if (top < 0) {
				top = 0;
			}

			popover.style.left = left + 'px';
			popover.style.top = top + 'px';
		});
	},
	methods: {
		clicked(fn) {
			fn();
			this.close();
		},
		close() {
			this.show = false;
			(this.$refs.backdrop as any).style.pointerEvents = 'none';
			(this.$refs.popover.$el as any).style.pointerEvents = 'none';
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../theme';

.menu-enter-active, .menu-leave-active {
	transition: opacity 0.3s, transform 0.3s !important;
}
.menu-enter, .menu-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.bg-fade-enter-active, .bg-fade-leave-active {
	transition: opacity 0.3s !important;
}
.bg-fade-enter, .bg-fade-leave-to {
	opacity: 0;
}

.onchrpzrvnoruiaenfcqvccjfuupzzwv {
	position: initial;

	> .backdrop {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
	}

	> .popover {
		position: absolute;
		z-index: 10001;
		padding: 8px 0;
		background: var(--bg);
		border-radius: 4px;
		box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
		overflow: hidden;
		transform-origin: center top;

		> button {
			display: block;
			padding: 8px 16px;
			width: 100%;
			white-space: nowrap;
			font-size: 14px;

			&:hover {
				color: #fff;
				background: $primary;
				text-decoration: none;
			}

			&:active {
				color: #fff;
				background: darken($primary, 10);
			}

			> [data-icon] {
				margin-right: 4px;
			}
		}

		> div {
			margin: 8px 0;
			height: 1px;
			background: rgba(0, 0, 0, 0.1);
		}
	}
}
</style>
