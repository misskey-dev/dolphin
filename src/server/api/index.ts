/**
 * API Server
 */

import * as Koa from 'koa';
import * as Router from '@koa/router';
import * as multer from '@koa/multer';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';

import endpoints from './endpoints';
import handler from './api-handler';
import { Instances } from '../../models';

// Init app
const app = new Koa();

app.use(cors({
	origin: '*'
}));

// No caching
app.use(async (ctx, next) => {
	ctx.set('Cache-Control', 'private, max-age=0, must-revalidate');
	await next();
});

app.use(bodyParser({
	// リクエストが multipart/form-data でない限りはJSONだと見なす
	detectJSON: ctx => !ctx.is('multipart/form-data')
}));

// Init multer instance
const upload = multer({
	storage: multer.diskStorage({})
});

// Init router
const router = new Router();

/**
 * Register endpoint handlers
 */
for (const endpoint of endpoints) {
	if (endpoint.meta.requireFile) {
		router.post(`/${endpoint.name}`, upload.single('file'), handler.bind(null, endpoint));
	} else {
		router.post(`/${endpoint.name}`, handler.bind(null, endpoint));
	}
}

router.get('/v1/instance/peers', async ctx => {
	const instances = await Instances.find({
		select: ['host']
	});

	ctx.body = instances.map(instance => instance.host);
});

// Return 404 for unknown API
router.all('*', async ctx => {
	ctx.status = 404;
});

// Register router
app.use(router.routes());

export default app;
