# Keycloak + OAuth2-Proxy + Nginx 認証基盤サンプル

このプロジェクトは、Keycloak、oauth2-proxy、Nginxを使用した認証基盤のサンプル実装です。Docker Composeを使用してローカル環境で簡単に起動できます。

## 🏗️ アーキテクチャ

```
ユーザー → Nginx (Port 8000) → OAuth2-Proxy (Port 4180) → Sample App (Port 3000)
                                       ↓
                               Keycloak (Port 8080)
                                       ↓
                               PostgreSQL (Port 5432)
```

## 📋 構成要素

- **Nginx**: リバースプロキシとして動作し、認証フローを制御
- **OAuth2-Proxy**: OpenID Connect/OAuth2認証プロキシ
- **Keycloak**: 認証・認可サーバー（OpenID Connect/OAuth2プロバイダー）
- **PostgreSQL**: Keycloakのデータベース
- **Sample App**: 保護対象のサンプルWebアプリケーション（Node.js/Express）

## 🚀 クイックスタート

### 前提条件

- Docker
- Docker Compose

### 起動手順

1. **リポジトリをクローン**

   ```bash
   git clone <repository-url>
   cd keycloak-example
   ```

2. **hostsファイルの設定**

   `/etc/hosts`ファイルに以下の行を追加してください：

   ```bash
   # macOS/Linux
   sudo echo "127.0.0.1 keycloak" >> /etc/hosts
   
   # または手動で編集
   sudo vi /etc/hosts
   ```

   追加する内容：

   ```
   127.0.0.1 keycloak
   ```

   **Windows の場合**: `C:\Windows\System32\drivers\etc\hosts` ファイルを管理者権限で編集してください。

3. **Docker Composeでサービスを起動**

   ```bash
   docker-compose up -d
   ```

4. **サービスの起動を確認**

   ```bash
   docker-compose ps
   ```

5. **アプリケーションにアクセス**

   ブラウザで `http://localhost:8000` にアクセスしてください。

### 初回アクセス時の流れ

1. `http://localhost:8000` にアクセス
2. 認証が必要なため、Keycloakのログイン画面にリダイレクト
3. 以下のテストユーザーでログイン：
   - **管理者**: `admin` / `admin`
   - **一般ユーザー**: `user` / `user`
4. 認証成功後、保護されたサンプルアプリケーションにアクセス可能

## 🔐 認証フロー

1. **未認証アクセス**: ユーザーが保護されたリソースにアクセス
2. **認証チェック**: OAuth2-Proxyが認証状態を確認
3. **リダイレクト**: 未認証の場合、Keycloakログイン画面にリダイレクト
4. **認証**: ユーザーがKeycloakでログイン
5. **トークン発行**: Keycloakが認証トークンを発行
6. **アクセス許可**: OAuth2-Proxyがトークンを検証し、アプリケーションへのアクセスを許可

## 🌐 アクセス可能なURL

| URL | 説明 |
|-----|------|
| `http://localhost:8000` | メインアプリケーション（認証必須） |
| `http://localhost:8000/app` | サンプルアプリケーション（認証必須） |
| `http://localhost:8000/app/profile` | ユーザープロフィール（認証必須） |
| `http://localhost:8000/app/api/user` | ユーザー情報API（認証必須） |
| `http://localhost:8000/auth` | Keycloak管理コンソール |
| `http://localhost:8000/oauth2/sign_out` | ログアウト |

## 👥 テストユーザー

| ユーザー名 | パスワード | グループ | 説明 |
|------------|------------|----------|------|
| `admin` | `admin` | `admins` | 管理者ユーザー |
| `user` | `user` | `users` | 一般ユーザー |

## ⚙️ 設定詳細

### Keycloak設定

- **レルム**: `demo-realm`
- **クライアントID**: `oauth2-proxy-client`
- **クライアントシークレット**: `oauth2-proxy-secret`
- **リダイレクトURI**: `http://localhost:8000/oauth2/callback`

### OAuth2-Proxy設定

- **プロバイダー**: `keycloak-oidc`
- **OIDC Issuer URL**: `http://keycloak:8080/realms/demo-realm`
- **スコープ**: `openid email profile`

### Nginx設定

- **認証エンドポイント**: `/oauth2/auth`
- **保護対象パス**: `/app`
- **プロキシ先**: `sample-app:3000`

## 🛠️ 開発・カスタマイズ

### ログの確認

```bash
# 全サービスのログを表示
docker-compose logs -f

# 特定のサービスのログを表示
docker-compose logs -f keycloak
docker-compose logs -f oauth2-proxy
docker-compose logs -f nginx
docker-compose logs -f sample-app
```

### 設定の変更

1. **Keycloak設定**: `keycloak/realm-export.json`を編集
2. **OAuth2-Proxy設定**: `oauth2-proxy/oauth2-proxy.cfg`を編集
3. **Nginx設定**: `nginx/nginx.conf`を編集
4. **サンプルアプリ**: `sample-app/`ディレクトリ内のファイルを編集

設定変更後は以下のコマンドで再起動：

```bash
docker-compose down
docker-compose up -d
```

### 新しいユーザーの追加

1. Keycloak管理コンソール（`http://localhost:8000/auth`）にアクセス
2. 管理者アカウント（`admin`/`admin`）でログイン
3. `demo-realm`レルムを選択
4. 「Users」メニューから新しいユーザーを作成

## 🔧 トラブルシューティング

### よくある問題

1. **サービスが起動しない**

   ```bash
   # ポートの競合を確認
   netstat -tulpn | grep :8000
   netstat -tulpn | grep :8080
   
   # Docker Composeを再起動
   docker-compose down
   docker-compose up -d
   ```

2. **認証が失敗する**
   - Keycloakが完全に起動するまで待つ（初回起動時は数分かかる場合があります）
   - ブラウザのキャッシュをクリア
   - プライベートブラウジングモードで試す

3. **データベース接続エラー**

   ```bash
   # PostgreSQLの状態を確認
   docker-compose logs postgres
   
   # Keycloakの起動を待つ
   docker-compose logs keycloak
   ```

### ヘルスチェック

```bash
# 各サービスの状態確認
curl http://localhost:8000/health
curl http://localhost:3000/health
curl http://localhost:8080/health/ready
```

## 📁 ファイル構成

```
keycloak-example/
├── docker-compose.yml          # Docker Compose設定
├── nginx/
│   └── nginx.conf             # Nginx設定
├── oauth2-proxy/
│   └── oauth2-proxy.cfg       # OAuth2-Proxy設定
├── keycloak/
│   └── realm-export.json      # Keycloakレルム設定
├── sample-app/                # サンプルアプリケーション
│   ├── Dockerfile
│   ├── package.json
│   └── app.js
└── README.md                  # このファイル
```

## 🔒 セキュリティ考慮事項

⚠️ **重要**: このサンプルは開発・学習目的です。本番環境では以下の点を考慮してください：

- 強力なパスワードとシークレットの設定
- 適切なCORS設定
- セキュリティヘッダーの追加
- ログ監視の実装
- 定期的なセキュリティアップデート

## 📚 参考資料

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth2-Proxy Documentation](https://oauth2-proxy.github.io/oauth2-proxy/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [OpenID Connect Specification](https://openid.net/connect/)
