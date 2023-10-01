// ========== INPUT VERIFICATION ==========
const input = document.querySelectorAll('.input');

document.getElementById('player-play').addEventListener('click', () => {
    if (input[0].value.trim().length > 0 && input[1].value.trim().length > 0 && input[2].value >= 1 && input[2].value <= 15) {
        document.querySelector('.home').classList.remove('active');
        document.querySelector('.game').classList.add('active');
        initGame();
        document.querySelectorAll('.player-name').forEach((name, i) => {
            name.innerHTML = `${input[i].value.trim()} <span>+0</span>`;
        });
        document.querySelector('.round-number').innerHTML = input[2].value;
    } else {
        input.forEach((name) => {
            if (name.value.trim().length == 0 || name.value < 1 || name.value > 15) {
                name.value = '';
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
    const translateY = 1200 - parseInt(input[1] + input[2]) * 100;
    return `transform: translate(${translateX}%,${translateY}%)`;
}

// ========== CALC NEW POS ==========
function getPos(event, container, piece) {
    const x = Math.round(Math.min(449, Math.max(-29, event.clientX - container.left - piece.getBoundingClientRect().width / 2)) / 60) * 100;
    const y = Math.round(Math.min(689, Math.max(-29, event.clientY - container.top - piece.getBoundingClientRect().height / 2)) / 60) * 100;
    return { x, y };
}

function initGame() {
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

    document.addEventListener('mousemove', (event) => {
        if (selectedPiece) {
            const x = Math.min(449, Math.max(-29, event.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2));
            const y = Math.min(689, Math.max(-29, event.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2));
            selectedPiece.style.transform = `translate(${x}px, ${y}px)`;
            
            const pos = getPos(event, containerRect, selectedPiece);
            document.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
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

    //avatar input
    //move history on the right side
    pieces.forEach((piece) => {
        for (let i = 0; i < piece.position.length; i++){
            const figure = createElementWithAttributes('div', { class: 'piece', 'data-piece': piece.name, style: calcPos(piece.position[i]), draggable: true });
            document.querySelector('.game-board').append(figure);
        }
    });   
}

initGame(); // DELETE IF THE HOME PAGE IS UNDER TEST