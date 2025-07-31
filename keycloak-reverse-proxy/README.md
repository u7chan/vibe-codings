# keycloak-reverse-proxy

KeycloakをNginxリバースプロキシ経由で公開し、OAuth2 Proxyによるサーバーサイド認証でシングルサインオンを実現するサンプル構成です。

## 概要

このリポジトリは、Docker Composeを使ってKeycloak、OAuth2 Proxy、Nginxリバースプロキシ、およびWebアプリケーションを簡単に立ち上げるためのものです。

### 主な機能

- **Keycloak**: OpenID Connect プロバイダとして動作
- **OAuth2 Proxy**: サーバーサイドでOIDC認証を処理
- **Nginx**: リバースプロキシとして各サービスを統合
- **WebApp**: 認証が必要な保護されたWebアプリケーション
- **自動初期化**: 事前設定されたレルムとクライアントの自動インポート

## 構成

```
keycloak-reverse-proxy/
├── docker-compose.yaml          # サービス定義（nginx, oauth2-proxy, keycloak）
├── nginx/
│   └── nginx.conf              # Nginxの設定ファイル
├── keycloak/
│   └── import/
│       └── example-realm.json  # Keycloakレルム設定（自動インポート）
├── webapp/
│   └── index.html              # 保護されたWebアプリケーション
└── README.md
```

## セットアップ手順

1. このリポジトリをクローンします。
2. DockerとDocker Composeがインストールされていることを確認します。
3. 以下のコマンドでサービスを起動します。

    ```sh
    docker compose up -d
    ```

4. サービスが起動するまで少し待ちます（初回は1-2分程度）。

## アクセス方法

### Webアプリケーション（OIDC認証デモ）

- URL: [http://localhost:8000/webapp](http://localhost:8000/webapp)
- または: [http://localhost:8000](http://localhost:8000) （自動リダイレクト）

### Keycloak管理コンソール

- URL: [http://localhost:8000/keycloak](http://localhost:8000/keycloak)
- 管理者ユーザー名: `admin`
- 管理者パスワード: `test`

### テストユーザー

- ユーザー名: `testuser`
- パスワード: `password`

## OIDC認証フロー

1. ユーザーが `/webapp` にアクセス
2. OAuth2 Proxyが認証状態をチェック
3. 未認証の場合、自動的にKeycloakログイン画面にリダイレクト
4. 認証成功後、OAuth2 Proxyがセッションを確立
5. 保護されたWebアプリケーションが表示される
6. ログアウト時は `/oauth2/sign_out` でセッション終了

## 技術仕様

### アーキテクチャ

- **Nginx**: フロントエンドプロキシ（ポート8000）
- **OAuth2 Proxy**: 認証プロキシ（ポート4180）
- **Keycloak**: OIDC プロバイダ（ポート8080）

### Keycloak設定

- **レルム**: `example`
- **クライアントID**: `webapp-client`
- **クライアントタイプ**: Public Client
- **認証フロー**: Authorization Code Flow with PKCE
- **リダイレクトURI**: `http://localhost:8000/oauth2/callback`

### セキュリティ機能

- **サーバーサイド認証**: OAuth2 Proxyによる認証処理
- **セッション管理**: HTTPクッキーベース
- **PKCE対応**: セキュアな認証フロー
- **セキュリティヘッダー**: XSS、CSRF保護

## 各種ファイルの説明

- `docker-compose.yaml`: Nginx、OAuth2 Proxy、Keycloakサービスの定義
- `nginx/nginx.conf`: OAuth2 Proxyとの連携設定、プロキシ設定
- `keycloak/import/example-realm.json`: 事前設定されたレルム定義（自動インポート）
- `webapp/index.html`: 保護された静的Webアプリケーション

## カスタマイズ

### 新しいクライアントの追加

1. `keycloak/import/example-realm.json` を編集
2. `clients` 配列に新しいクライアント設定を追加
3. コンテナを再起動

### ユーザーの追加

1. `keycloak/import/example-realm.json` の `users` 配列を編集
2. または Keycloak管理コンソールから手動追加

### アプリケーションの拡張

- `webapp/index.html` を編集してUI/機能を追加
- 複数ファイルに分割する場合は `webapp/` ディレクトリ内に配置

## トラブルシューティング

### サービスが起動しない場合

```sh
# ログを確認
docker compose logs

# 特定のサービスのログを確認
docker compose logs keycloak
docker compose logs nginx
```

### 認証エラーが発生する場合

1. ブラウザの開発者ツールでコンソールエラーを確認
2. Keycloak管理コンソールでクライアント設定を確認
3. リダイレクトURIが正しく設定されているか確認

### ポート競合の場合

`docker-compose.yaml` のポート設定を変更してください。

## 注意事項

- この構成は開発・検証用途です
- 本番利用時はセキュリティ設定等を見直してください
- HTTPSの使用を推奨します（本番環境）
- データベースの永続化が必要な場合は別途設定してください
