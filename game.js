const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game config
const totalLanes = 4;
const roadStartX = 75;
const roadWidth = 250;
const laneWidth = roadWidth / totalLanes;
const carWidth = 40;
const carHeight = 90;

let player = {
  lane: Math.floor(totalLanes / 2),
  x: 0,
  y: 500
};

let obstacles = [];
let score = 0;
let gameOver = false;

// Speed systems
function getLevel(score) {
  return Math.floor(score / 10);
}
function getObstacleSpeed(score) {
  return 2 + getLevel(score) * 0.6;
}

function laneToX(laneIndex) {
  return roadStartX + laneIndex * laneWidth + (laneWidth - carWidth) / 2;
}

function createObstacle() {
  const lane = Math.floor(Math.random() * totalLanes);
  const x = laneToX(lane);
  obstacles.push({ lane, x, y: -carHeight });
}

function drawRoad() {
  ctx.fillStyle = '#444';
  ctx.fillRect(roadStartX, 0, roadWidth, canvas.height);

  // Lane lines
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 20]);
  ctx.lineWidth = 2;
  for (let i = 1; i < totalLanes; i++) {
    let x = roadStartX + i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawCar(x, y, color = '#1976d2') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, carWidth, carHeight);

  // Windows
  ctx.fillStyle = '#bbdefb';
  ctx.fillRect(x + 10, y + 10, carWidth - 20, 20);

  // Wheels
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 5, y + 10, 8, 25);
  ctx.fillRect(x + carWidth - 13, y + 10, 8, 25);
  ctx.fillRect(x + 5, y + carHeight - 35, 8, 25);
  ctx.fillRect(x + carWidth - 13, y + carHeight - 35, 8, 25);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  // Draw player
  player.x = laneToX(player.lane);
  drawCar(player.x, player.y, '#1976d2');

  // Draw enemies
  for (let obs of obstacles) {
    drawCar(obs.x, obs.y, '#d32f2f');
  }

  // Score + Level
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Level: " + getLevel(score), 310, 25);
}

function updateObstacles() {
  let speed = getObstacleSpeed(score);
  for (let obs of obstacles) {
    obs.y += speed;
  }

  if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 150) {
    createObstacle();
  }

  // Remove off-screen enemies
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].y > canvas.height) {
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
  player.y = 500;
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
    ctx.fillText('Game Over!', 100, 280);
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 140, 320);
    ctx.font = '20px Arial';
    ctx.fillText('Press any key to restart', 90, 360);
    return;
  }
  updateObstacles();
  detectCollision();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  if (gameOver) {
    resetGame();
    return;
  }

  if (e.key === 'ArrowLeft' && player.lane > 0) {
    player.lane--;
  } else if (e.key === 'ArrowRight' && player.lane < totalLanes - 1) {
    player.lane++;
  }
});

// Start the game
createObstacle();
gameLoop();
