var canvas, canvasContext;

// Bricks
const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var brickCount = 0;

// Ball
var ballX = 75;
var ballSpeedX = 1;
var ballY = 75;
var ballSpeedY = 8;

// Paddle
var paddleX = 400;
const PADDLE_THICKNESS = 15;
const PADDLE_WIDTH = 100;
const PADDLE_DIST_FROM_EDGE = 40;

// Mouse
var mouseX = 0;
var mouseY = 0;

/****************
 General GamePlay
 ****************/

window.onload = function () {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    var framesPerSecond = 60;
    setInterval(updateAll, 1000 / framesPerSecond);

    canvas.addEventListener('mousemove', updateMousePos);
    brickReset();
    ballReset();
}

function updateAll() {
    movement();
    playArea();
}

function ballReset() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function brickReset() {
    brickCount = 0;
    for (var i = 0; i < 3 * BRICK_COLS; i++) {
        brickGrid[i] = false;
    }
    for (; i < BRICK_COLS * BRICK_ROWS; i++) {
        if (Math.random() < 0.5) {
            brickGrid[i] = true;
            brickCount++;
        } else {
            brickGrid[i] = false;
        }
    }
}

function ballMove() {
    // Ball Movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball Y
    if (ballY > canvas.height) {
        ballReset();
        brickReset();
    } else if (ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }

    // Ball X
    if (ballX > canvas.width && ballSpeedX > 0.0) {
        ballSpeedX = -ballSpeedX;
    } else if (ballX < 0 && ballSpeedX < 0.0) {
        ballSpeedX = -ballSpeedX;
    }
}

function isBrickAtColRow(col, row) {
    if (col >= 0 && col < BRICK_COLS && row >= 0 && row < BRICK_ROWS) {
        var brickIndexUnderCoord = rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    } else {
        return false;
    }
}

function ballBrickColl() {
    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow = Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS && ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {

        if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
            brickGrid[brickIndexUnderBall] = false;
            brickCount--;

            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);

            var bothTestFailed = true;

            if (prevBrickCol != ballBrickCol) {
                if (isBrickAtColRow(prevBrickCol, ballBrickRow) == false) {
                    ballSpeedX = -ballSpeedX;
                    bothTestFailed = false;
                }
            }

            if (prevBrickRow != ballBrickRow) {
                if (isBrickAtColRow(ballBrickCol, prevBrickRow) == false) {
                    ballSpeedY = -ballSpeedY;
                    bothTestFailed = false;
                }
            }

            if (bothTestFailed) {
                ballSpeedX = -ballSpeedX;
                ballSpeedY = -ballSpeedY;
            }
        }
    }
}

function paddleMove() {
    // Paddle
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleX + PADDLE_WIDTH;

    if (ballY > paddleTopEdgeY && // Top of paddle
        ballY < paddleBottomEdgeY && // Bottom of paddle
        ballX > paddleLeftEdgeX && // Left half of paddle
        ballX < paddleRightEdgeX) { // Right half of paddle

        ballSpeedY = -ballSpeedY;

        var paddleCenterX = paddleX + PADDLE_WIDTH / 2;
        var ballDistFromCenterX = ballX - paddleCenterX;
        ballSpeedX = ballDistFromCenterX * 0.35;

        if (brickCount == 0) {
            brickReset();
        }
    }
}

function movement() {
    ballMove();
    ballBrickColl();
    paddleMove();
}

function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH / 2;
}

/*******
 GamePlay Draw functions
 ******/
function playArea() {
    // GameCanvas
    colorRect(0, 0, canvas.width, canvas.height, 'white');
    // Ball
    colorCircle(ballX, ballY, 10, 'black');
    // Paddle
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'black');

    drawBricks();
}

function colorRect(leftX, topY, width, height, color) {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(leftX, topY, width, height);
}

function colorText(showWords, textX, textY, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX, textY);
}

function rowColToArrayIndex(col, row) {
    return col + BRICK_COLS * row;
}

function drawBricks() {
    for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
        for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
            if (brickGrid[arrayIndex]) {
                colorRect(BRICK_W * eachCol, BRICK_H * eachRow,
                    BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'green');
            }
        }
    }
}

function colorCircle(centerX, centerY, radius, color) {
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}
: