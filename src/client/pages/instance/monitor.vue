<template>
<div class="dp-instance-monitor">
	<section class="_section">
		<div class="title"><fa :icon="faMicrochip"/> {{ $t('cpuAndMemory') }}</div>
		<div class="content" style="margin-top: -8px; margin-bottom: -12px;">
			<canvas ref="cpumem"></canvas>
		</div>
		<div class="content" v-if="serverInfo">
			<div class="table">
				<div class="row">
					<div class="cell"><div class="label">CPU</div>{{ serverInfo.cpu.model }}</div>
				</div>
				<div class="row">
					<div class="cell"><div class="label">MEM total</div>{{ serverInfo.mem.total | bytes }}</div>
					<div class="cell"><div class="label">MEM used</div>{{ memUsage | bytes }} ({{ (memUsage / serverInfo.mem.total * 100).toFixed(0) }}%)</div>
					<div class="cell"><div class="label">MEM free</div>{{ serverInfo.mem.total - memUsage | bytes }} ({{ ((serverInfo.mem.total - memUsage) / serverInfo.mem.total * 100).toFixed(0) }}%)</div>
				</div>
			</div>
		</div>
	</section>
	<section class="_section">
		<div class="title"><fa :icon="faHdd"/> {{ $t('disk') }}</div>
		<div class="content" style="margin-top: -8px; margin-bottom: -12px;">
			<canvas ref="disk"></canvas>
		</div>
		<div class="content" v-if="serverInfo">
			<div class="table">
				<div class="row">
					<div class="cell"><div class="label">Disk total</div>{{ serverInfo.fs.total | bytes }}</div>
					<div class="cell"><div class="label">Disk used</div>{{ serverInfo.fs.used | bytes }} ({{ (serverInfo.fs.used / serverInfo.fs.total * 100).toFixed(0) }}%)</div>
					<div class="cell"><div class="label">Disk free</div>{{ serverInfo.fs.total - serverInfo.fs.used | bytes }} ({{ ((serverInfo.fs.total - serverInfo.fs.used) / serverInfo.fs.total * 100).toFixed(0) }}%)</div>
				</div>
			</div>
		</div>
	</section>
	<section class="_section">
		<div class="title"><fa :icon="faExchangeAlt"/> {{ $t('network') }}</div>
		<div class="content" style="margin-top: -8px; margin-bottom: -12px;">
			<canvas ref="net"></canvas>
		</div>
		<div class="content" v-if="serverInfo">
			<div class="table">
				<div class="row">
					<div class="cell"><div class="label">Interface</div>{{ serverInfo.net.interface }}</div>
				</div>
			</div>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faTachometerAlt, faExchangeAlt, faMicrochip, faHdd } from '@fortawesome/free-solid-svg-icons';
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
			serverInfo: null,
			memUsage: 0,
			chartCpuMem: null,
			chartNet: null,
			faTachometerAlt, faExchangeAlt, faMicrochip, faHdd
		}
	},

	mounted() {
		Chart.defaults.global.defaultFontColor = getComputedStyle(document.documentElement).getPropertyValue('--fg');

		this.chartCpuMem = new Chart(this.$refs.cpumem, {
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
					label: 'MEM (active)',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#935dbf',
					backgroundColor: alpha('#935dbf', 0.02),
					data: []
				}, {
					label: 'MEM (used)',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#935dbf',
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

		this.chartNet = new Chart(this.$refs.net, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'In',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#94a029',
					backgroundColor: alpha('#94a029', 0.1),
					data: []
				}, {
					label: 'Out',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#ff9156',
					backgroundColor: alpha('#ff9156', 0.1),
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

		this.chartDisk = new Chart(this.$refs.disk, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'Read',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#94a029',
					backgroundColor: alpha('#94a029', 0.1),
					data: []
				}, {
					label: 'Write',
					pointRadius: 0,
					lineTension: 0,
					borderWidth: 2,
					borderColor: '#ff9156',
					backgroundColor: alpha('#ff9156', 0.1),
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

		this.$root.api('admin/server-info', {}).then(res => {
			this.serverInfo = res;

			this.connection = this.$root.stream.useSharedConnection('serverStats');
			this.connection.on('stats', this.onStats);
			this.connection.on('statsLog', this.onStatsLog);
			this.connection.send('requestLog', {
				id: Math.random().toString().substr(2, 8),
				length: 150
			});
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
			const memActive = (stats.mem.active / this.serverInfo.mem.total * 100).toFixed(0);
			const memUsed = (stats.mem.used / this.serverInfo.mem.total * 100).toFixed(0);
			this.memUsage = stats.mem.active;

			this.chartCpuMem.data.labels.push('');
			this.chartCpuMem.data.datasets[0].data.push(cpu);
			this.chartCpuMem.data.datasets[1].data.push(memActive);
			this.chartCpuMem.data.datasets[2].data.push(memUsed);
			this.chartNet.data.labels.push('');
			this.chartNet.data.datasets[0].data.push(stats.net.rx);
			this.chartNet.data.datasets[1].data.push(stats.net.tx);
			this.chartDisk.data.labels.push('');
			this.chartDisk.data.datasets[0].data.push(stats.fs.r);
			this.chartDisk.data.datasets[1].data.push(stats.fs.w);
			if (this.chartCpuMem.data.datasets[0].data.length > 150) {
				this.chartCpuMem.data.labels.shift();
				this.chartCpuMem.data.datasets[0].data.shift();
				this.chartCpuMem.data.datasets[1].data.shift();
				this.chartCpuMem.data.datasets[2].data.shift();
				this.chartNet.data.labels.shift();
				this.chartNet.data.datasets[0].data.shift();
				this.chartNet.data.datasets[1].data.shift();
				this.chartDisk.data.labels.shift();
				this.chartDisk.data.datasets[0].data.shift();
				this.chartDisk.data.datasets[1].data.shift();
			}
			this.chartCpuMem.update();
			this.chartNet.update();
			this.chartDisk.update();
		},

		onStatsLog(statsLog) {
			for (const stats of statsLog.reverse()) {
				this.onStats(stats);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
@import '../../theme';

.dp-instance-monitor {
	> section {
		> .content {
			> .table {
				> .row {
					display: flex;

					&:not(:last-child) {
						margin-bottom: 16px;

						@media (max-width: 500px) {
							margin-bottom: 8px;
						}
					}

					> .cell {
						flex: 1;

						> .label {
							font-size: 80%;
							opacity: 0.7;

							> .icon {
								margin-right: 4px;
								display: none;
							}
						}
					}
				}
			}
		}
	}
}
</style>
