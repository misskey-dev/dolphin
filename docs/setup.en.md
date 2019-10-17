Dolphin Setup and Installation Guide
================================================================

We thank you for your interest in setting up your Dolphin server!
This guide describes how to install and setup Dolphin.

[Japanese version also available - 日本語版もあります](./setup.ja.md)

----------------------------------------------------------------

*1.* Create Dolphin user
----------------------------------------------------------------
Running dolphin as root is not a good idea so we create a user for that.
In debian for exemple :

```
adduser --disabled-password --disabled-login dolphin
```

*2.* Install dependencies
----------------------------------------------------------------
Please install and setup these softwares:

#### Dependencies :package:
* **[Node.js](https://nodejs.org/en/)** >= 11.7.0
* **[PostgreSQL](https://www.postgresql.org/)** >= 10
* **[Redis](https://redis.io/)**

##### Optional
* [Yarn](https://yarnpkg.com/) *Optional but recommended for security reason. If you won't install it, use `npx yarn` instead of `yarn`.*
* [Elasticsearch](https://www.elastic.co/) - required to enable the search feature
* [FFmpeg](https://www.ffmpeg.org/)

*3.* Install Dolphin
----------------------------------------------------------------
1. Connect to dolphin user.

	`su - dolphin`

2. Clone the dolphin repo from master branch.

	`git clone -b master git://github.com/syuilo/dolphin.git`

3. Navigate to dolphin directory

	`cd dolphin`

4. Checkout to the [latest release](https://github.com/syuilo/dolphin/releases/latest)

	`git checkout master`

5. Install dolphin dependencies.

	`yarn`

*4.* Configure Dolphin
----------------------------------------------------------------
1. Copy the `.config/example.yml` and rename it to `default.yml`.

	`cp .config/example.yml .config/default.yml`

2. Edit `default.yml`

*5.* Build Dolphin
----------------------------------------------------------------

Build dolphin with the following:

`NODE_ENV=production yarn build`

If you're on Debian, you will need to install the `build-essential`, `python` package.

If you're still encountering errors about some modules, use node-gyp:

1. `npx node-gyp configure`
2. `npx node-gyp build`
3. `NODE_ENV=production yarn build`

*6.* Init DB
----------------------------------------------------------------
``` shell
yarn run init
```

*7.* That is it.
----------------------------------------------------------------
Well done! Now, you have an environment that run to Dolphin.

### Launch normally
Just `NODE_ENV=production npm start`. GLHF!

### Launch with systemd

1. Create a systemd service here

	`/etc/systemd/system/dolphin.service`

2. Edit it, and paste this and save:

	```
	[Unit]
	Description=Dolphin daemon

	[Service]
	Type=simple
	User=dolphin
	ExecStart=/usr/bin/npm start
	WorkingDirectory=/home/dolphin/dolphin
	Environment="NODE_ENV=production"
	TimeoutSec=60
	StandardOutput=syslog
	StandardError=syslog
	SyslogIdentifier=dolphin
	Restart=always

	[Install]
	WantedBy=multi-user.target
	```

3. Reload systemd and enable the dolphin service.

	`systemctl daemon-reload ; systemctl enable dolphin`

4. Start the dolphin service.

	`systemctl start dolphin`

You can check if the service is running with `systemctl status dolphin`.

### How to update your Dolphin server to the latest version
1. `git checkout master`
2. `git pull`
3. `yarn install`
4. `NODE_ENV=production yarn build`
5. `yarn migrate`
6. Restart your Dolphin process to apply changes
7. Enjoy

If you encounter any problems with updating, please try the following:
1. `yarn clean` or `yarn cleanall`
2. Retry update (Don't forget `yarn install`

----------------------------------------------------------------

If you have any questions or troubles, feel free to contact us!
