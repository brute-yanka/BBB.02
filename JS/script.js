// ========== INPUT VERIFICATION ==========
const input = document.querySelectorAll('.input');

document.getElementById('player-play').addEventListener('click', () => {
    if (input[0].value.trim().length > 0 && input[1].value.trim().length > 0 && input[2].value >= 1 && input[2].value <= 15) {
        document.querySelector('.home').classList.remove('active');
        document.querySelector('.game').classList.add('active');
        document.querySelectorAll('.player-name').forEach((name, i) => {
            name.innerHTML = `${input[i].value.trim()}<span>0</span>`;
        });
        document.querySelector('.round-number').innerHTML = input[2].value;
        initGame();
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

// ========== ELEMENT CREATOR ==========
function createElementWithAttributes(tag, attributes, innerHTML) {
    const element = document.createElement(tag);
    for (const attribute in attributes) element.setAttribute(attribute, attributes[attribute]);
    if (innerHTML !== undefined) element.innerHTML = innerHTML;
    return element;
};

// ========== ATTRIBUTE GETTER ==========
function getAttributeValue(element, attributeName) {
    if (element.hasAttribute(attributeName)) return element.getAttribute(attributeName);
    else return null;
}

function getAllAttributes(element) {
    const attributesObject = {};
    element.getAttributeNames().forEach(attributeName => {
        const attributeValue = element.getAttribute(attributeName);
        attributesObject[attributeName] = attributeValue;
    });
    return attributesObject;
}

// ========== INIT ELEMENT POS ==========
function calcPos(input) {
    const translateX = 800 - parseInt(input[0]) * 100;
    const translateY = 1200 - parseInt(input[1] + input[2]) * 100;
    return `transform: translate(${translateX}%, ${translateY}%)`;
}

// ========== CALC NEW POS ==========
function getPos(event, container, piece) {
    const x = Math.round(Math.min(449, Math.max(-29, event.clientX - container.left - piece.getBoundingClientRect().width / 2)) / 60) * 100;
    const y = Math.round(Math.min(689, Math.max(-29, event.clientY - container.top - piece.getBoundingClientRect().height / 2)) / 60) * 100;
    return { x, y };
}

function initGame() {
    const gameBoard = document.querySelector('.game-board');
    let containerRect = gameBoard.getBoundingClientRect();
    window.addEventListener("resize",() => containerRect = gameBoard.getBoundingClientRect());

    let selectedPiece = null;
    let hintActive = null;
    let selectedPiecePos;
    let playerGo = 'w';
    const boardWidth = 700;
    const boardHeight = 1100;
    
    const playersPoint = document.querySelectorAll('.player-name span');
    const playerCaptured = document.querySelectorAll('.player-captured');

    function movePieceToPos(event){
        const pos = getPos(event, containerRect, event.target);
        const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
        
        if (valid.getAttribute('data-hint') !== null) {
            capture.play();

            const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
            const foundPiece = pieces.find(piece => piece.name === capturedPiece.getAttribute('data-piece'));

            if (playerGo === 'w') {
                playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                playerCaptured[0].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
            } 
            else {
                playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                playerCaptured[1].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
            }
                    
            capturedPiece.remove();
        } else click.play();

        hintActive.style.transform = `translate(${pos.x}%,${pos.y}%)`;
        gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
        gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;

        gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());

        playerGo = (playerGo === 'w') ? 'b' : 'w';
        hintActive = null;
    }
    
    function calcValidSteps(event) {
        const attributes = getAllAttributes(selectedPiece);
        const pos = getPos(event, containerRect, selectedPiece);

        if(attributes['data-piece'].charAt(1)==='p'){
            const direction = attributes['data-direction'] === 'up' ? 1 : -1;
            for (let i = 100; i <= 300; i += 100){
                const posY = pos.y - i * direction;
                if (posY >= 0 && posY <= boardHeight) {
                    const step = gameBoard.querySelector(`[style*="transform: translate(${pos.x}%, ${posY}%)"]`);
                    if (step === null) {
                        gameBoard.append(createElementWithAttributes('div', { class: 'hint', style: `transform: translate(${pos.x}%, ${posY}%)` }));
                    } else break;
                } else break;
            }

            const captureLeft = gameBoard.querySelector(`[style*="transform: translate(${pos.x - 100}%, ${pos.y - direction * 100}%)"]`);
            if (captureLeft !== null && captureLeft.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                gameBoard.append(createElementWithAttributes('div', { class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${pos.x - 100}%, ${pos.y - direction * 100}%)` }));
            
            const captureRight = gameBoard.querySelector(`[style*="transform: translate(${pos.x + 100}%, ${pos.y - direction * 100}%)"]`);
            if (captureRight !== null && captureRight.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                gameBoard.append(createElementWithAttributes('div',{ class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${pos.x + 100}%, ${pos.y - direction * 100}%)` }));
        }
        else {
            const pieceInfo = pieces.find(piece => piece.name === attributes['data-piece']);
            for (let j = 0; j < pieceInfo.moves.length; j++){
                for (let i = 1; i <= pieceInfo.steps; i++){
                    const posX = pos.x - pieceInfo.moves[j] * i * 100;
                    const posY = pos.y - pieceInfo.moves[j + 1] * i * 100;
                    if (posX >= 0 && posX <= boardWidth && posY >= 0 && posY <= boardHeight) {
                        const step = gameBoard.querySelector(`[style*="transform: translate(${posX}%, ${posY}%)"]`);
                        if (step !== null) {
                            if (step.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                                gameBoard.append(createElementWithAttributes('div',{ class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${posX}%, ${posY}%)` }));
                            break;
                        }
                        else gameBoard.append(createElementWithAttributes('div',{ class: 'hint', style: `transform: translate(${posX}%, ${posY}%)` }));
                    }
                    else break;
                }
            }
        }
        gameBoard.querySelectorAll('.hint').forEach((hint)=>{
            hint.addEventListener('click', movePieceToPos);
        });
    }

    gameBoard.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const clickedElement = event.target;
        if (clickedElement.classList.contains('piece') && clickedElement.getAttribute('data-piece').charAt(0) === playerGo) {
            selectedPiece = clickedElement;

            const pos = getPos(event, containerRect, selectedPiece);
            
            gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
            
            selectedPiecePos = pos;
            selectedPiece.style.zIndex = 100;
            selectedPiece.style.cursor = 'grabbing';

            gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            calcValidSteps(event);
        } else {
            gameBoard.querySelector('.highlight').style.cssText = `opacity: 0;`;
            gameBoard.querySelector('.hover').style.cssText = `opacity: 0;`;
            selectedPiece = null;
        }
    });

    document.addEventListener('mousemove', (event) => {
        if (selectedPiece) {
            const x = Math.min(449, Math.max(-29, event.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2));
            const y = Math.min(689, Math.max(-29, event.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2));
            selectedPiece.style.transform = `translate(${x}px,${y}px)`;
            
            const pos = getPos(event, containerRect, selectedPiece);
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        }
    });

    document.addEventListener('mouseup', (event) => {
        if (selectedPiece) {
            const pos = getPos(event, containerRect, selectedPiece);
            const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
            if (valid) {
                if (valid.getAttribute('data-hint') !== null) {
                    capture.play();

                    const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
                    const foundPiece = pieces.find(piece => piece.name === capturedPiece.getAttribute('data-piece'));

                    if (playerGo === 'w') {
                        playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                        playerCaptured[0].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
                    } 
                    else {
                        playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                        playerCaptured[1].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
                    }
                    
                    capturedPiece.remove();
                } else click.play();

                selectedPiece.style.transform = `translate(${pos.x}%,${pos.y}%)`;
                gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
                gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;

                if (selectedPiece.getAttribute('data-piece').charAt(1) === 'p') {
                    if (selectedPiece.getAttribute('data-direction') === 'up' && pos.y === 0) selectedPiece.setAttribute('data-direction', 'down');
                    else if (selectedPiece.getAttribute('data-direction') === 'down' && pos.y === boardHeight) selectedPiece.setAttribute('data-direction', 'up');
                }

                selectedPiece.style.zIndex = '';
                selectedPiece.style.cursor = 'grab';
                selectedPiece = null;
                playerGo = (playerGo === 'w') ? 'b' : 'w';

                gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            } else {
                if(pos.x !== selectedPiecePos.x || pos.y !== selectedPiecePos.y) illegal.play();

                selectedPiece.style.transform = `translate(${selectedPiecePos.x}%,${selectedPiecePos.y}%)`;
                gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${selectedPiecePos.x}%, ${selectedPiecePos.y}%); opacity: 0.5;`;
                gameBoard.querySelector('.hover').style.cssText = `transform: translate(${selectedPiecePos.x}%, ${selectedPiecePos.y}%); opacity: 0.7;`;
                
                selectedPiece.style.zIndex = '';
                selectedPiece.style.cursor = 'grab';
                hintActive = selectedPiece;
                selectedPiece = null;
            }
        }
    });

    //avatar input
    //move history on the right side
    //round counter -> finish game -> popup dashboard for winner (or draw)
    pieces.forEach((piece) => {
        for (let i = 0; i < piece.position.length; i++){
            const figure = createElementWithAttributes('div', {
                class: 'piece',
                'data-piece': piece.name,
                'data-direction': 1,
                style: calcPos(piece.position[i]),
                draggable: true
            });
            if (piece.name === 'wp') figure.setAttribute('data-direction', 'up');
            else if (piece.name === 'bp') figure.setAttribute('data-direction', 'down');
            document.querySelector('.game-board').append(figure);
        }
    });
}