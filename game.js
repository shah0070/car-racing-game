const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height, laneWidth;
const totalLanes = 4;
const carWidth = 40;
const carHeight = 80;
let laneOffset = 0;

const player = { lane: 1, x: 0, y: 0 };
let obstacles = [];
let score = 0;
let gameOver = false;

// Resize and center road
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  laneWidth = Math.min(width * 0.85, 280) / totalLanes;
  laneOffset = (width - laneWidth * totalLanes) / 2;
  player.y = height - 120;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();

// Level and speed
function getLevel(score) {
  return Math.floor(score / 10);
}
function getObstacleSpeed(score) {
  return 2 + getLevel(score) * 0.6;
}
function laneToX(lane) {
  return laneOffset + lane * laneWidth + (laneWidth - carWidth) / 2;
}

// Car drawing with improved visual style
function drawCar(x, y, color = '#1976d2') {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + carWidth - 8, y);
  ctx.quadraticCurveTo(x + carWidth, y, x + carWidth, y + 10);
  ctx.lineTo(x + carWidth, y + carHeight - 10);
  ctx.quadraticCurveTo(x + carWidth, y + carHeight, x + carWidth - 8, y + carHeight);
  ctx.lineTo(x + 8, y + carHeight);
  ctx.quadraticCurveTo(x, y + carHeight, x, y + carHeight - 10);
  ctx.lineTo(x, y + 10);
  ctx.quadraticCurveTo(x, y, x + 8, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Windows
  ctx.fillStyle = "#e0f7fa";
  ctx.fillRect(x + 10, y + 15, carWidth - 20, 18);

  // Racing stripe
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + carWidth / 2 - 2, y + 5, 4, carHeight - 10);

  // Front & back lights
  ctx.fillStyle = "#ffea00";
  ctx.fillRect(x + 10, y + 3, 8, 6);
  ctx.fillRect(x + carWidth - 18, y + 3, 8, 6);
  ctx.fillStyle = "#ff1744";
  ctx.fillRect(x + 10, y + carHeight - 9, 8, 5);
  ctx.fillRect(x + carWidth - 18, y + carHeight - 9, 8, 5);

  ctx.restore();
}

function drawRoad() {
  ctx.fillStyle = '#444';
  ctx.fillRect(laneOffset, 0, laneWidth * totalLanes, height);

  ctx.strokeStyle = "#fff";
  ctx.setLineDash([20, 15]);
  ctx.lineWidth = 2;

  for (let i = 1; i < totalLanes; i++) {
    const x = laneOffset + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawRoad();

  // Draw player
  player.x = laneToX(player.lane);
  drawCar(player.x, player.y, "#0077cc");

  // Draw enemies
  for (let obs of obstacles) {
    drawCar(obs.x, obs.y, "#c62828");
  }

  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Level: " + getLevel(score), width - 100, 30);
}

function createObstacle() {
  const lane = Math.floor(Math.random() * totalLanes);
  obstacles.push({
    lane: lane,
    x: laneToX(lane),
    y: -carHeight
  });
}

function updateObstacles() {
  let speed = getObstacleSpeed(score);
  for (let obs of obstacles) {
    obs.y += speed;
  }
  if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 160) {
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
    ctx.fillStyle = "#fff";
    ctx.font = "36px Arial";
    ctx.fillText("Game Over!", width / 2 - 110, height / 2 - 20);
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, width / 2 - 50, height / 2 + 20);
    ctx.font = "18px Arial";
    ctx.fillText("Tap or press anywhere to restart", width / 2 - 130, height / 2 + 50);
    return;
  }
  updateObstacles();
  detectCollision();
  draw();
  requestAnimationFrame(gameLoop);
}

// 📱 Touch & Desktop Input
canvas.addEventListener("click", handleControl);
canvas.addEventListener("touchstart", function(e) {
  if (e.touches.length > 0) handleControl(e.touches[0]);
});

// Main control function
function handleControl(e) {
  if (gameOver) {
    resetGame();
    return;
  }

  const cx = e.clientX;
  if (cx < width / 2 && player.lane > 0) {
    player.lane--;
  } else if (cx >= width / 2 && player.lane < totalLanes - 1) {
    player.lane++;
  }
}

// Start game
resetGame();
