import * as Koa from 'koa';
import * as manifest from '../../client/assets/manifest.json';
import config from '../../config';

module.exports = async (ctx: Koa.Context) => {
	const json = JSON.parse(JSON.stringify(manifest));

	json.short_name = config.name;
	json.name = config.name;

	ctx.set('Cache-Control', 'max-age=300');
	ctx.body = json;
};
