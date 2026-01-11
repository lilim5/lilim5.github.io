# lilim5.github.io
// ===== Canvas Setup ===== const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');

// ===== Player ===== let player = { x: 375, y: 500, width: 50, height: 100, velocityY: 0, isJumping: false, isFlying: false, outfit: { hair:null, top:null, bottom:null, shoes:null } };

// ===== Score ===== let coinsCollected = 0; const coinDisplay = document.getElementById('coin-count');

// ===== Base Character ===== let baseImage = new Image(); baseImage.src = 'assets/characters/base.png';

// ===== Outfit Equip Functions ===== function equipHair(name){ loadOutfitLayer('hair', name); } function equipTop(name){ loadOutfitLayer('top', name); } function equipBottom(name){ loadOutfitLayer('bottom', name); } function equipShoes(name){ loadOutfitLayer('shoes', name); }

function loadOutfitLayer(type, name){ let img = new Image(); img.src = assets/clothes/${type}/${name}.png; player.outfit[type] = img; }

// ===== Start Menu Buttons ===== const startMenu = document.getElementById('start-menu'); const gameContainer = document.getElementById('game-container'); const closetUI = document.getElementById('closet-ui');

document.getElementById('play-button').addEventListener('click', ()=>{ startMenu.style.display='none'; gameContainer.style.display='block'; closetUI.style.display='none'; bgMusic.play().catch(()=>{}); // Safely handle mobile autoplay requestAnimationFrame(update); // Start game loop });

document.getElementById('closet-button').addEventListener('click', ()=>{ startMenu.style.display='none'; gameContainer.style.display='block'; closetUI.style.display='block'; });

// ===== Sounds ===== let bgMusic = new Audio('assets/music/background.mp3'); bgMusic.loop = true; bgMusic.volume = 0.5;

let jumpSound = new Audio('assets/music/jump.mp3'); let coinSound = new Audio('assets/music/coin.mp3'); let danceSound = new Audio('assets/music/dance.mp3');

document.addEventListener('keydown', (e)=>{ if(e.key==='ArrowUp' && !player.isJumping){ player.velocityY=-12; player.isJumping=true; jumpSound.play(); } if(e.key==='ArrowLeft') player.x -= 10; if(e.key==='ArrowRight') player.x += 10; if(e.key==='f') flyEffect(); if(e.key==='d'){ danceEffect(); danceSound.play(); } });

// ===== Particles ===== let particles = []; function spawnParticle(x,y,color){ particles.push({x,y,vx:(Math.random()-0.5)*2, vy:-Math.random()*2, size:2+Math.random()*3, color, life:30}); } function updateParticles(){ particles.forEach((p,i)=>{ p.x+=p.vx; p.y+=p.vy; p.life--; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size); if(p.life<=0) particles.splice(i,1); }); }

// ===== Effects ===== function flyEffect(){ player.isFlying=true; let interval = setInterval(()=>{ spawnParticle(player.x+25, player.y+50,'white'); player.y -= 3; // Fly upward while flying if(player.y < 50) player.y = 50; },50); setTimeout(()=>{ player.isFlying=false; clearInterval(interval); },3000); }

function danceEffect(){ for(let i=0;i<15;i++){ spawnParticle(player.x+Math.random()*50, player.y+Math.random()*50, hsl(${Math.random()*360},100%,50%)); } coinsCollected += 5; coinDisplay.innerText = coinsCollected; }

// ===== Draw Background ===== let bgY=0; function drawBackground(){ let gradient = ctx.createLinearGradient(0,0,0,canvas.height); gradient.addColorStop(0,'#ff9de0'); gradient.addColorStop(1,'#ff63c4'); ctx.fillStyle=gradient; ctx.fillRect(0,0,canvas.width,canvas.height);

// Runway stripes ctx.fillStyle='white'; for(let i=0;i<20;i++){ ctx.fillRect(i40,(bgY+i30)%canvas.height,20,10); } bgY += 2; }

// ===== Draw Outfit Layer ===== function drawOutfitLayer(type){ if(player.outfit[type]) ctx.drawImage(player.outfit[type], player.x, player.y, player.width, player.height); }

// ===== Game Loop ===== let obstacles = []; let coins = [];

function spawnObstacle(){ obstacles.push({x:Math.random()*750,y:-50,width:50,height:50,color:'red'}); } function spawnCoin(){ coins.push({x:Math.random()*750,y:-50,width:30,height:30,color:'gold'}); }

setInterval(spawnObstacle,2000); setInterval(spawnCoin,1500);

function update(){ ctx.clearRect(0,0,canvas.width,canvas.height);

drawBackground();

// Player physics if(!player.isFlying){ player.velocityY+=0.5; player.y+=player.velocityY; } if(player.y>500){ player.y=500; player.velocityY=0; player.isJumping=false; }

// Keep player within canvas horizontally if(player.x<0) player.x=0; if(player.x+player.width>canvas.width) player.x=canvas.width-player.width;

// Draw player & outfits ctx.drawImage(baseImage, player.x, player.y, player.width, player.height); drawOutfitLayer('bottom'); drawOutfitLayer('top'); drawOutfitLayer('hair'); drawOutfitLayer('shoes');

// Obstacles obstacles.forEach((obs,i)=>{ obs.y+=5; ctx.fillStyle=obs.color; ctx.fillRect(obs.x, obs.y, obs.width, obs.height); if(player.x<obs.x+obs.width && player.x+player.width>obs.x && player.y<obs.y+obs.height && player.y+player.height>obs.y){ alert("Game Over!"); obstacles=[]; coins=[]; player.y=500; coinsCollected=0; coinDisplay.innerText=coinsCollected; } if(obs.y>canvas.height) obstacles.splice(i,1); });

// Coins coins.forEach((coin,i)=>{ coin.y+=5; ctx.fillStyle=coin.color; ctx.fillRect(coin.x,coin.y,coin.width,coin.height); if(player.x<coin.x+coin.width && player.x+player.width>coin.x && player.y<coin.y+coin.height && player.y+player.height>coin.y){ coins.splice(i,1); coinsCollected++; coinDisplay.innerText=coinsCollected; spawnParticle(player.x+25,player.y+50,'white'); coinSound.play(); } if(coin.y>canvas.height) coins.splice(i,1); });

updateParticles();

requestAnimationFrame(update); }![Lucid_Origin_Heres_your_smaller_dark_glamorous_Laxco_banner_op_3](https://github.com/user-attachments/assets/e1f9e2ab-c58f-483e-9603-7a28269cf39f)document.getElementById('play-button').addEventListener('click', ()=>{
  ...
  update(); // Start game loop
});if(player.x<0) player.x=0;
if(player.x+player.width>canvas.width) player.x=canvas.width-player.width;document.addEventListener('keydown', e => {
  if(e.key==='ArrowLeft') player.x -= 10;
  if(e.key==='ArrowRight') player.x += 10;
});if(player.isFlying) player.y -= 3;
