// ========== INPUT VERIFICATION ==========
const inputNames = document.querySelectorAll('.player-input-name');

document.getElementById('player-play').addEventListener('click', () => {
    if (inputNames[0].value.trim().length > 0 && inputNames[1].value.trim().length > 0) {
        console.log('Init game!');
        document.querySelector('.home').classList.remove('active');
        document.querySelector('.board').classList.add('active');
        document.querySelectorAll('.player-name').forEach((name, i) => {
            name.innerHTML = `${inputNames[i].value.trim()} <span>+0</span>`;
        });
    } else {
        inputNames.forEach((name) => {
            if (name.value.trim().length == 0) {
                name.classList.add('player-input-err');
                setTimeout(() => {
                    name.classList.remove('player-input-err');
                }, 700);
            }
        });
    }
});

document.getElementById('player-continue').addEventListener('click', () => {
    if (inputNames[0].value.trim().length > 0 && inputNames[1].value.trim().length > 0) {
        console.log('Load game!');
    } else {
        inputNames.forEach((name) => {
            if (name.value.trim().length == 0) {
                name.classList.add('player-input-err');
                setTimeout(() => {
                    name.classList.remove('player-input-err');
                }, 700);
            }
        });
    }
});

// ========== ELEMENT CREATOR FUNCTION ==========
function createElementWithAttributes(tag, attributes, innerHTML) {
    const element = document.createElement(tag);
    for (const attribute in attributes) element.setAttribute(attribute, attributes[attribute]);
    if (innerHTML !== undefined) element.innerHTML = innerHTML;
    return element;
};

// ========== INIT ELEMENT POS ==========
function calcPos(input) {
    const translateX = 800 - parseInt(input[0]) * 100;
    const translateY = 800 - parseInt(input[1]) * 100;
    return `transform: translate(${translateX}%,${translateY}%)`;
}

// ========== CALC NEW POS ==========
function getPos(event, container, piece) {
    const x = Math.round((event.clientX - container.left - piece.getBoundingClientRect().width / 2) / 90) * 100;
    const y = Math.round((event.clientY - container.top - piece.getBoundingClientRect().height / 2) / 90) * 100;
    return { x, y };
}

const gameBoard = document.querySelector('.game-board');
const containerRect = gameBoard.getBoundingClientRect();

let selectedPiece = null;
let playerGo = 'w';

gameBoard.addEventListener('mousedown', (event) => {
    event.preventDefault();
    const clickedElement = event.target;
    if (clickedElement.classList.contains('piece') && clickedElement.getAttribute('data-piece').charAt(0) === playerGo) {
        selectedPiece = clickedElement;

        const pos = getPos(event, containerRect, selectedPiece);
        document.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
        document.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        
        selectedPiece.style.zIndex = 100;
        selectedPiece.style.cursor = 'grabbing';

        //calculate all valid steps
        //create hints and set its pos to valid steps pos (<div class="hint" style="transform: translate(300%, 500%);"></div>)
    } else {
        document.querySelector('.highlight').style.cssText = `opacity: 0;`;
        document.querySelector('.hover').style.cssText = `opacity: 0;`;
        selectedPiece = null;
    }
});

gameBoard.addEventListener('mousemove', (event) => {
    if (selectedPiece) {
        const pos = getPos(event, containerRect, selectedPiece);
        document.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        
        selectedPiece.style.transform = `translate(
            ${event.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2}px,
            ${event.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2}px)`;
    }
});

gameBoard.addEventListener('mouseup', (event) => {
    if (selectedPiece) {
        //check if curr pos is among valid steps -> capture sound v illegal sound
        //if valid and capture -> remove enemy's figure + append to captured container + add points querySelector('.player-name span')
        capture.play();

        const pos = getPos(event, containerRect, selectedPiece);
        selectedPiece.style.transform = `translate(${pos.x}%, ${pos.y}%)`;
        document.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
        document.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        
        selectedPiece.style.zIndex = '';
        selectedPiece.style.cursor = 'grab';
        selectedPiece = null;
        playerGo = (playerGo === 'w') ? 'b' : 'w';
    }
});

//add to init game func, which is called if the input is correct
//avatar input + number of rounds input
//move history on the right side
//using css for transformation is better approach against cheating (can be fixed if the game is server side)
pieces.forEach((piece) => {
    for (let i = 0; i < piece.position.length; i++){
        //somehow pawn figures direction should be handled
        const figure = createElementWithAttributes('div', { class: 'piece', 'data-piece': piece.name, style: calcPos(piece.position[i]), draggable: true });
        document.querySelector('.game-board').append(figure);
    }
});