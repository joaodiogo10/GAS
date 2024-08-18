const player1 =
{
    mark: "X",
    score: 0
}

const player2 =
{
    mark: "O",
    score: 0
}


const gameStartState = ["", "", "", "", "", "", "", "", ""]
let currentPlayer = player1
let gameOver = false
let gameState = structuredClone(gameStartState)

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.setAttribute('data-cell-index', i)
        cell.addEventListener('click', handleCellClick)
        board.appendChild(cell)
    }
}

function restartGame() {
    gameState = structuredClone(gameStartState)

    Array.from(board.children).forEach(e => {
        e.innerText = ""
    });
    currentPlayer = player1
    gameOver = false
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

async function blinkWinner(winningCondition) {

    for (let i = 0; i < 4; i++) {
        board.children[winningCondition[0]].style.color = "#000"
        board.children[winningCondition[1]].style.color = "#000"
        board.children[winningCondition[2]].style.color = "#000"

        await wait(300)

        board.children[winningCondition[0]].style.color = "#fff"
        board.children[winningCondition[1]].style.color = "#fff"
        board.children[winningCondition[2]].style.color = "#fff"
        await wait(300)
    }
}

async function checkResult() {
    currentPlayer = currentPlayer === player1 ? player2 : player1

    for (let i = 0; i < winningConditions.length; i++) {
        if (gameState[winningConditions[i][0]] == player1.mark &&
            gameState[winningConditions[i][1]] == player1.mark &&
            gameState[winningConditions[i][2]] == player1.mark
        ) {
            gameOver = true
            player1.score += 1
            scorePlayer1.innerText = player1.score

            await blinkWinner(winningConditions[i])
            restartGame()
            return true
        }

        if (gameState[winningConditions[i][0]] == player2.mark &&
            gameState[winningConditions[i][1]] == player2.mark &&
            gameState[winningConditions[i][2]] == player2.mark
        ) {
            gameOver = true
            player2.score += 1
            scorePlayer2.innerText = player2.score
            await blinkWinner(winningConditions[i])
            restartGame()
            return true
        }
    }

    return false
}

function handleCellClick(event) {
    if (gameOver)
        return
    const clickedCell = event.target
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'))

    if (gameState[clickedCellIndex] !== "") {
        return
    }

    gameState[clickedCellIndex] = currentPlayer.mark.toString()
    clickedCell.innerHTML = currentPlayer.mark.toString()
    checkResult()
}

createBoard()