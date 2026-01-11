# lilim5.github.io

A small browser game / interactive avatar project: a 2D runner-style scene where you can equip outfits on a base character, collect coins, avoid obstacles, and trigger particle effects (dance, fly, etc.). This repository contains the static website (HTML/CSS/JS) and assets for the game.

---

## Features

- Equipable outfit layers (hair, top, bottom, shoes)
- Player movement: left / right, jump
- Collectible coins and obstacles
- Simple particle effects (sparkles, dance, fly)
- Background gradient and runway stripes
- Sound effects and background music

---

## Demo / Screenshot

Place a screenshot or GIF in the repository `assets/` and reference it here. Example:

![Game banner](assets/screenshots/banner.png)

(Replace the image above with your actual file path.)

---

## Getting started

Prerequisites:
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Optional: a small static server for local testing (recommended to avoid CORS with audio/image loading)

Quick start:

1. Clone the repo:
   ```
   git clone https://github.com/lilim5/lilim5.github.io.git
   cd lilim5.github.io
   ```

2. Open `index.html` in your browser, or run a simple server:
   - Python 3:
     ```
     python -m http.server 8000
     ```
     then open http://localhost:8000

   - VS Code: use the Live Server extension.

---

## Controls

- ArrowLeft / ArrowRight — move left / right
- ArrowUp — jump
- UI buttons: Play, Closet (open outfit UI), etc.

(Exact UI interactions depend on the HTML buttons in `index.html`.)

---

## Project structure (suggested)

- index.html
- css/
  - styles.css
- js/
  - main.js
- assets/
  - characters/
    - base.png
  - clothes/
    - hair/
    - top/
    - bottom/
    - shoes/
  - music/
  - sounds/
  - screenshots/

---

## Important snippets

Below are corrected and safe examples of the JavaScript functions used by the game. They are provided here as reference — the actual game code should live in `js/main.js`.

```javascript
// ===== Canvas Setup =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ===== Player =====
let player = {
  x: 375,
  y: 500,
  width: 50,
  height: 100,
  velocityY: 0,
  isJumping: false,
  isFlying: false,
  outfit: { hair: null, top: null, bottom: null, shoes: null }
};

// ===== Score =====
let coinsCollected = 0;
const coinDisplay = document.getElementById('coin-count');

// ===== Base Character =====
const baseImage = new Image();
baseImage.src = 'assets/characters/base.png';

// ===== Outfit Equip Functions =====
function loadOutfitLayer(type, name) {
  const img = new Image();
  img.src = `assets/clothes/${type}/${name}.png`;
  player.outfit[type] = img;
}
function equipHair(name) { loadOutfitLayer('hair', name); }
function equipTop(name)  { loadOutfitLayer('top', name); }
function equipBottom(name){ loadOutfitLayer('bottom', name); }
function equipShoes(name){ loadOutfitLayer('shoes', name); }

// ===== Draw Outfit Layer =====
function drawOutfitLayer(type) {
  const img = player.outfit[type];
  if (img && img.complete) {
    ctx.drawImage(img, player.x, player.y, player.width, player.height);
  }
}

// ===== Sounds =====
const bgMusic = new Audio('assets/music/background.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
const jumpSound = new Audio('assets/music/jump.mp3');
const coinSound = new Audio('assets/music/coin.mp3');

// ===== Controls =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && !player.isJumping) {
    player.velocityY = -12;
    player.isJumping = true;
    jumpSound.play().catch(() => {});
  }
  if (e.key === 'ArrowLeft') {
    player.x = Math.max(0, player.x - 10);
  }
  if (e.key === 'ArrowRight') {
    player.x = Math.min(canvas.width - player.width, player.x + 10);
  }
});

// ===== Simple physics + game loop (sketch) =====
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background, obstacles, coins, particles etc. would be drawn here...

  // player gravity
  if (!player.isFlying) {
    player.velocityY += 0.5; // gravity
    player.y += player.velocityY;
  } else {
    player.y -= 3; // flying upward while flying
  }

  // ground collision
  if (player.y > 500) {
    player.y = 500;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // draw player and outfit layers
  ctx.drawImage(baseImage, player.x, player.y, player.width, player.height);
  drawOutfitLayer('bottom');
  drawOutfitLayer('top');
  drawOutfitLayer('hair');
  drawOutfitLayer('shoes');

  requestAnimationFrame(update);
}
```

---

## Tips & notes

- Keep outfit image sizes consistent with the base character (same dimensions) for proper alignment.
- Preload assets (images/audio) where possible to avoid visual popping or playback delays.
- If audio won't play automatically, many browsers require a user interaction (click) before audio can start.

---

## Contributing

Contributions are welcome. Please open issues for bugs and feature requests, and submit pull requests for fixes or improvements.

Ideas:
- Add more outfit items and categories
- Improve collision handling and obstacle variety
- Add mobile touch controls

---

## License

This project is provided as-is. Add a LICENSE file if you want to apply a specific license (MIT, Apache-2.0, etc.).
