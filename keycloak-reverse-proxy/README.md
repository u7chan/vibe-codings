# keycloak-reverse-proxy

KeycloakをNginxリバースプロキシ経由で公開するためのサンプル構成です。

## 概要

このリポジトリは、Docker Composeを使ってKeycloakとNginxリバースプロキシを簡単に立ち上げるためのものです。
Nginxが`/keycloak`パスでKeycloakコンテナにリバースプロキシします。

## 構成

- `docker-compose.yaml`: サービス定義（nginx, keycloak）
- `nginx/nginx.conf`: Nginxの設定ファイル

## セットアップ手順

1. このリポジトリをクローンします。
2. DockerとDocker Composeがインストールされていることを確認します。
3. 以下のコマンドでサービスを起動します。

    ```sh
    docker compose up -d
    ```

4. ブラウザで [http://localhost:8000/keycloak](http://localhost:8000/keycloak) にアクセスします。

管理者ユーザー名: `admin`  パスワード: `test`

## 各種ファイルの説明

- `nginx/nginx.conf`: `/keycloak` へのリクエストをKeycloakコンテナ（8080番ポート）に転送します。
- `docker-compose.yaml`: NginxとKeycloakの2つのサービスを定義しています。

## 注意事項

- この構成は開発・検証用途です。本番利用時はセキュリティ設定等を見直してください。
