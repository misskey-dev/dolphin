<template>
<section class="_section dp-queue-queue">
	<div class="title"><slot name="title"></slot></div>
	<div class="content status">
		<div class="cell"><div class="label">Process</div>{{ activeSincePrevTick | number }}</div>
		<div class="cell"><div class="label">Active</div>{{ active | number }}</div>
		<div class="cell"><div class="label">Waiting</div>{{ waiting | number }}</div>
		<div class="cell"><div class="label">Delayed</div>{{ delayed | number }}</div>
	</div>
	<div class="content" style="margin-bottom: -8px;">
		<canvas ref="chart"></canvas>
	</div>
	<div class="content" style="max-height: 180px; overflow: auto;">
		<sequential-entrance :delay="15">
			<div v-for="(job, i) in jobs" :key="job.id" :data-index="i">
				<template v-if="domain === 'deliver'">
					<span>{{ job.data.to }}</span>
				</template>
				<template v-if="domain === 'inbox'">
					<span>{{ job.data.activity.id }}</span>
				</template>
				<span>{{ `(${job.attempts}/${job.maxAttempts}, ${Math.floor((jobsFetched - job.timestamp) / 1000 / 60)}min)` }}</span>
			</div>
		</sequential-entrance>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Chart from 'chart.js';
import i18n from '../../i18n';

const alpha = (hex, a) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default Vue.extend({
	i18n,

	props: {
		domain: {
			required: true
		},
		connection: {
			required: true
		},
	},

	data() {
		return {
			chart: null,
			jobs: [{
				id: 5950761,
				data: {
					to: 'https://misskey.nagaseyami.com/inbox',
					activity: {
						id: 'aaaaaaaaaaaaaaaaaaaa'
					}
				},
				attempts: 2,
				maxAttempts: 0,
				timestamp: Date.now() - 100000,
			}, {
				id: 5950762,
				data: {
					to: 'https://misskey.nagaseyami.com/inbox',
					activity: {
						id: 'aaaaaaaaaaaaaaaaaaaa'
					}
				},
				attempts: 2,
				maxAttempts: 0,
				timestamp: Date.now() - 100000,
			}, {
				id: 5950763,
				data: {
					to: 'https://misskey.nagaseyami.com/inbox',
					activity: {
						id: 'aaaaaaaaaaaaaaaaaaaa'
					}
				},
				attempts: 2,
				maxAttempts: 0,
				timestamp: Date.now() - 100000,
			}, {
				id: 5950764,
				data: {
					to: 'https://misskey.nagaseyami.com/inbox',
					activity: {
						id: 'aaaaaaaaaaaaaaaaaaaa'
					}
				},
				attempts: 2,
				maxAttempts: 0,
				timestamp: Date.now() - 100000,
			}, {
				id: 5950765,
				data: {
					to: 'https://misskey.nagaseyami.com/inbox',
					activity: {
						id: 'aaaaaaaaaaaaaaaaaaaa'
					}
				},
				attempts: 2,
				maxAttempts: 0,
				timestamp: Date.now() - 100000,
			}],
			jobsLimit: 50,
			jobsFetched: Date.now(),
			activeSincePrevTick: 0,
			active: 0,
			waiting: 0,
			delayed: 0,
		}
	},

	mounted() {
		this.fetchJobs();

		Chart.defaults.global.defaultFontColor = getComputedStyle(document.documentElement).getPropertyValue('--fg');

		this.chart = new Chart(this.$refs.chart, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'Process',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#00E396',
					backgroundColor: alpha('#00E396', 0.1),
					data: []
				}, {
					label: 'Active',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#00BCD4',
					backgroundColor: alpha('#00BCD4', 0.1),
					data: []
				}, {
					label: 'Waiting',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#FFB300',
					backgroundColor: alpha('#FFB300', 0.1),
					data: []
				}, {
					label: 'Delayed',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#E53935',
					borderDash: [5, 5],
					fill: false,
					data: []
				}]
			},
			options: {
				aspectRatio: 3,
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 8,
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
							display: false,
						}
					}]
				},
				tooltips: {
					intersect: false,
					mode: 'index',
				}
			}
		});

		this.connection.on('stats', this.onStats);
		this.connection.on('statsLog', this.onStatsLog);
	},

	beforeDestroy() {
		this.connection.off('stats', this.onStats);
		this.connection.off('statsLog', this.onStatsLog);
	},

	methods: {
		onStats(stats) {
			this.chart.data.labels.push('');
			this.chart.data.datasets[0].data.push(stats[this.domain].activeSincePrevTick);
			this.chart.data.datasets[1].data.push(stats[this.domain].active);
			this.chart.data.datasets[2].data.push(stats[this.domain].waiting);
			this.chart.data.datasets[3].data.push(stats[this.domain].delayed);
			if (this.chart.data.datasets[0].data.length > 200) {
				this.chart.data.labels.shift();
				this.chart.data.datasets[0].data.shift();
				this.chart.data.datasets[1].data.shift();
				this.chart.data.datasets[2].data.shift();
				this.chart.data.datasets[3].data.shift();
			}
			this.chart.update();
		},

		onStatsLog(statsLog) {
			for (const stats of statsLog.reverse()) {
				this.onStats(stats);
			}
		},

		fetchJobs() {
			this.$root.api('admin/queue/jobs', {
				domain: this.domain,
				state: 'delayed',
				limit: this.jobsLimit
			}).then(jobs => {
				this.jobsFetched = Date.now();
				//this.jobs = jobs;
			});
		},
	}
});
</script>

<style lang="scss" scoped>
@import '../../theme';

.dp-queue-queue {
	> .status {
		display: flex;

		> .cell {
			flex: 1;

			> .label {
				font-size: 80%;
				opacity: 0.7;
			}
		}
	}
}
</style>
