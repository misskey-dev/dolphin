<template>
<section class="dp-settings-page-drive _section">
	<div class="title"><fa :icon="faCloud"/> {{ $t('uploadedFiles') }}</div>
	<div class="content">
		<ui-pagination :pagination="drivePagination" #default="{items}" class="drive">
			<div class="file" v-for="(file, i) in items" :key="file.id" :data-index="i">
				<x-file-thumbnail class="thumbnail" :file="file" fit="cover"/>
				<div class="body">
					<p class="name">
						<span>{{ file.name.lastIndexOf('.') != -1 ? file.name.substr(0, file.name.lastIndexOf('.')) : file.name }}</span>
						<span class="ext" v-if="file.name.lastIndexOf('.') != -1">{{ file.name.substr(file.name.lastIndexOf('.')) }}</span>
					</p>
					<footer>
						<span class="type"><x-file-type-icon :type="file.type" class="icon"/>{{ file.type }}</span>
						<span class="separator"></span>
						<span class="data-size">{{ file.size | bytes }}</span>
						<span class="separator"></span>
						<span class="created-at"><fa :icon="['far', 'clock']"/><dp-time :time="file.createdAt"/></span>
						<template v-if="file.isSensitive">
							<span class="separator"></span>
							<span class="nsfw"><fa :icon="['far', 'eye-slash']"/> {{ $t('nsfw') }}</span>
						</template>
					</footer>
				</div>
			</div>
		</ui-pagination>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import XFileTypeIcon from '../components/file-type-icon.vue';
import XFileThumbnail from '../components/drive-file-thumbnail.vue';
import i18n from '../i18n';

export default Vue.extend({
	i18n,

	components: {
		XFileTypeIcon,
		XFileThumbnail,
	},

	data() {
		return {
			drivePagination: {
				endpoint: 'drive/files',
				limit: 10,
			},
			faCloud
		}
	},

	methods: {

	}
});
</script>

<style lang="scss" scoped>
.dp-settings-page-drive {
	> .content {
		> .drive {
			> .file {
				display: grid;
				margin: 0 auto;
				grid-template-columns: 64px 1fr;
				grid-column-gap: 10px;

				&:not(:last-child) {
					margin-bottom: 16px;
				}

				&:after {
					content: "";
					display: block;
					clear: both;
				}

				> .thumbnail {
					width: 64px;
					height: 64px;
					color: var(--driveFileIcon);
				}

				> .body {
					display: block;
					word-break: break-all;

					> .name {
						display: block;
						margin: 0;
						padding: 0;
						font-size: 0.9em;
						font-weight: bold;
						color: var(--text);
						word-break: break-word;

						> .ext {
							opacity: 0.5;
						}
					}

					> .tags {
						display: block;
						margin: 4px 0 0 0;
						padding: 0;
						list-style: none;
						font-size: 0.5em;

						> .tag {
							display: inline-block;
							margin: 0 5px 0 0;
							padding: 1px 5px;
							border-radius: 2px;
						}
					}

					> footer {
						display: block;
						margin: 4px 0 0 0;
						font-size: 0.7em;
						color: var(--text);

						> .separator {
							padding: 0 4px;
						}

						> .type {
							opacity: 0.7;

							> .icon {
								margin-right: 4px;
							}
						}

						> .data-size {
							opacity: 0.7;
						}

						> .created-at {
							opacity: 0.7;

							> [data-icon] {
								margin-right: 2px;
							}
						}

						> .nsfw {
							color: #bf4633;
						}
					}
				}
			}
		}
	}
}
</style>
