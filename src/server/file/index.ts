/**
 * File Server
 */

import * as Koa from 'koa';
import * as cors from '@koa/cors';
import * as Router from '@koa/router';
import sendDriveFile from './send-drive-file';

// Init app
const app = new Koa();
app.use(cors());

// Init router
const router = new Router();

router.get('/:key', sendDriveFile);
router.get('/:key/*', sendDriveFile);

// Register router
app.use(router.routes());

module.exports = app;
