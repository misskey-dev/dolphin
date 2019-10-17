Dolphin構築の手引き
================================================================

Dolphinサーバーの構築にご関心をお寄せいただきありがとうございます！
このガイドではDolphinのインストール・セットアップ方法について解説します。

[英語版もあります - English version also available](./setup.en.md)

----------------------------------------------------------------

*1.* Dolphinユーザーの作成
----------------------------------------------------------------
Dolphinはrootユーザーで実行しない方がよいため、代わりにユーザーを作成します。
Debianの例:

```
adduser --disabled-password --disabled-login dolphin
```

*2.* 依存関係をインストールする
----------------------------------------------------------------
これらのソフトウェアをインストール・設定してください:

#### 依存関係 :package:
* **[Node.js](https://nodejs.org/en/)** (11.7.0以上)
* **[PostgreSQL](https://www.postgresql.org/)** (10以上)
* **[Redis](https://redis.io/)**

##### オプション
* [Yarn](https://yarnpkg.com/)
	* セキュリティの観点から推奨されます。 yarn をインストールしない方針の場合は、文章中の `yarn` を適宜 `npx yarn` と読み替えてください。
* [Elasticsearch](https://www.elastic.co/)
	* 検索機能を有効にするためにはインストールが必要です。
* [FFmpeg](https://www.ffmpeg.org/)

*3.* Dolphinのインストール
----------------------------------------------------------------
1. dolphinユーザーを使用

	`su - dolphin`

2. masterブランチからDolphinレポジトリをクローン

	`git clone -b master git://github.com/syuilo/dolphin.git`

3. dolphinディレクトリに移動

	`cd dolphin`

4. [最新のリリース](https://github.com/syuilo/dolphin/releases/latest)を確認

	`git checkout master`

5. Dolphinの依存パッケージをインストール

	`yarn install`

*4.* 設定ファイルを作成する
----------------------------------------------------------------
1. `.config/example.yml`をコピーし名前を`default.yml`にする。

	`cp .config/example.yml .config/default.yml`

2. `default.yml` を編集する。

*5.* Dolphinのビルド
----------------------------------------------------------------

次のコマンドでDolphinをビルドしてください:

`NODE_ENV=production yarn build`

Debianをお使いであれば、`build-essential`パッケージをインストールする必要があります。

何らかのモジュールでエラーが発生する場合はnode-gypを使ってください:
1. `npx node-gyp configure`
2. `npx node-gyp build`
3. `NODE_ENV=production yarn build`

*6.* データベースを初期化
----------------------------------------------------------------
``` shell
yarn run init
```

*7.* 以上です！
----------------------------------------------------------------
お疲れ様でした。これでDolphinを動かす準備は整いました。

### 通常起動
`NODE_ENV=production yarn start`するだけです。GLHF!

### systemdを用いた起動
1. systemdサービスのファイルを作成

	`/etc/systemd/system/dolphin.service`

2. エディタで開き、以下のコードを貼り付けて保存:

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

	CentOSで1024以下のポートを使用してDolphinを使用する場合は`ExecStart=/usr/bin/sudo /usr/bin/npm start`に変更する必要があります。

3. systemdを再読み込みしdolphinサービスを有効化

	`systemctl daemon-reload; systemctl enable dolphin`

4. dolphinサービスの起動

	`systemctl start dolphin`

`systemctl status dolphin`と入力すると、サービスの状態を調べることができます。

### Dolphinを最新バージョンにアップデートする方法:
1. `git checkout master`
2. `git pull`
3. `yarn install`
4. `NODE_ENV=production yarn build`
5. `yarn migrate`

なにか問題が発生した場合は、`yarn clean`または`yarn cleanall`すると直る場合があります。

----------------------------------------------------------------

なにかお困りのことがありましたらお気軽にご連絡ください。
