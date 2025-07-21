const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width;
let height;
let laneWidth;
let totalLanes = 4;

// Responsive canvas
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  laneWidth = width / 2.5 / totalLanes;
  player.y = height - 120;
}

window.addEventListener('resize', resizeCanvas);

// Player config
let player = { lane: 1, x: 0, y: 0 };
let carWidth = 40;
let carHeight = 80;

let obstacles = [];
let score = 0;
let gameOver = false;

// Helpers
function laneToX(lane) {
  const roadStart = (width - (laneWidth * totalLanes)) / 2;
  return roadStart + lane * laneWidth + (laneWidth - carWidth) / 2;
}

function getLevel(score) {
  return Math.floor(score / 10);
}
function getObstacleSpeed(score) {
  return 2 + getLevel(score) * 0.5;
}

function createObstacle() {
  const lane = Math.floor(Math.random() * totalLanes);
  obstacles.push({ lane, x: laneToX(lane), y: -carHeight });
}

function drawRoad() {
  const roadStart = (width - (laneWidth * totalLanes)) / 2;
  ctx.fillStyle = '#444';
  ctx.fillRect(roadStart, 0, laneWidth * totalLanes, height);

  ctx.strokeStyle = "#fff";
  ctx.setLineDash([20, 20]);
  ctx.lineWidth = 2;
  for (let i = 1; i < totalLanes; i++) {
    const x = roadStart + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawCar(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, carWidth, carHeight);
  ctx.fillStyle = '#bbdefb';
  ctx.fillRect(x + 6, y + 10, carWidth - 12, 20);
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawRoad();

  player.x = laneToX(player.lane);
  drawCar(player.x, player.y, '#1976d2');

  for (let obs of obstacles) {
    drawCar(obs.x, obs.y, '#d32f2f');
  }

  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Level: " + getLevel(score), width - 110, 30);
}

function updateObstacles() {
  const speed = getObstacleSpeed(score);
  for (let obs of obstacles) {
    obs.y += speed;
  }

  if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 150) {
    createObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].y > height) {
      obstacles.splice(i, 1);
      score++;
    }
  }
}

function detectCollision() {
  for (let obs of obstacles) {
    if (
      obs.lane === player.lane &&
      player.y < obs.y + carHeight &&
      player.y + carHeight > obs.y
    ) {
      gameOver = true;
    }
  }
}

function resetGame() {
  player.lane = Math.floor(totalLanes / 2);
  obstacles = [];
  score = 0;
  gameOver = false;
  createObstacle();
  gameLoop();
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.fillText('Game Over!', width / 2 - 100, height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, width / 2 - 60, height / 2);
    ctx.font = '16px Arial';
    ctx.fillText('Tap to Restart', width / 2 - 60, height / 2 + 40);
    return;
  }

  updateObstacles();
  detectCollision();
  draw();
  requestAnimationFrame(gameLoop);
}

// 🔄 Mobile/Touch Controls
canvas.addEventListener('touchstart', function (e) {
  if (gameOver) {
    resetGame();
    return;
  }

  const touchX = e.touches[0].clientX;
  const center = width / 2;

  if (touchX < center && player.lane > 0) {
    player.lane--;
  } else if (touchX >= center && player.lane < totalLanes - 1) {
    player.lane++;
  }
});

canvas.addEventListener('click', function (e) {
  // Support desktop clicks too
  if (gameOver) {
    resetGame();
    return;
  }

  const clickX = e.clientX;
  if (clickX < width / 2 && player.lane > 0) {
    player.lane--;
  } else if (clickX >= width / 2 && player.lane < totalLanes - 1) {
    player.lane++;
  }
});

// Initialization
resizeCanvas();
player.lane = Math.floor(totalLanes / 2);
createObstacle();
gameLoop();
