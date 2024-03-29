<template>
<div class="dp-instance-stats">
	<section class="_section">
		<div class="title"><fa :icon="faChartBar"/> {{ $t('statistics') }}</div>
		<div class="content" style="margin-top: -8px; margin-bottom: -12px;">
			<div class="selects" style="display: flex;">
				<x-select v-model="chartSrc" style="margin: 0; flex: 1;">
					<optgroup :label="$t('federation')">
						<option value="federation-instances">{{ $t('_charts.federationInstancesIncDec') }}</option>
						<option value="federation-instances-total">{{ $t('_charts.federationInstancesTotal') }}</option>
					</optgroup>
					<optgroup :label="$t('users')">
						<option value="users">{{ $t('_charts.usersIncDec') }}</option>
						<option value="users-total">{{ $t('_charts.usersTotal') }}</option>
					</optgroup>
					<optgroup :label="$t('notes')">
						<option value="notes">{{ $t('_charts.notesIncDec') }}</option>
						<option value="local-notes">{{ $t('_charts.localNotesIncDec') }}</option>
						<option value="remote-notes">{{ $t('_charts.remoteNotesIncDec') }}</option>
						<option value="notes-total">{{ $t('_charts.notesTotal') }}</option>
					</optgroup>
					<optgroup :label="$t('files')">
						<option value="drive-files">{{ $t('_charts.filesIncDec') }}</option>
						<option value="drive-files-total">{{ $t('_charts.filesTotal') }}</option>
						<option value="drive">{{ $t('_charts.storageUsageIncDec') }}</option>
						<option value="drive-total">{{ $t('_charts.storageUsageTotal') }}</option>
					</optgroup>
				</x-select>
				<x-select v-model="chartSpan" style="margin: 0;">
					<option value="hour">{{ $t('perHour') }}</option>
					<option value="day">{{ $t('perDay') }}</option>
				</x-select>
			</div>
			<canvas ref="chart"></canvas>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js';
import i18n from '../../i18n';
import XSelect from '../../components/ui/select.vue';

const chartLimit = 90;
const sum = (...arr) => arr.reduce((r, a) => r.map((b, i) => a[i] + b));
const negate = arr => arr.map(x => -x);
const alpha = (hex, a) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default Vue.extend({
	i18n,

	metaInfo() {
		return {
			title: `${this.$t('statistics')} | ${this.$t('instance')}`
		};
	},

	components: {
		XSelect
	},

	data() {
		return {
			now: null,
			chart: null,
			chartInstance: null,
			chartSrc: 'notes',
			chartSpan: 'hour',
			faChartBar
		}
	},

	computed: {
		data(): any {
			if (this.chart == null) return null;
			switch (this.chartSrc) {
				case 'federation-instances': return this.federationInstancesChart(false);
				case 'federation-instances-total': return this.federationInstancesChart(true);
				case 'users': return this.usersChart(false);
				case 'users-total': return this.usersChart(true);
				case 'notes': return this.notesChart('combined');
				case 'local-notes': return this.notesChart('local');
				case 'remote-notes': return this.notesChart('remote');
				case 'notes-total': return this.notesTotalChart();
				case 'drive': return this.driveChart();
				case 'drive-total': return this.driveTotalChart();
				case 'drive-files': return this.driveFilesChart();
				case 'drive-files-total': return this.driveFilesTotalChart();
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

		const [perHour, perDay] = await Promise.all([Promise.all([
			this.$root.api('charts/federation', { limit: chartLimit, span: 'hour' }),
			this.$root.api('charts/users', { limit: chartLimit, span: 'hour' }),
			this.$root.api('charts/notes', { limit: chartLimit, span: 'hour' }),
			this.$root.api('charts/drive', { limit: chartLimit, span: 'hour' }),
		]), Promise.all([
			this.$root.api('charts/federation', { limit: chartLimit, span: 'day' }),
			this.$root.api('charts/users', { limit: chartLimit, span: 'day' }),
			this.$root.api('charts/notes', { limit: chartLimit, span: 'day' }),
			this.$root.api('charts/drive', { limit: chartLimit, span: 'day' }),
		])]);

		const chart = {
			perHour: {
				federation: perHour[0],
				users: perHour[1],
				notes: perHour[2],
				drive: perHour[3],
			},
			perDay: {
				federation: perDay[0],
				users: perDay[1],
				notes: perDay[2],
				drive: perDay[3],
			}
		};

		this.chart = chart;

		this.renderChart();
	},

	methods: {
		renderChart() {
			if (this.chartInstance) {
				this.chartInstance.destroy();
			}

			Chart.defaults.global.defaultFontColor = getComputedStyle(document.documentElement).getPropertyValue('--fg');
			this.chartInstance = new Chart(this.$refs.chart, {
				type: 'line',
				data: {
					labels: new Array(chartLimit).fill(0).map((_, i) => this.getDate(i).toLocaleString()).slice().reverse(),
					datasets: this.data.series.map(x => ({
						label: x.name,
						data: x.data.slice().reverse(),
						pointRadius: 0,
						lineTension: 0,
						borderWidth: 2,
						borderColor: x.color,
						backgroundColor: alpha(x.color, 0.1),
						hidden: !!x.hidden
					}))
				},
				options: {
					aspectRatio: 2.5,
					layout: {
						padding: {
							left: 0,
							right: 0,
							top: 16,
							bottom: 0
						}
					},
					legend: {
						position: 'bottom',
						labels: {
							boxWidth: 16,
						}
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
							position: 'right',
							ticks: {
								display: false
							}
						}]
					},
					tooltips: {
						intersect: false,
						mode: 'index',
					}
				}
			});
		},

		getDate(ago: number) {
			const y = this.now.getFullYear();
			const m = this.now.getMonth();
			const d = this.now.getDate();
			const h = this.now.getHours();

			return this.chartSpan == 'day' ? new Date(y, m, d - ago) : new Date(y, m, d, h - ago);
		},

		format(arr) {
			return arr;
		},

		federationInstancesChart(total: boolean): any {
			return {
				series: [{
					name: 'Instances',
					color: '#008FFB',
					data: this.format(total
						? this.stats.federation.instance.total
						: sum(this.stats.federation.instance.inc, negate(this.stats.federation.instance.dec))
					)
				}]
			};
		},

		notesChart(type: string): any {
			return {
				series: [{
					name: 'All',
					type: 'line',
					color: '#008FFB',
					data: this.format(type == 'combined'
						? sum(this.stats.notes.local.inc, negate(this.stats.notes.local.dec), this.stats.notes.remote.inc, negate(this.stats.notes.remote.dec))
						: sum(this.stats.notes[type].inc, negate(this.stats.notes[type].dec))
					)
				}, {
					name: 'Renotes',
					type: 'area',
					color: '#00E396',
					data: this.format(type == 'combined'
						? sum(this.stats.notes.local.diffs.renote, this.stats.notes.remote.diffs.renote)
						: this.stats.notes[type].diffs.renote
					)
				}, {
					name: 'Replies',
					type: 'area',
					color: '#FEB019',
					data: this.format(type == 'combined'
						? sum(this.stats.notes.local.diffs.reply, this.stats.notes.remote.diffs.reply)
						: this.stats.notes[type].diffs.reply
					)
				}, {
					name: 'Normal',
					type: 'area',
					color: '#FF4560',
					data: this.format(type == 'combined'
						? sum(this.stats.notes.local.diffs.normal, this.stats.notes.remote.diffs.normal)
						: this.stats.notes[type].diffs.normal
					)
				}]
			};
		},

		notesTotalChart(): any {
			return {
				series: [{
					name: 'Combined',
					type: 'line',
					color: '#008FFB',
					data: this.format(sum(this.stats.notes.local.total, this.stats.notes.remote.total))
				}, {
					name: 'Local',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.notes.local.total)
				}, {
					name: 'Remote',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.notes.remote.total)
				}]
			};
		},

		usersChart(total: boolean): any {
			return {
				series: [{
					name: 'Combined',
					type: 'line',
					color: '#008FFB',
					data: this.format(total
						? sum(this.stats.users.local.total, this.stats.users.remote.total)
						: sum(this.stats.users.local.inc, negate(this.stats.users.local.dec), this.stats.users.remote.inc, negate(this.stats.users.remote.dec))
					)
				}, {
					name: 'Local',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(total
						? this.stats.users.local.total
						: sum(this.stats.users.local.inc, negate(this.stats.users.local.dec))
					)
				}, {
					name: 'Remote',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(total
						? this.stats.users.remote.total
						: sum(this.stats.users.remote.inc, negate(this.stats.users.remote.dec))
					)
				}]
			};
		},

		activeUsersChart(): any {
			return {
				series: [{
					name: 'Combined',
					type: 'line',
					color: '#008FFB',
					data: this.format(sum(this.stats.activeUsers.local.count, this.stats.activeUsers.remote.count))
				}, {
					name: 'Local',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.activeUsers.local.count)
				}, {
					name: 'Remote',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.activeUsers.remote.count)
				}]
			};
		},

		driveChart(): any {
			return {
				bytes: true,
				series: [{
					name: 'All',
					type: 'line',
					color: '#008FFB',
					data: this.format(
						sum(
							this.stats.drive.local.incSize,
							negate(this.stats.drive.local.decSize),
							this.stats.drive.remote.incSize,
							negate(this.stats.drive.remote.decSize)
						)
					)
				}, {
					name: 'Local +',
					type: 'area',
					color: '#008FFB',
					data: this.format(this.stats.drive.local.incSize)
				}, {
					name: 'Local -',
					type: 'area',
					color: '#008FFB',
					data: this.format(negate(this.stats.drive.local.decSize))
				}, {
					name: 'Remote +',
					type: 'area',
					color: '#008FFB',
					data: this.format(this.stats.drive.remote.incSize)
				}, {
					name: 'Remote -',
					type: 'area',
					color: '#008FFB',
					data: this.format(negate(this.stats.drive.remote.decSize))
				}]
			};
		},

		driveTotalChart(): any {
			return {
				bytes: true,
				series: [{
					name: 'Combined',
					type: 'line',
					color: '#008FFB',
					data: this.format(sum(this.stats.drive.local.totalSize, this.stats.drive.remote.totalSize))
				}, {
					name: 'Local',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.drive.local.totalSize)
				}, {
					name: 'Remote',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.drive.remote.totalSize)
				}]
			};
		},

		driveFilesChart(): any {
			return {
				series: [{
					name: 'All',
					type: 'line',
					color: '#008FFB',
					data: this.format(
						sum(
							this.stats.drive.local.incCount,
							negate(this.stats.drive.local.decCount),
							this.stats.drive.remote.incCount,
							negate(this.stats.drive.remote.decCount)
						)
					)
				}, {
					name: 'Local +',
					type: 'area',
					color: '#008FFB',
					data: this.format(this.stats.drive.local.incCount)
				}, {
					name: 'Local -',
					type: 'area',
					color: '#008FFB',
					data: this.format(negate(this.stats.drive.local.decCount))
				}, {
					name: 'Remote +',
					type: 'area',
					color: '#008FFB',
					data: this.format(this.stats.drive.remote.incCount)
				}, {
					name: 'Remote -',
					type: 'area',
					color: '#008FFB',
					data: this.format(negate(this.stats.drive.remote.decCount))
				}]
			};
		},

		driveFilesTotalChart(): any {
			return {
				series: [{
					name: 'Combined',
					type: 'line',
					color: '#008FFB',
					data: this.format(sum(this.stats.drive.local.totalCount, this.stats.drive.remote.totalCount))
				}, {
					name: 'Local',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.drive.local.totalCount)
				}, {
					name: 'Remote',
					type: 'area',
					color: '#008FFB',
					hidden: true,
					data: this.format(this.stats.drive.remote.totalCount)
				}]
			};
		},
	}
});
</script>

<style lang="scss" scoped>
@import '../../theme';

</style>
