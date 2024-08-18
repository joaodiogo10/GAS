const pongCtx = pongCanvas.getContext('2d')


const player1 = {
    score: 0
}

const player2 = {
    score: 0
}

const ballStartPosition = {
    x: pongCanvas.width / 2,
    y: pongCanvas.height / 2,
    radius: 10,
    dx: 5,
    dy: 5
}

var ball = structuredClone(ballStartPosition)

const paddleHeight = 100
const paddleWidth = 10

const leftPaddle = {
    x: 0,
    y: (pongCanvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight
}

const rightPaddle = {
    x: pongCanvas.width - 10,
    y: (pongCanvas.height - paddleHeight) / 2,
    width: paddleWidth,
    height: paddleHeight
}

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
}


document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true
    }
})

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false
    }
})

function restartGame() {
    ball = structuredClone(ballStartPosition)
}

function drawBall() {
    pongCtx.beginPath()
    pongCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    pongCtx.fillStyle = "#fff"
    pongCtx.fill()
    pongCtx.closePath()
}

function drawPaddle(paddle) {
    pongCtx.fillStyle = "#fff"
    pongCtx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

function movePaddles() {
    if (keys.ArrowUp) {
        rightPaddle.y -= 5
    }
    if (keys.ArrowDown) {
        rightPaddle.y += 5
    }
    if (keys.w) {
        leftPaddle.y -= 5
    }
    if (keys.s) {
        leftPaddle.y += 5
    }

    // Prevent paddles from going out of bounds
    rightPaddle.y = Math.max(0, Math.min(pongCanvas.height - rightPaddle.height, rightPaddle.y))
    leftPaddle.y = Math.max(0, Math.min(pongCanvas.height - leftPaddle.height, leftPaddle.y))
}


function getRandom(min, max) {
    return Math.random() * (max - min) + min
}

function run() {
    pongCtx.clearRect(0, 0, pongCanvas.width, pongCanvas.height)
    movePaddles()
    drawBall()
    drawPaddle(leftPaddle)
    drawPaddle(rightPaddle)

    ball.x += ball.dx
    ball.y += ball.dy

    //collision with right paddle
    if ((ball.x + ball.radius > pongCanvas.width - rightPaddle.width) &&
        ((ball.y > (rightPaddle.y) &&
            (ball.y < rightPaddle.y + rightPaddle.height)))) {
        ball.dy = getRandom(-6, 6)
        ball.dx = -getRandom(7, 12)
    }
    //collision with left paddle
    else if ((ball.x - ball.radius < 0 + leftPaddle.width) &&
        ((ball.y > (leftPaddle.y) &&
            (ball.y < (leftPaddle.y + leftPaddle.height))))) {
        ball.dy = getRandom(-6, 6)
        ball.dx = getRandom(7, 12)
    }
    //collision with left wall
    else if (ball.x - ball.radius < 0) {
        ball.dx *= -1
        player1.score += 1
        scorePlayer1.innerText = player1.score
        restartGame()
    }
    //collision with right wall 
    else if (ball.x + ball.radius > pongCanvas.width) {
        ball.dx *= -1
        player2.score += 1
        scorePlayer2.innerText = player2.score
        restartGame()
    }
    //collision with up/bottom wall
    else if (ball.y + ball.radius > pongCanvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1
    }

    requestAnimationFrame(run)
}

run()