const gameBoard = document.getElementById('gameboard');
const playerDisplay = document.getElementById('player');
const infoDisplay = document.getElementById('info-display');

const width = 8;
let playerGo = 'black';
playerDisplay.textContent = playerGo;
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

function createElementWithAttributes(tag, attributes, innerHTML) {
    const element = document.createElement(tag);
    for (const attribute in attributes) element.setAttribute(attribute, attributes[attribute]);
    if (innerHTML !== undefined) element.innerHTML = innerHTML;
    return element;
};

function createBoard() {
    startPieces.forEach((piece, i) => {
        const square = createElementWithAttributes('div', { class: 'square', 'square-id': i }, piece);
        const row = Math.floor((63 - i) / 8) + 1;

        if (row % 2 === 0) square.classList.add(i % 2 === 0 ? 'beige' : 'brown');
        else square.classList.add(i % 2 === 0 ? 'brown' : 'beige');

        if (i <= 15) square.firstChild.firstChild.classList.add('black');
        if (i >= 48) square.firstChild.firstChild.classList.add('white');
        
        square.firstChild?.setAttribute('draggable', true);
        square.addEventListener('dragstart', dragStart); 
        square.addEventListener('dragover', dragOver); 
        square.addEventListener('drop', dragDrop); 

        gameBoard.append(square);
    });
}

createBoard();

const allSquare = document.querySelectorAll('.square');

let startPositionId;
let draggedElement;

function dragStart(event) {
    startPositionId = event.target.parentNode.getAttribute('square-id');
    draggedElement = event.target;
}

function dragOver(event) {
    event.preventDefault();
}

function dragDrop(event) {
    event.stopPropagation();
    const correctGo = draggedElement.firstChild.classList.contains(playerGo);
    const opponentGo = playerGo === 'white' ? 'black' : 'white';
    const taken = event.target.classList.contains('piece');
    const takenByOpponent = event.target.firstChild?.classList.contains(opponentGo);
    const valid = checkIfValid(event.target);

    if (correctGo) {
        if (takenByOpponent && valid) {
            event.target.parentNode.append(draggedElement);
            event.target.remove();
            changePlayer();
            return;
        }
        if (taken && !takenByOpponent) {
            return;
        }
        if (valid) {
            event.target.append(draggedElement);
            changePlayer();
        }
    }
}

function changePlayer() {
    if (playerGo === 'black') { playerGo = 'white'; reverseIds(); }
    else { playerGo = 'black'; revertIds(); }
    playerDisplay.textContent = playerGo;
}

function reverseIds() {
    document.querySelectorAll('.square').forEach((square, i) => {
        square.setAttribute('square-id', (width * width - 1) - i);
    });
}

function revertIds() {
    document.querySelectorAll('.square').forEach((square, i) => {
        square.setAttribute('square-id', i);
    });
};

function checkIfValid(target) {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement;

    switch (piece) {
        case 'pawn':
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
            if (starterRow.includes(startId) && startId + width * 2 === targetId) return true;
    }
}