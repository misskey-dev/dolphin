<template>
<section class="_section dp-instance-queue">
	<div class="title"><fa :icon="faExchangeAlt"/> {{ $t('jobQueue') }}</div>
	<div class="content">
		<div class="in">
			<canvas ref="in"></canvas>
		</div>
		<div class="out">
			<canvas ref="out"></canvas>
		</div>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import Chart from 'chart.js';
import i18n from '../i18n';

const alpha = (hex, a) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default Vue.extend({
	i18n,

	components: {
	},

	data() {
		return {
			connection: null,
			stats: [],
			chartIn: null,
			chartOut: null,
			faExchangeAlt
		}
	},

	mounted() {
		Chart.defaults.global.defaultFontColor = getComputedStyle(document.documentElement).getPropertyValue('--fg');
		const opts = {
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
					backgroundColor: alpha('#E53935', 0.02),
					data: []
				}]
			},
			options: {
				aspectRatio: 3,
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 0
					}
				},
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
						position: 'right',
						ticks: {
							display: false,
							max: 100
						}
					}]
				},
				tooltips: {
					intersect: false,
					mode: 'index',
				}
			}
		};

		this.chartIn = new Chart(this.$refs.in, opts);
		this.chartOut = new Chart(this.$refs.out, opts);
	
		this.connection = this.$root.stream.useSharedConnection('queueStats');
		this.connection.on('stats', this.onStats);
		this.connection.on('statsLog', this.onStatsLog);
		this.connection.send('requestLog', {
			id: Math.random().toString().substr(2, 8),
			length: 200
		});
	},

	beforeDestroy() {
		this.connection.off('stats', this.onStats);
		this.connection.off('statsLog', this.onStatsLog);
		this.connection.dispose();
	},

	methods: {
		onStats(stats) {
			this.chartIn.data.labels.push('');
			this.chartIn.data.datasets[0].data.push(stats.inbox.activeSincePrevTick);
			this.chartIn.data.datasets[1].data.push(stats.inbox.active);
			this.chartIn.data.datasets[2].data.push(stats.inbox.waiting);
			this.chartIn.data.datasets[3].data.push(stats.inbox.delayed);
			this.chartOut.data.labels.push('');
			this.chartOut.data.datasets[0].data.push(stats.deliver.activeSincePrevTick);
			this.chartOut.data.datasets[1].data.push(stats.deliver.active);
			this.chartOut.data.datasets[2].data.push(stats.deliver.waiting);
			this.chartOut.data.datasets[3].data.push(stats.deliver.delayed);
			if (this.chartIn.data.datasets[0].data.length > 200) {
				this.chartIn.data.labels.shift();
				this.chartIn.data.datasets[0].data.shift();
				this.chartIn.data.datasets[1].data.shift();
				this.chartIn.data.datasets[2].data.shift();
				this.chartIn.data.datasets[3].data.shift();
				this.chartOut.data.labels.shift();
				this.chartOut.data.datasets[0].data.shift();
				this.chartOut.data.datasets[1].data.shift();
				this.chartOut.data.datasets[2].data.shift();
				this.chartOut.data.datasets[3].data.shift();
			}
			this.chartIn.update();
			this.chartOut.update();
		},

		onStatsLog(statsLog) {
			for (const stats of statsLog.reverse()) {
				this.onStats(stats);
			}
		}
	}
});
</script>
