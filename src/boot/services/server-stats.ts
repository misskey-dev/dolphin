import * as sysUtils from 'systeminformation';
import * as Deque from 'double-ended-queue';
import Xev from 'xev';
import * as osUtils from 'os-utils';

const ev = new Xev();

const interval = 2000;

/**
 * Report server stats regularly
 */
export default function() {
	const log = new Deque<any>();

	ev.on('requestServerStatsLog', x => {
		ev.emit(`serverStatsLog:${x.id}`, log.toArray().slice(0, x.length || 50));
	});

	async function tick() {
		const cpu = await cpuUsage();
		const memStats = await mem();
		const netStats = await net();
		const fsStats = await fs();

		const stats = {
			cpu: cpu,
			mem: {
				total: memStats.total,
				used: memStats.used,
				active: memStats.active,
			},
			net: {
				rx: Math.max(0, netStats.rx_sec),
				tx: Math.max(0, netStats.tx_sec),
			},
			fs: {
				r: Math.max(0, fsStats.rIO_sec),
				w: Math.max(0, fsStats.wIO_sec),
			}
		};
		ev.emit('serverStats', stats);
		log.unshift(stats);
		if (log.length > 200) log.pop();
	}

	tick();

	setInterval(tick, interval);
}

// CPU STAT
function cpuUsage() {
	return new Promise((res, rej) => {
		osUtils.cpuUsage((cpuUsage: number) => {
			res(cpuUsage);
		});
	});
}

// MEMORY STAT
async function mem() {
	const data = await sysUtils.mem();
	return data;
}

// NETWORK STAT
async function net() {
	const iface = await sysUtils.networkInterfaceDefault();
	const data = await sysUtils.networkStats(iface);
	return data[0];
}

// FS STAT
async function fs() {
	const data = await sysUtils.disksIO().catch(() => ({ rIO_sec: 0, wIO_sec: 0 }));
	return data;
}
