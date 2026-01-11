(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Resize canvas to fit width while keeping aspect ratio
  function fitCanvas() {
    const maxWidth = Math.min(window.innerWidth - 16, 1200);
    const scale = maxWidth / 800;
    canvas.style.width = 800 * scale + 'px';
    canvas.style.height = 450 * scale + 'px';
  }
  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  // Game state
  let last = performance.now();
  let state = 'start'; // 'start', 'playing', 'gameover'
  let score = 0;

  // Player
  const player = {
    x: 80, y: 350, w: 36, h: 48,
    vx: 0, vy: 0, speed: 240, jumpForce: -480, onGround: false
  };

  // Platforms and items
  const groundY = 400;
  const coins = [];
  function spawnCoins() {
    coins.length = 0;
    for (let i = 0; i < 8; i++) {
      coins.push({
        x: 220 + i * 70,
        y: 300 - (i % 3) * 40,
        r: 10,
        collected: false
      });
    }
  }
  spawnCoins();

  // Input
  const input = { left:false, right:false, jump:false };
  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
    if (e.code === 'Space') {
      if (state === 'start') { startGame(); }
      else if (state === 'gameover') resetGame();
      else input.jump = true;
    }
  });
  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    if (e.code === 'Space') input.jump = false;
  });

  // Touch buttons
  function bindButton(id, onStart, onEnd) {
    const el = document.getElementById(id);
    if (!el) return;
    let active = false;
    const start = e => { e.preventDefault(); active = true; onStart(); };
    const end = e => { e.preventDefault(); active = false; onEnd(); };
    el.addEventListener('pointerdown', start);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    // hide on non-touch devices
    if (!('ontouchstart' in window)) el.style.display = 'none';
  }
  bindButton('leftBtn', () => input.left = true, () => input.left = false);
  bindButton('rightBtn', () => input.right = true, () => input.right = false);
  bindButton('jumpBtn', () => input.jump = true, () => input.jump = false);

  // Physics & update
  const GRAVITY = 1400;
  function update(dt) {
    // start screen idle animation
    if (state !== 'playing') return;

    // horizontal movement
    if (input.left) player.vx = -player.speed;
    else if (input.right) player.vx = player.speed;
    else player.vx = 0;

    // jump
    if (input.jump && player.onGround) {
      player.vy = player.jumpForce;
      player.onGround = false;
    }

    // integrate
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // boundaries
    if (player.x < 10) player.x = 10;
    if (player.x + player.w > 790) player.x = 790 - player.w;

    // ground collision
    if (player.y + player.h >= groundY) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    // collect coins
    coins.forEach(c => {
      if (c.collected) return;
      const px = player.x + player.w/2, py = player.y + player.h/2;
      const dx = px - c.x, dy = py - c.y;
      if (Math.hypot(dx,dy) < c.r + Math.max(player.w, player.h)/2 * 0.5) {
        c.collected = true;
        score += 10;
      }
    });

    // win condition: all collected
    if (coins.every(c => c.collected)) {
      state = 'gameover';
    }
  }

  // Draw
  function draw() {
    // clear
    ctx.fillStyle = '#122';
    ctx.fillRect(0,0,800,450);

    // ground
    ctx.fillStyle = '#1a4';
    ctx.fillRect(0, groundY, 800, 50);

    // coins
    coins.forEach(c => {
      if (c.collected) return;
      ctx.beginPath();
      ctx.fillStyle = '#ffd700';
      ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#aa7';
      ctx.stroke();
    });

    // player
    ctx.fillStyle = '#66c2ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // simple eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 8, player.y + 12, 6, 6);
    ctx.fillRect(player.x + player.w - 14, player.y + 12, 6, 6);

    // UI
    ctx.fillStyle = '#fff';
    ctx.font = '18px system-ui, Arial';
    ctx.fillText('Score: ' + score, 12, 28);

    if (state === 'start') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(100, 90, 600, 260);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui, Arial';
      ctx.fillText('Simple Collect Game', 260, 160);
      ctx.font = '18px system-ui, Arial';
      ctx.fillText('Use Arrows / A D to move, Space to jump', 230, 200);
      ctx.fillText('Press Space to Start', 320, 260);
    } else if (state === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(120, 120, 560, 210);
      ctx.fillStyle = '#fff';
      ctx.font = '30px system-ui, Arial';
      ctx.fillText('Game Over', 330, 190);
      ctx.font = '22px system-ui, Arial';
      ctx.fillText('Final Score: ' + score, 340, 230);
      ctx.font = '18px system-ui, Arial';
      ctx.fillText('Press Space to Restart', 310, 280);
    }
  }

  // Game loop
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    update(dt);
    draw();
    last = ts;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Controls: start/reset
  function startGame() {
    state = 'playing';
    score = 0;
    player.x = 80; player.y = 350; player.vx = 0; player.vy = 0; player.onGround = false;
    spawnCoins();
  }
  function resetGame() {
    state = 'start';
    score = 0;
    spawnCoins();
    player.x = 80; player.y = 350; player.vx = 0; player.vy = 0;
  }
  // begin at start screen
  resetGame();
})();
