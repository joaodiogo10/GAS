import { wait } from "../utils/utils.js";

const Players = Object.freeze({
    Black: 1,
    White: 2
});

const forceJump = false;

// Piece selection and movement logic
let selectedIdx = null;
let moveHighlights = [];
let piecesHighlights = [];


let previousMove = null;
let previousPlayer = null;
let currentPlayer = Players.Black;
let gameOver = false;

function createBoard() {
    const initialPositions = {
        white: [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23, 51],

        black: [53, 56],
        //black: [26, 28, 42, 44, 56],
        //black: [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62]
    };

    initialPositions.white.forEach((pos) => {
        const piece = document.createElement('div');
        const originalOpacity = piece.style.opacity;
        const originalBackgroundColor = piece.style.backgroundColor;

        piece.classList.add('piece', 'white');

        piece.addEventListener("mouseover", () => {
            if (!getPiecesThatCanMove().includes(pos))
                return;

            if (currentPlayer == Players.White) {
                piece.style.backgroundColor = "#e0ecef";
                piece.style.opacity = "0.7";
            }
        });
        piece.addEventListener("mouseout", () => {
            piece.style.backgroundColor = originalBackgroundColor;
            piece.style.opacity = originalOpacity;
        });
        board.children[pos].appendChild(piece);
    });

    initialPositions.black.forEach((pos) => {
        const piece = document.createElement('div');
        const originalOpacity = piece.style.opacity;
        const originalBackgroundColor = piece.style.backgroundColor;

        piece.classList.add('piece', 'black');

        piece.addEventListener("mouseover", () => {
            if (!getPiecesThatCanMove().includes(pos))
                return;

            if (currentPlayer == Players.Black) {
                piece.style.backgroundColor = "#e0ecef";
                piece.style.opacity = "0.7";
            }
        });
        piece.addEventListener("mouseout", () => {
            piece.style.backgroundColor = originalBackgroundColor;
            piece.style.opacity = originalOpacity;
        });
        board.children[pos].appendChild(piece);
    });

    let cells = Array.prototype.slice.call(board.children);
    cells.forEach((cell, index) => {
        cell.id = index;
    });

    document.querySelectorAll('.piece').forEach(piece => {
        piece.addEventListener('click', selectPiece);
    });
}

function getCell(cellIdx) {
    return document.getElementById(cellIdx);
}

function getPiece(cellIdx) {
    let cell = getCell(cellIdx);
    if (cell == null)
        return null;

    return cell.querySelector('.piece');;
}

function promotePiece(cellIdx) {
    let piece = getPiece(cellIdx);
    piece.innerHTML = 'K';
    piece.classList.add('king');
}

function isKingPromotion(cellIdx) {
    return (currentPlayer == Players.Black && cellIdx < 8) ||
        (currentPlayer == Players.White && cellIdx > 58);
}

function isGameOver() {
    return getPiecesThatCanMove().length == 0;
}

function isValidSquare(cellIdx) {
    let cell = document.getElementById(cellIdx)
    return (cell != null) &&
        (cell.children.length == 0) &&
        (cell.classList.contains("cell1") && cell.id % 2 != 0 ||
            cell.classList.contains("cell2") && cell.id % 2 == 0);
}

function isPieceWhite(cellIdx) {
    if (cellIdx < 0 || cellIdx > 63) return false;
    const piece = getPiece(cellIdx);
    return piece != null && piece.classList.contains("white");
}

function isPieceBlack(cellIdx) {
    if (cellIdx < 0 || cellIdx > 63) return false;
    const piece = getPiece(cellIdx);
    return piece != null && piece.classList.contains("black");
}

function isPieceKing(cellIdx) {
    if (cellIdx < 0 || cellIdx > 63) return false;
    const piece = getPiece(cellIdx);
    return piece != null && piece.classList.contains("king");

}
function isPiece(cellIdx) {
    return isPieceBlack(cellIdx) || isPieceWhite(cellIdx);
}

function removePiece(cellIdx) {
    const cell = getCell(cellIdx);
    if (cell == null || cell.children[0] == null)
        return;

    cell.children[0].remove();
}

function movePiece(curPos, newPos) {
    const newCell = getCell(newPos);
    const piece = getPiece(curPos);
    newCell.appendChild(piece);
}

async function makeAPlay(move) {
    let allMoves = []
    let tmp = move
    while (tmp != null) {
        allMoves.push(tmp);
        tmp = tmp.previousMove;
    }

    //move pieces
    let curMove = allMoves.pop();
    removePiece(curMove.deletedPiece);
    movePiece(curMove.curPos, curMove.newPos);
    await wait(100)


    if (isKingPromotion(curMove.newPos))
        promotePiece(curMove.newPos);

    previousMove = move;
    previousPlayer = currentPlayer;
    if (allMoves.length == 0)
        currentPlayer = currentPlayer == Players.White ? Players.Black : Players.White;
    gameOver = isGameOver();
}

function selectPiece(event) {
    const cellIdx = parseInt(event.target.parentElement.id)
    if (((currentPlayer == Players.Black) && !isPieceBlack(cellIdx))) return;
    if (((currentPlayer == Players.White) && !isPieceWhite(cellIdx))) return;
    if (!getPiecesThatCanMove().includes(cellIdx)) return;

    moveHighlights.forEach(v => v.remove());
    moveHighlights = [];

    //deselect
    if (selectedIdx == event.target) {
        selectedIdx = null;
    }
    else {
        let moves = getPossibleMoves(cellIdx);
        selectedIdx = cellIdx;
        console.log(moves)

        moves.forEach((move) => {
            let firstMove = move;
            while (firstMove.previousMove != null)
                firstMove = firstMove.previousMove

            //highlight possible moves
            let cell = getCell(firstMove.newPos);
            let highlight = document.createElement('div')
            highlight.classList.add("highlight");
            moveHighlights.push(highlight);
            cell.appendChild(highlight);

            highlight.addEventListener('click', async (_) => {
                //clear moveHighlights
                moveHighlights.forEach(v => v.remove());
                moveHighlights = [];
                await makeAPlay(move);

                if (gameOver)
                    console.log(previousPlayer);

                highlightPiecesThatCanMove();
            });
        })
    };
}


function _getPossibleMoves(cellIdx, comingFromLeft, previousMove, startIdx) {
    let moves = [];
    let directions = [];
    let move = null;

    if (currentPlayer == Players.Black) {
        if (isPieceWhite(cellIdx)) {
            move = {}
            move.deletedPiece = cellIdx;
            move.curPos = comingFromLeft ? cellIdx + 7 : cellIdx + 9;
            move.newPos = comingFromLeft ? cellIdx - 7 : cellIdx - 9;
            move.previousMove = previousMove;

            directions = getPossibleDirection(move.newPos, startIdx);
        }
    }
    else {
        if (isPieceBlack(cellIdx)) {
            move = {}
            move.deletedPiece = cellIdx;
            move.curPos = comingFromLeft ? cellIdx - 9 : cellIdx - 7;
            move.newPos = comingFromLeft ? cellIdx + 9 : cellIdx + 7;
            move.previousMove = previousMove

            directions = getPossibleDirection(move.newPos, startIdx);
        }
    }

    if (move != null && !isPiece(move.newPos)) {
        directions.forEach(d => {
            moves.push(..._getPossibleMoves(d.newPos, d.comingFromLeft, move, startIdx));
        })

        let moveNotPresent = true;
        moves.forEach(m => {
            if (m.previousMove == move)
                moveNotPresent = false;
        })
        if (moveNotPresent)
            moves.push(move);
    }

    //if (currentPlayer == Players.Black) {
    //if (isPieceWhite(cellIdx)) {
    //move.deletedPiece = cellIdx;
    //move.curPos = comingFromLeft ? cellIdx + 7 : cellIdx + 9;
    //cellIdx += comingFromLeft ? -7 : -9;
    //move.newPos = cellIdx;
    //move.previousMove = previousMove
    //if (!isPiece(cellIdx)) {
    //moves.push(..._getPossibleMoves(cellIdx - 9, false, move));
    //moves.push(..._getPossibleMoves(cellIdx - 7, true, move));

    //let moveNotPresent = true;
    //moves.forEach(m => {
    //if (m.previousMove == move)
    //moveNotPresent = false;
    //})
    //if (moveNotPresent)
    //moves.push(move);
    //}
    //}
    //}
    //else {
    //if (isPieceBlack(cellIdx)) {
    //move.deletedPiece = cellIdx;
    //move.curPos = comingFromLeft ? cellIdx - 9 : cellIdx - 7;
    //cellIdx += comingFromLeft ? 9 : 7;
    //move.newPos = cellIdx;
    //move.previousMove = previousMove
    //if (!isPiece(cellIdx)) {
    //moves.push(..._getPossibleMoves(cellIdx + 9, true, move));
    //moves.push(..._getPossibleMoves(cellIdx + 7, false, move));

    //let moveNotPresent = true;
    //moves.forEach(m => {
    //if (m.previousMove == move)
    //moveNotPresent = false;
    //})
    //if (moveNotPresent)
    //moves.push(move);
    //}
    //}
    //}
    return moves;
}

function getPossibleDirection(cellIdx, pieceIdx = null) {
    let directions = [];

    let backward = [
        {
            newPos: cellIdx - 9,
            commingFromLeft: false
        }, {
            newPos: cellIdx - 7,
            commingFromLeft: true
        }
    ];

    let forward = [{
        newPos: cellIdx + 9,
        commingFromLeft: true
    }, {
        newPos: cellIdx + 7,
        commingFromLeft: false
    }];

    pieceIdx = pieceIdx != null ? pieceIdx : cellIdx;

    if (isPieceKing(pieceIdx)) {
        directions.push(...backward);
        directions.push(...forward);
    }
    else if (isPieceBlack(pieceIdx)) {
        directions.push(...backward);
    }
    else {
        directions.push(...forward);
    }
    return directions;
}

function getPossibleMoves(cellIdx) {
    if (!isPiece(cellIdx)) return []
    let moves = [];
    let directions = getPossibleDirection(cellIdx);

    directions.forEach(d => {
        moves.push(..._getPossibleMoves(d.newPos, d.commingFromLeft, null, cellIdx));
    });

    if (moves.length == 0) {
        directions.forEach(d => {
            moves.push({ deletedPiece: null, curPos: cellIdx, newPos: d.newPos, previousMove: null });
        });
    }

    //remove ilegal moves
    moves = moves.filter((move) => {
        return isValidSquare(move.newPos)
    })

    return moves;
}

function getPiecesThatCanMove() {
    let piecesIdx = []

    //continue previous move
    if (previousPlayer == currentPlayer) {
        if (getPossibleMoves(previousMove.curPos) != 0) {
            piecesIdx.push(previousMove.curPos);
        }
    }
    else {
        //new move sequence
        let jumpMoves = []
        for (let i = 0; i < 64; i++) {
            if ((currentPlayer == Players.Black && isPieceBlack(i)) ||
                (currentPlayer == Players.White && isPieceWhite(i))) {
                let moves = getPossibleMoves(i);
                if (moves.length != 0) {
                    moves.forEach((m) => { if (m.deletedPiece != null) jumpMoves.push(i); });
                    piecesIdx.push(i);
                }
            }
        }
        if (jumpMoves.length != 0)
            piecesIdx = piecesIdx.filter((p) => jumpMoves.includes(p));
    }
    return piecesIdx;
}

function highlightPiecesThatCanMove() {
    piecesHighlights.forEach(p => {
        getCell(p).style.backgroundColor = "#000"
    });
    piecesHighlights = []
    getPiecesThatCanMove().forEach(p => {
        getCell(p).style.backgroundColor = "#700"
        piecesHighlights.push(p);
    });
}

createBoard();
highlightPiecesThatCanMove();