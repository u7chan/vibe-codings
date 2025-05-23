// ゲームの状態管理
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;
    this.lives = 3;
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameOver = false;
    this.highScore = localStorage.getItem("pikachuGameHighScore") || 0;

    // ゲームオブジェクト
    this.pikachu = new Pikachu(300, 375);
    this.stars = [];
    this.clouds = [];
    this.particles = [];

    // タイマー
    this.starSpawnTimer = 0;
    this.cloudSpawnTimer = 0;
    this.gameOverAnimationTimer = 0;

    // イベントリスナーの設定
    this.setupEventListeners();

    // 最高スコアの表示
    this.updateHighScoreDisplay();

    // ゲームループの開始
    this.gameLoop();
  }

  updateHighScoreDisplay() {
    // 最高スコア表示要素がある場合は更新
    const highScoreElement = document.getElementById("highScore");
    if (highScoreElement) {
      highScoreElement.textContent = this.highScore;
    }
  }

  setupEventListeners() {
    // マウス入力
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.gameRunning && !this.gamePaused) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.pikachu.setTarget(mouseX, mouseY);
      }
    });

    // ボタンイベント
    document.getElementById("startButton").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
      this.togglePause();
    });

    document
      .getElementById("fullscreenButton")
      .addEventListener("click", () => {
        this.toggleFullscreen();
      });

    // フルスクリーン状態の変化を監視
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        // フルスクリーンから出た時の処理
        document.getElementById("fullscreenButton").textContent =
          "フルスクリーン";
        document.body.style.padding = "10px";
        document.querySelector(".game-container").style.height = "auto";
        document.querySelector(".game-container").style.display = "block";
      }
    });
  }

  startGame() {
    this.gameRunning = true;
    this.gamePaused = false;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.stars = [];
    this.clouds = [];
    this.particles = [];
    this.pikachu.reset();

    document.getElementById("startButton").disabled = true;
    document.getElementById("pauseButton").disabled = false;

    this.updateUI();
  }

  togglePause() {
    this.gamePaused = !this.gamePaused;
    document.getElementById("pauseButton").textContent = this.gamePaused
      ? "再開"
      : "一時停止";
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      // フルスクリーンに入る
      document.documentElement
        .requestFullscreen()
        .then(() => {
          document.getElementById("fullscreenButton").textContent =
            "フルスクリーン終了";
          // フルスクリーン時のスタイル調整
          document.body.style.padding = "0";
          document.querySelector(".game-container").style.height = "100vh";
          document.querySelector(".game-container").style.display = "flex";
          document.querySelector(".game-container").style.flexDirection =
            "column";
          document.querySelector(".game-container").style.justifyContent =
            "center";
        })
        .catch((err) => {
          console.log("フルスクリーンエラー:", err);
        });
    } else {
      // フルスクリーンから出る
      document.exitFullscreen().then(() => {
        document.getElementById("fullscreenButton").textContent =
          "フルスクリーン";
        // 通常時のスタイルに戻す
        document.body.style.padding = "10px";
        document.querySelector(".game-container").style.height = "auto";
        document.querySelector(".game-container").style.display = "block";
      });
    }
  }

  triggerGameOver() {
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameOver = true;
    this.gameOverAnimationTimer = 0;

    // 最高スコアの更新
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("pikachuGameHighScore", this.highScore);
      this.updateHighScoreDisplay();
    }

    document.getElementById("startButton").disabled = false;
    document.getElementById("pauseButton").disabled = true;
    document.getElementById("pauseButton").textContent = "一時停止";

    // ゲームオーバーパーティクルを作成
    this.createGameOverParticles();
  }

  createGameOverParticles() {
    // 画面全体に派手なパーティクル効果を作成
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const colors = ["#FF6B6B", "#FFD700", "#4ECDC4", "#45B7D1", "#96CEB4"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, color));
    }
  }

  drawGameOverScreen() {
    if (!this.gameOver) return;

    this.gameOverAnimationTimer++;

    // 背景オーバーレイ（アニメーション付き）
    const alpha = Math.min(0.8, this.gameOverAnimationTimer / 60);
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // メインタイトル（バウンス効果）
    const bounce = Math.sin(this.gameOverAnimationTimer * 0.1) * 5;
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.strokeStyle = "#FF6B6B";
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(
      "ゲームオーバー",
      this.canvas.width / 2,
      this.canvas.height / 2 - 60 + bounce
    );
    this.ctx.fillText(
      "ゲームオーバー",
      this.canvas.width / 2,
      this.canvas.height / 2 - 60 + bounce
    );

    // スコア情報
    this.ctx.font = "bold 20px Arial";
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(
      `最終スコア: ${this.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 15
    );

    // 最高スコア
    if (this.score >= this.highScore) {
      this.ctx.fillStyle = "#FFD700";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText(
        "🎉 新記録達成！ 🎉",
        this.canvas.width / 2,
        this.canvas.height / 2 + 10
      );
    }

    this.ctx.fillStyle = "#87CEEB";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      `最高スコア: ${this.highScore}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 35
    );

    // リスタート指示
    const blinkAlpha = Math.sin(this.gameOverAnimationTimer * 0.2) * 0.5 + 0.5;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${blinkAlpha})`;
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillText(
      "「ゲーム開始」ボタンでリスタート",
      this.canvas.width / 2,
      this.canvas.height / 2 + 65
    );

    // 統計情報
    this.ctx.fillStyle = "#CCCCCC";
    this.ctx.font = "14px Arial";
    this.ctx.fillText(
      "ライフが0になりました",
      this.canvas.width / 2,
      this.canvas.height / 2 + 90
    );
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("lives").textContent = this.lives;
  }

  spawnStar() {
    if (this.starSpawnTimer <= 0) {
      this.stars.push(
        new Star(Math.random() * (this.canvas.width - 40) + 20, -20)
      );
      this.starSpawnTimer = 60 + Math.random() * 60; // 1-2秒間隔
    }
    this.starSpawnTimer--;
  }

  spawnCloud() {
    if (this.cloudSpawnTimer <= 0) {
      this.clouds.push(
        new Cloud(Math.random() * (this.canvas.width - 60) + 30, -30)
      );
      this.cloudSpawnTimer = 120 + Math.random() * 120; // 2-4秒間隔
    }
    this.cloudSpawnTimer--;
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;

    // ピカチュウの更新
    this.pikachu.update();

    // 星の生成と更新
    this.spawnStar();
    this.stars.forEach((star, index) => {
      star.update();

      // 画面外に出た星を削除
      if (star.y > this.canvas.height) {
        this.stars.splice(index, 1);
      }

      // ピカチュウとの衝突判定
      if (this.pikachu.collidesWith(star)) {
        this.stars.splice(index, 1);
        this.score += 10;
        this.updateUI();

        // パーティクル効果
        this.createParticles(star.x, star.y, "#FFD700");
      }
    });

    // 雲の生成と更新
    this.spawnCloud();
    this.clouds.forEach((cloud, index) => {
      cloud.update();

      // 画面外に出た雲を削除
      if (cloud.y > this.canvas.height) {
        this.clouds.splice(index, 1);
      }

      // ピカチュウとの衝突判定
      if (this.pikachu.collidesWith(cloud)) {
        this.clouds.splice(index, 1);
        this.lives--;
        this.updateUI();

        // パーティクル効果
        this.createParticles(cloud.x, cloud.y, "#666");

        if (this.lives <= 0) {
          this.triggerGameOver();
        }
      }
    });

    // パーティクルの更新
    this.particles.forEach((particle, index) => {
      particle.update();
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  draw() {
    // 背景をクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 背景グラデーション
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98FB98");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // ゲームオブジェクトの描画
    this.pikachu.draw(this.ctx);

    this.stars.forEach((star) => star.draw(this.ctx));
    this.clouds.forEach((cloud) => cloud.draw(this.ctx));
    this.particles.forEach((particle) => particle.draw(this.ctx));

    // ゲームオーバー画面
    this.drawGameOverScreen();

    // 一時停止画面
    if (this.gamePaused) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "#FFD700";
      this.ctx.font = "bold 28px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "一時停止中",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// ピカチュウクラス
class Pikachu {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 6;
    this.initialX = x;
    this.initialY = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.85;
  }

  setTarget(x, y) {
    // マウス位置をピカチュウの中心に合わせて調整
    this.targetX = x - this.width / 2;
    this.targetY = y - this.height / 2;

    // 画面境界内に制限（新しいキャンバスサイズ600x450に対応）
    this.targetX = Math.max(0, Math.min(this.targetX, 600 - this.width));
    this.targetY = Math.max(0, Math.min(this.targetY, 450 - this.height));
  }

  update() {
    // ターゲット位置に向かって加速度を計算
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // ターゲットに向かう力を加える
      const forceX = (dx / distance) * 2.0;
      const forceY = (dy / distance) * 2.0;

      this.vx += forceX;
      this.vy += forceY;
    }

    // 摩擦を適用
    this.vx *= this.friction;
    this.vy *= this.friction;

    // 位置を更新
    this.x += this.vx;
    this.y += this.vy;

    // 壁との衝突判定と跳ね返り（新しいキャンバスサイズ600x450に対応）
    if (this.x <= 0) {
      this.x = 0;
      this.vx = -this.vx * 0.7; // 跳ね返り（エネルギー減衰）
    }
    if (this.x >= 600 - this.width) {
      this.x = 600 - this.width;
      this.vx = -this.vx * 0.7;
    }
    if (this.y <= 0) {
      this.y = 0;
      this.vy = -this.vy * 0.7;
    }
    if (this.y >= 450 - this.height) {
      this.y = 450 - this.height;
      this.vy = -this.vy * 0.7;
    }
  }

  collidesWith(object) {
    return (
      this.x < object.x + object.width &&
      this.x + this.width > object.x &&
      this.y < object.y + object.height &&
      this.y + this.height > object.y
    );
  }

  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.targetX = this.initialX;
    this.targetY = this.initialY;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx) {
    // ピカチュウの描画（シンプルな黄色い円）
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 耳
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 30, this.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // 耳の先端（黒）
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 30, this.y + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(this.x + 15, this.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 25, this.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // 頬の赤い部分
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(this.x + 8, this.y + 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 32, this.y + 20, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 星クラス
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 2 + Math.random() * 2;
    this.rotation = 0;
  }

  update() {
    this.y += this.speed;
    this.rotation += 0.1;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // 星の描画
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// 雲クラス
class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 30;
    this.speed = 1.5 + Math.random();
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    // 雷雲の描画
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y + 15, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 25, this.y + 10, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 40, this.y + 15, 12, 0, Math.PI * 2);
    ctx.fill();

    // 雷
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + 25, this.y + 25);
    ctx.lineTo(this.x + 20, this.y + 35);
    ctx.lineTo(this.x + 30, this.y + 35);
    ctx.lineTo(this.x + 25, this.y + 45);
    ctx.stroke();
  }
}

// パーティクルクラス
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.life = 30;
    this.maxLife = 30;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // 重力
    this.life--;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle =
      this.color +
      Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0");
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ゲーム開始
window.addEventListener("load", () => {
  new Game();
});
