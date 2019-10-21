/**
 * Core Server
 */

import * as fs from 'fs';
import * as http from 'http';
import * as http2 from 'http2';
import * as https from 'https';
import * as zlib from 'zlib';
import * as Koa from 'koa';
import * as Router from '@koa/router';
import * as mount from 'koa-mount';
import * as compress from 'koa-compress';
import * as koaLogger from 'koa-logger';

import activityPub from './activitypub';
import nodeinfo from './nodeinfo';
import wellKnown from './well-known';
import config from '../config';
import apiServer from './api';
import Logger from '../services/logger';
import { genAvatar } from '../misc/gen-avatar';
import { createTemp } from '../misc/create-temp';

export const serverLogger = new Logger('server', 'gray', false);

// Init app
const app = new Koa();
app.proxy = true;

if (!['production', 'test'].includes(process.env.NODE_ENV || '')) {
	// Logger
	app.use(koaLogger(str => {
		serverLogger.info(str);
	}));
}

// Compress response
app.use(compress({
	flush: zlib.constants.Z_SYNC_FLUSH
}));

// HSTS
// 6months (15552000sec)
if (config.url.startsWith('https') && !config.disableHsts) {
	app.use(async (ctx, next) => {
		ctx.set('strict-transport-security', 'max-age=15552000; preload');
		await next();
	});
}

app.use(mount('/api', apiServer));
app.use(mount('/files', require('./file')));
app.use(mount('/proxy', require('./proxy')));

// Init router
const router = new Router();

// Routing
router.use(activityPub.routes());
router.use(nodeinfo.routes());
router.use(wellKnown.routes());

router.get('/avatar/:x', async ctx => {
	const [temp] = await createTemp();
	await genAvatar(ctx.params.x, fs.createWriteStream(temp));
	ctx.set('Content-Type', 'image/png');
	ctx.body = fs.createReadStream(temp);
});

// Register router
app.use(router.routes());

app.use(mount(require('./web')));

function createServer() {
	if (config.https) {
		const certs: any = {};
		for (const k of Object.keys(config.https)) {
			certs[k] = fs.readFileSync(config.https[k]);
		}
		certs['allowHTTP1'] = true;
		return http2.createSecureServer(certs, app.callback()) as https.Server;
	} else {
		return http.createServer(app.callback());
	}
}

// For testing
export const startServer = () => {
	const server = createServer();

	// Init stream server
	require('./api/streaming')(server);

	// Listen
	server.listen(config.port);

	return server;
};

export default () => new Promise(resolve => {
	const server = createServer();

	// Init stream server
	require('./api/streaming')(server);

	// Listen
	server.listen(config.port, resolve);
});
