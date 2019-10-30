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
		const usedmem = await usedMem();
		const totalmem = await totalMem();
		const netStats = await net();
		const fsStats = await fs();

		const stats = {
			cpu: cpu,
			mem: {
				total: totalmem,
				used: usedmem
			},
			net: {
				rx: netStats.rx_sec,
				tx: netStats.tx_sec,
			},
			fs: {
				r: fsStats.rIO_sec,
				w: fsStats.wIO_sec,
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

// MEMORY(excl buffer + cache) STAT
async function usedMem() {
	const data = await sysUtils.mem();
	return data.active;
}

// TOTAL MEMORY STAT
async function totalMem() {
	const data = await sysUtils.mem();
	return data.total;
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
