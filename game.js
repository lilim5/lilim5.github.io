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

  // Storage keys
  const HS_KEY = 'simple_game_highscore';
  const SOUND_KEY = 'simple_game_sound';
  const DIFF_KEY = 'simple_game_difficulty';

  // Highscore
  let bestScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;

  // Sound setup (lazy AudioContext)
  let audioCtx = null;
  let soundOn = localStorage.getItem(SOUND_KEY) !== 'false';
  function ensureAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  function playTone(freq, duration = 0.12, type = 'sine') {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.stop(now + duration + 0.02);
  }
  function playCoin() { playTone(880, 0.12, 'square'); }
  function playJump() { playTone(440, 0.14, 'sine'); }
  function playGameover() {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    playTone(600, 0.08, 'sawtooth');
    setTimeout(() => playTone(480, 0.12, 'sawtooth'), 90);
    setTimeout(() => playTone(360, 0.16, 'sawtooth'), 220);
  }

  // Game state
  let last = performance.now();
  let state = 'start'; // 'start', 'playing', 'gameover'
  let score = 0;
  let newHigh = false;

  // Player defaults (normal)
  const DIFFICULTIES = {
    easy: { speed: 200, jumpForce: -420, gravity: 1200 },
    normal: { speed: 240, jumpForce: -480, gravity: 1400 },
    hard: { speed: 320, jumpForce: -540, gravity: 1700 }
  };
  let difficulty = 'normal';

  const player = {
    x: 80, y: 350, w: 36, h: 48,
    vx: 0, vy: 0, speed: DIFFICULTIES.normal.speed, jumpForce: DIFFICULTIES.normal.jumpForce, onGround: false
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
    // shortcuts: 1 easy, 2 normal, 3 hard, M mute
    if (e.key === '1') setDifficulty('easy');
    if (e.key === '2') setDifficulty('normal');
    if (e.key === '3') setDifficulty('hard');
    if (e.key.toLowerCase() === 'm') toggleSound();
    // resume audio on first user key
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
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
    const start = e => { e.preventDefault(); // unlock audio on first interaction
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      active = true; onStart(); };
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

  // Difficulty buttons and mute
  const easyBtn = document.getElementById('easyBtn');
  const normalBtn = document.getElementById('normalBtn');
  const hardBtn = document.getElementById('hardBtn');
  const muteBtn = document.getElementById('muteBtn');

  function updateDifficultyUI() {
    easyBtn && easyBtn.classList.toggle('active', difficulty === 'easy');
    normalBtn && normalBtn.classList.toggle('active', difficulty === 'normal');
    hardBtn && hardBtn.classList.toggle('active', difficulty === 'hard');
  }

  function setDifficulty(name) {
    if (!DIFFICULTIES[name]) return;
    difficulty = name;
    player.speed = DIFFICULTIES[name].speed;
    player.jumpForce = DIFFICULTIES[name].jumpForce;
    window.GRAVITY = DIFFICULTIES[name].gravity;
    try { localStorage.setItem(DIFF_KEY, name); } catch (e) {}
    updateDifficultyUI();
  }

  easyBtn && easyBtn.addEventListener('click', () => setDifficulty('easy'));
  normalBtn && normalBtn.addEventListener('click', () => setDifficulty('normal'));
  hardBtn && hardBtn.addEventListener('click', () => setDifficulty('hard'));

  function updateMuteUI() {
    muteBtn && (muteBtn.textContent = soundOn ? '🔊' : '🔈');
    muteBtn && muteBtn.classList.toggle('active', soundOn);
  }
  function toggleSound() {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? 'true' : 'false'); } catch (e) {}
    updateMuteUI();
  }
  muteBtn && muteBtn.addEventListener('click', () => { ensureAudio(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); toggleSound(); });
  updateMuteUI();

  // Load saved difficulty (if any)
  const savedDiff = localStorage.getItem(DIFF_KEY) || 'normal';
  if (DIFFICULTIES[savedDiff]) setDifficulty(savedDiff);

  // Physics & update
  const GRAVITY = DIFFICULTIES.normal.gravity;
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
      playJump();
    }

    // integrate
    player.vy += (window.GRAVITY || GRAVITY) * dt;
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
        playCoin();
      }
    });

    // win condition: all collected
    if (coins.every(c => c.collected)) {
      state = 'gameover';
      if (score > bestScore) {
        bestScore = score;
        try { localStorage.setItem(HS_KEY, String(bestScore)); } catch (e) {}
        newHigh = true;
      } else newHigh = false;
      playGameover();
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
    ctx.fillText('Best: ' + bestScore, 12, 52);
    ctx.fillText('Mode: ' + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)), 12, 76);

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
      if (newHigh) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '20px system-ui, Arial';
        ctx.fillText('New High Score!', 330, 260);
      }
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
    newHigh = false;
  }
  function resetGame() {
    state = 'start';
    score = 0;
    spawnCoins();
    player.x = 80; player.y = 350; player.vx = 0; player.vy = 0;
    newHigh = false;
  }
  // begin at start screen
  resetGame();

  // ensure audio resume on pointerdown for browsers
  window.addEventListener('pointerdown', () => { ensureAudio(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); });

})();
