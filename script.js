const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let lanes = [100, 200, 300];
let currentLane = 1;

let player = {
    x: lanes[currentLane],
    y: 500,
    width: 40,
    height: 60,
    dy: 0,
    gravity: 0.8,
    jumpForce: -15,
    sliding: false
};

let obstacles = [];
let coins = [];
let speed = 5;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

let gameOver = false;

function spawnObstacle() {
    let lane = Math.floor(Math.random() * 3);
    obstacles.push({
        x: lanes[lane],
        y: -60,
        width: 40,
        height: 60
    });
}

function spawnCoin() {
    let lane = Math.floor(Math.random() * 3);
    coins.push({
        x: lanes[lane],
        y: -20,
        radius: 10
    });
}

function drawPlayer() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x - 20, player.y, player.width, player.height);
}

function drawObstacles() {
    ctx.fillStyle = "red";
    obstacles.forEach(o => {
        ctx.fillRect(o.x - 20, o.y, o.width, o.height);
        o.y += speed;
    });
}

function drawCoins() {
    ctx.fillStyle = "yellow";
    coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        c.y += speed;
    });
}

function updatePlayer() {
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y > 500) {
        player.y = 500;
        player.dy = 0;
    }
}

function detectCollision() {
    obstacles.forEach(o => {
        if (
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) {
            endGame();
        }
    });

    coins.forEach((c, index) => {
        let dx = player.x - c.x;
        let dy = player.y - c.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) {
            coins.splice(index, 1);
            score += 10;
        }
    });
}

function endGame() {
    gameOver = true;
    document.getElementById("gameOverScreen").classList.remove("hidden");
    if (score > highScore) {
        localStorage.setItem("highScore", score);
    }
}

function restartGame() {
    obstacles = [];
    coins = [];
    score = 0;
    speed = 5;
    gameOver = false;
    document.getElementById("gameOverScreen").classList.add("hidden");
    loop();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawObstacles();
    drawCoins();
    updatePlayer();
    detectCollision();

    score++;
    document.getElementById("score").innerText = score;

    if (score % 200 === 0) speed += 0.5;

    obstacles = obstacles.filter(o => o.y < canvas.height);
    coins = coins.filter(c => c.y < canvas.height);
}

function loop() {
    if (!gameOver) {
        update();
        requestAnimationFrame(loop);
    }
}

setInterval(spawnObstacle, 1500);
setInterval(spawnCoin, 2000);

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
        player.x = lanes[currentLane];
    }
    if (e.key === "ArrowRight" && currentLane < 2) {
        currentLane++;
        player.x = lanes[currentLane];
    }
    if (e.key === "ArrowUp" && player.y === 500) {
        player.dy = player.jumpForce;
    }
});

loop();
