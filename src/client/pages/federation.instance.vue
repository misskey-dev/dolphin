<template>
<x-modal ref="modal" @closed="() => { $emit('closed'); destroyDom(); }" :width="350" :height="350">
	<div class="dp-instance-info">
		<div class="header">
			<span>{{ instance.host }}</span>
			<button class="_button" @click="$refs.modal.close()"><fa :icon="faTimes"/></button>
		</div>
		<div class="body">
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
						<div class="data"><dp-time v-if="instance.latestRequestSentAt" :time="instance.latestRequestSentAt"/><span v-else>N/A</span></div>
					</div>
					<div class="cell">
						<div class="label">{{ $t('latestStatus') }}</div>
						<div class="data">{{ instance.latestStatus ? instance.latestStatus : 'N/A' }}</div>
					</div>
				</div>
				<div class="row">
					<div class="cell">
						<div class="label">{{ $t('latestRequestReceivedAt') }}</div>
						<div class="data"><dp-time v-if="instance.latestRequestReceivedAt" :time="instance.latestRequestReceivedAt"/><span v-else>N/A</span></div>
					</div>
				</div>
			</div>
			<details class="chart">
				<summary>{{ $t('charts') }}</summary>
				<div class="selects">
					<x-select v-model="chartSrc">
						<option value="requests">{{ $t('chart-srcs.requests') }}</option>
						<option value="users">{{ $t('chart-srcs.users') }}</option>
						<option value="users-total">{{ $t('chart-srcs.users-total') }}</option>
						<option value="notes">{{ $t('chart-srcs.notes') }}</option>
						<option value="notes-total">{{ $t('chart-srcs.notes-total') }}</option>
						<option value="ff">{{ $t('chart-srcs.ff') }}</option>
						<option value="ff-total">{{ $t('chart-srcs.ff-total') }}</option>
						<option value="drive-usage">{{ $t('chart-srcs.drive-usage') }}</option>
						<option value="drive-usage-total">{{ $t('chart-srcs.drive-usage-total') }}</option>
						<option value="drive-files">{{ $t('chart-srcs.drive-files') }}</option>
						<option value="drive-files-total">{{ $t('chart-srcs.drive-files-total') }}</option>
					</x-select>
					<x-select v-model="chartSpan">
						<option value="hour">{{ $t('chart-spans.hour') }}</option>
						<option value="day">{{ $t('chart-spans.day') }}</option>
					</x-select>
				</div>
				<canvas ref="chart"></canvas>
			</details>
		</div>
	</div>
</x-modal>
</template>

<script lang="ts">
import Vue from 'vue';
import Chart from 'chart.js';
import i18n from '../i18n';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import XModal from '../components/modal.vue';
import XSelect from '../components/ui/select.vue';

const chartLimit = 50;
const sum = (...arr) => arr.reduce((r, a) => r.map((b, i) => a[i] + b));
const negate = arr => arr.map(x => -x);
const alpha = hex => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, 0.1)`;
};

export default Vue.extend({
	i18n,

	components: {
		XModal,
		XSelect,
	},

	props: {
		instance: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			now: null,
			chart: null,
			chartSrc: 'requests',
			chartSpan: 'hour',
			faTimes
		};
	},

	computed: {
		data(): any {
			if (this.chart == null) return null;
			switch (this.chartSrc) {
				case 'requests': return this.requestsChart();
				case 'users': return this.usersChart(false);
				case 'users-total': return this.usersChart(true);
				case 'notes': return this.notesChart(false);
				case 'notes-total': return this.notesChart(true);
				case 'ff': return this.ffChart(false);
				case 'ff-total': return this.ffChart(true);
				case 'drive-usage': return this.driveUsageChart(false);
				case 'drive-usage-total': return this.driveUsageChart(true);
				case 'drive-files': return this.driveFilesChart(false);
				case 'drive-files-total': return this.driveFilesChart(true);
			}
		},

		stats(): any[] {
			const stats =
				this.chartSpan == 'day' ? this.chart.perDay :
				this.chartSpan == 'hour' ? this.chart.perHour :
				null;

			return stats;
		}
	},

	watch: {
		chartSrc() {
			this.renderChart();
		},

		chartSpan() {
			this.renderChart();
		}
	},

	async created() {
		this.now = new Date();

		const [perHour, perDay] = await Promise.all([
			this.$root.api('charts/instance', { host: this.instance.host, limit: chartLimit, span: 'hour' }),
			this.$root.api('charts/instance', { host: this.instance.host, limit: chartLimit, span: 'day' }),
		]);

		const chart = {
			perHour: perHour,
			perDay: perDay
		};

		this.chart = chart;

		this.renderChart();
	},

	methods: {
		setSrc(src) {
			this.chartSrc = src;
		},

		renderChart() {
			/*if (this.chartInstance) {
				this.chartInstance.destroy();
			}*/

			const color = getComputedStyle(document.documentElement).getPropertyValue('--text');

			this.chartInstance = new Chart(this.$refs.chart, {
				type: 'line',
				data: {
					labels: new Array(chartLimit).fill(0).map((_, i) => this.getDate(i).toLocaleString()),
					datasets: this.data.series.map(x => ({
						label: x.name,
						data: x.data.slice().reverse(),
						pointRadius: 0,
						borderWidth: 1,
						borderColor: x.color,
						backgroundColor: alpha(x.color),
					}))
				},
				options: {
					legend: {
						position: 'bottom',
					},
					scales: {
						xAxes: [{
							gridLines: {
								display: false
							},
							ticks: {
								display: false
							}
						}],
						yAxes: [{
							ticks: {
								display: false
							}
						}]
					},
					tooltips: {
						intersect: false
					}
				}
			});
		},

		getDate(i: number) {
			const y = this.now.getFullYear();
			const m = this.now.getMonth();
			const d = this.now.getDate();
			const h = this.now.getHours();

			return this.chartSpan == 'day' ? new Date(y, m, d - i) : new Date(y, m, d, h - i);
		},

		format(arr) {
			return arr;
		},

		requestsChart(): any {
			return {
				series: [{
					name: 'Incoming',
					color: '#008FFB',
					data: this.format(this.stats.requests.received)
				}, {
					name: 'Outgoing (succeeded)',
					color: '#00E396',
					data: this.format(this.stats.requests.succeeded)
				}, {
					name: 'Outgoing (failed)',
					color: '#FEB019',
					data: this.format(this.stats.requests.failed)
				}]
			};
		},

		usersChart(total: boolean): any {
			return {
				series: [{
					name: 'Users',
					type: 'area',
					data: this.format(total
						? this.stats.users.total
						: sum(this.stats.users.inc, negate(this.stats.users.dec))
					)
				}]
			};
		},

		notesChart(total: boolean): any {
			return {
				series: [{
					name: 'Notes',
					type: 'area',
					data: this.format(total
						? this.stats.notes.total
						: sum(this.stats.notes.inc, negate(this.stats.notes.dec))
					)
				}]
			};
		},

		ffChart(total: boolean): any {
			return {
				series: [{
					name: 'Following',
					type: 'area',
					data: this.format(total
						? this.stats.following.total
						: sum(this.stats.following.inc, negate(this.stats.following.dec))
					)
				}, {
					name: 'Followers',
					type: 'area',
					data: this.format(total
						? this.stats.followers.total
						: sum(this.stats.followers.inc, negate(this.stats.followers.dec))
					)
				}]
			};
		},

		driveUsageChart(total: boolean): any {
			return {
				bytes: true,
				series: [{
					name: 'Drive usage',
					type: 'area',
					data: this.format(total
						? this.stats.drive.totalUsage
						: sum(this.stats.drive.incUsage, negate(this.stats.drive.decUsage))
					)
				}]
			};
		},

		driveFilesChart(total: boolean): any {
			return {
				series: [{
					name: 'Drive files',
					type: 'area',
					data: this.format(total
						? this.stats.drive.totalFiles
						: sum(this.stats.drive.incFiles, negate(this.stats.drive.decFiles))
					)
				}]
			};
		},
	}
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

	> .body {
		overflow: auto;

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

		> .chart {
			padding: 0 16px 16px 16px;
		}
	}
}
</style>
