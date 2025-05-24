const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Logging middleware
app.use(morgan("combined"));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

// Middleware to extract user information from headers set by oauth2-proxy
app.use((req, res, next) => {
  req.user = {
    username: req.headers["x-user"] || "unknown",
    email: req.headers["x-email"] || "unknown",
    groups: req.headers["x-groups"] ? req.headers["x-groups"].split(",") : [],
  };
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>認証済みアプリケーション</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                color: #333;
                margin-bottom: 30px;
            }
            .user-info {
                background: #e8f4fd;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #007bff;
            }
            .user-info h3 {
                margin-top: 0;
                color: #007bff;
            }
            .info-item {
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
            }
            .info-label {
                font-weight: bold;
                color: #555;
                display: inline-block;
                width: 100px;
            }
            .info-value {
                color: #333;
            }
            .groups {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            .group-tag {
                background: #28a745;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
            }
            .nav-links {
                margin: 20px 0;
                text-align: center;
            }
            .nav-links a {
                display: inline-block;
                margin: 0 10px;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            .nav-links a:hover {
                background: #0056b3;
            }
            .success-message {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #c3e6cb;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 認証成功！</h1>
                <p>Keycloak + OAuth2-Proxy + Nginx 認証基盤デモ</p>
            </div>

            <div class="success-message">
                <strong>おめでとうございます！</strong> 認証が正常に完了し、保護されたアプリケーションにアクセスできています。
            </div>

            <div class="user-info">
                <h3>👤 ユーザー情報</h3>
                <div class="info-item">
                    <span class="info-label">ユーザー名:</span>
                    <span class="info-value">${req.user.username}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">メール:</span>
                    <span class="info-value">${req.user.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">グループ:</span>
                    <div class="groups">
                        ${req.user.groups
                          .map(
                            (group) => `<span class="group-tag">${group}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            </div>

            <div class="nav-links">
                <a href="/profile">プロフィール</a>
                <a href="/api/user">API テスト</a>
                <a href="/oauth2/sign_out">ログアウト</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get("/profile", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>プロフィール - 認証済みアプリケーション</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .back-link {
                margin-bottom: 20px;
            }
            .back-link a {
                color: #007bff;
                text-decoration: none;
            }
            .profile-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 20px 0;
            }
            .avatar {
                width: 80px;
                height: 80px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back-link">
                <a href="/">← ホームに戻る</a>
            </div>

            <h1>👤 ユーザープロフィール</h1>

            <div class="profile-card">
                <div class="avatar">👤</div>
                <h2>${req.user.username}</h2>
                <p>${req.user.email}</p>
                <p>グループ: ${req.user.groups.join(", ")}</p>
            </div>

            <h3>📊 セッション情報</h3>
            <p><strong>アクセス時刻:</strong> ${new Date().toLocaleString(
              "ja-JP"
            )}</p>
            <p><strong>User-Agent:</strong> ${req.headers["user-agent"]}</p>
        </div>
    </body>
    </html>
  `);
});

// API endpoint to return user information as JSON
app.get("/api/user", (req, res) => {
  res.json({
    success: true,
    user: req.user,
    timestamp: new Date().toISOString(),
    message: "ユーザー情報を正常に取得しました",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - ページが見つかりません</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f5f5f5;
            }
            .error-container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1>404</h1>
            <p>お探しのページが見つかりません</p>
            <a href="/">ホームに戻る</a>
        </div>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "サーバーエラーが発生しました",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sample app listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
