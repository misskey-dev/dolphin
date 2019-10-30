<template>
<section class="_section dp-instance-monitor">
	<div class="title"><fa :icon="faTachometerAlt"/> {{ $t('monitor') }}</div>
	<div class="content">
		<canvas ref="chart"></canvas>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
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

	metaInfo() {
		return {
			title: `${this.$t('monitor')} | ${this.$t('instance')}`
		};
	},

	components: {
	},

	data() {
		return {
			connection: null,
			stats: [],
			chart: null,
			faTachometerAlt
		}
	},

	mounted() {
		Chart.defaults.global.defaultFontColor = getComputedStyle(document.documentElement).getPropertyValue('--fg');
		this.chart = new Chart(this.$refs.chart, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'CPU',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#5da1c1',
					backgroundColor: alpha('#5da1c1', 0.1),
					data: []
				}, {
					label: 'MEM',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#935dbf',
					backgroundColor: alpha('#935dbf', 0.02),
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
		});
	
		this.connection = this.$root.stream.useSharedConnection('serverStats');
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
			const cpu = (stats.cpu * 100).toFixed(0);
			const mem = (stats.mem.used / stats.mem.total * 100).toFixed(0);

			this.chart.data.labels.push('');
			this.chart.data.datasets[0].data.push(cpu);
			this.chart.data.datasets[1].data.push(mem);
			if (this.chart.data.datasets[0].data.length > 200) {
				this.chart.data.labels.shift();
				this.chart.data.datasets[0].data.shift();
				this.chart.data.datasets[1].data.shift();
			}
			this.chart.update();
		},

		onStatsLog(statsLog) {
			for (const stats of statsLog.reverse()) {
				this.onStats(stats);
			}
		}
	}
});
</script>
