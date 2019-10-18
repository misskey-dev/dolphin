import * as S3 from 'aws-sdk/clients/s3';
import config from '../../config';
import * as httpsProxyAgent from 'https-proxy-agent';
import * as agentkeepalive from 'agentkeepalive';

const httpsAgent = config.proxy
	? new httpsProxyAgent(config.proxy)
	: new agentkeepalive.HttpsAgent({
			freeSocketTimeout: 30 * 1000
		});

export function getS3() {
	const conf = {
		endpoint: config.drive.endpoint,
		accessKeyId: config.drive.accessKey,
		secretAccessKey: config.drive.secretKey,
		region: config.drive.region,
		sslEnabled: config.drive.useSSL,
		s3ForcePathStyle: true,
		httpOptions: {
		}
	} as S3.ClientConfiguration;

	if (config.drive.useSSL) {
		conf.httpOptions!.agent = httpsAgent;
	}

	const s3 = new S3(conf);

	return s3;
}
