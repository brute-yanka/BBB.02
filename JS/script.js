// ========== INPUT VERIFICATION ==========
const input = document.querySelectorAll('.input');
//Select start game button
document.getElementById('player-play').addEventListener('click', () => {
    //Text based and round count input check
    if (input[0].value.trim().length > 0 && input[1].value.trim().length > 0 && input[2].value >= 1 && input[2].value <= 15) {
        //Display settings
        document.querySelector('.home').classList.remove('active');
        document.querySelector('.game').classList.add('active');
        //Load names for each player
        document.querySelectorAll('.player-name').forEach((name, i) => {
            name.innerHTML = `${input[i].value.trim()}<span>0</span>`;
        });
        //Load number of rounds
        document.querySelector('.round-number').innerHTML = input[2].value;
        //Initialize the game
        initGame();
    } else {
        //Check the input for error
        input.forEach((name) => {
            if (name.value.trim().length == 0 || name.value < 1 || name.value > 15) {
                //Reset input value
                name.value = '';
                //Animation
                name.classList.add('player-input-err');
                setTimeout(() => {
                    name.classList.remove('player-input-err');
                }, 700);
            }
        });
    }
});

// ========== BASIC FUNCTIONS ==========
//Helper for element creation
function createElementWithAttributes(tag, attributes, innerHTML) {
    const element = document.createElement(tag);
    for (const attribute in attributes) element.setAttribute(attribute, attributes[attribute]);
    if (innerHTML !== undefined) element.innerHTML = innerHTML;
    return element;
};

//Specific attribute getter
function getAttributeValue(element, attributeName) {
    if (element.hasAttribute(attributeName)) return element.getAttribute(attributeName);
    else return null;
}

//All attributes getter
function getAllAttributes(element) {
    const attributesObject = {};
    element.getAttributeNames().forEach(attributeName => {
        const attributeValue = element.getAttribute(attributeName);
        attributesObject[attributeName] = attributeValue;
    });
    return attributesObject;
}

//String to int (used for initial position ('12'))
function calcPos(input) {
    const translateX = 800 - parseInt(input[0]) * 100;
    const translateY = 1200 - parseInt(input[1] + input[2]) * 100;
    return `transform: translate(${translateX}%, ${translateY}%)`;
}

//Position getter relative to the container (rounded for grid display)
function getPos(event, container, piece) {
    const x = Math.round(Math.min(449, Math.max(-29, event.clientX - container.left - piece.getBoundingClientRect().width / 2)) / 60) * 100;
    const y = Math.round(Math.min(689, Math.max(-29, event.clientY - container.top - piece.getBoundingClientRect().height / 2)) / 60) * 100;
    return { x, y };
}
// =====================================

// ========== INITIALIZE ==========
function initGame() {
    const gameBoard = document.querySelector('.game-board');
    let containerRect = gameBoard.getBoundingClientRect();
    //Need to update the gameBoard bounding rect on resize to avoid incorrect calculations
    window.addEventListener("resize",() => containerRect = gameBoard.getBoundingClientRect());

    let selectedPiece = null; //Currently selected element (for drag&drop)
    let hintActive = null; //Currently selected element (for click)
    let selectedPiecePos;
    let playerGo = 'w'; //Player on go
    //These are for calculation with transform: translate(100%, 100%);
    const boardWidth = 700;
    const boardHeight = 1100;
    //For displaying points and captured pieces
    const playersPoint = document.querySelectorAll('.player-name span');
    const playerCaptured = document.querySelectorAll('.player-captured');

    // ========== MOVING PIECES WITH CLICK ==========
    function movePieceToPos(event) {
        //Select basic variables
        const pos = getPos(event, containerRect, event.target); //Current position of the clicked hint element
        const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`); //Need for possibility of capture
        //Capture check
        if (valid.getAttribute('data-hint') !== null) {
            capture.play(); //Capture sound

            const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
            const foundPiece = pieces.find(piece => piece.name === capturedPiece.getAttribute('data-piece'));
            //The player on turn gets the points and the captured piece
            if (playerGo === 'w') {
                playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                playerCaptured[0].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
            }
            else {
                playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                playerCaptured[1].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
            }
            //Removing the element
            capturedPiece.remove();
        } else click.play(); //Basic move -> click sound

        //Moves the selected element / highlight / hover to the clicked position
        hintActive.style.transform = `translate(${pos.x}%,${pos.y}%)`;
        gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
        gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        //If the piece is a pawn and it has reached the enemy's baseline change direction vice-versa
        if (hintActive.getAttribute('data-piece').charAt(1) === 'p') {
            if (hintActive.getAttribute('data-direction') === 'up' && pos.y === 0) hintActive.setAttribute('data-direction', 'down');
            else if (hintActive.getAttribute('data-direction') === 'down' && pos.y === boardHeight) hintActive.setAttribute('data-direction', 'up');
        }
        //The move was successful, so remove all the hints
        gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
        //Change player on go
        playerGo = (playerGo === 'w') ? 'b' : 'w';
        //Reset the selected element
        hintActive = null;
    }

    // ========== CALCULATE ALL THE VALID STEPS ==========
    function calcValidSteps(event) {
        //All the attributes in an object
        const attributes = getAllAttributes(selectedPiece);
        //Selected element current pos
        const pos = getPos(event, containerRect, selectedPiece);
        //Further information about the selected piece from the pieces array
        const pieceInfo = pieces.find(piece => piece.name === attributes['data-piece']);
        //moves array.length - 1 -> for overflow
        for (let j = 0; j < pieceInfo.moves.length - 1; j++) {
            //Check direction for pawn (if the element does not have this attr. the direction is default (1))
            const direction = attributes['data-direction'] === 'down' ? -1 : 1;
            console.log(direction);
            for (let i = 1; i <= pieceInfo.steps; i++) {
                //Calc new pos for x and y
                const posX = pos.x - pieceInfo.moves[j] * i * 100;
                const posY = pos.y - pieceInfo.moves[j + 1] * i * 100 * direction;
                if (posX >= 0 && posX <= boardWidth && posY >= 0 && posY <= boardHeight) {
                    //Selecting element on given pos
                    const step = gameBoard.querySelector(`[style*="transform: translate(${posX}%, ${posY}%)"]`);
                    if (step !== null) {
                        //Occupied pos -> if not pawn -> check for diff. color
                        if (step.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0) && attributes['data-piece'].charAt(1) !== 'p')
                            gameBoard.append(createElementWithAttributes('div', { class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${posX}%, ${posY}%)` }));
                        //Means that it was pawn or same color
                        break; 
                    }
                    //Means there is no collision
                    else gameBoard.append(createElementWithAttributes('div', { class: 'hint', style: `transform: translate(${posX}%, ${posY}%)` }));
                //Out of board
                } else break;
            }
            //Need to check if piece is pawn
            if (attributes['data-piece'].charAt(1) === 'p') {
                const captureLeft = gameBoard.querySelector(`[style*="transform: translate(${pos.x - 100}%, ${pos.y - direction * 100}%)"]`);
                if (captureLeft !== null && captureLeft.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                    gameBoard.append(createElementWithAttributes('div', { class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${pos.x - 100}%, ${pos.y - direction * 100}%)` }));
                //---
                const captureRight = gameBoard.querySelector(`[style*="transform: translate(${pos.x + 100}%, ${pos.y - direction * 100}%)"]`);
                if (captureRight !== null && captureRight.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                    gameBoard.append(createElementWithAttributes('div',{ class: 'hint', 'data-hint': 'capture-hint', style: `transform: translate(${pos.x + 100}%, ${pos.y - direction * 100}%)` }));
            }
        }
        //Event listener to hints for movement done by click
        gameBoard.querySelectorAll('.hint').forEach((hint)=> hint.addEventListener('click', movePieceToPos));
    }

    // ========== MOVING PIECES WITH DRAG&DROP ==========
    gameBoard.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const clickedElement = event.target;
        //Check if clicked element is a piece and its color equals to player on go
        if (clickedElement.classList.contains('piece') && clickedElement.getAttribute('data-piece').charAt(0) === playerGo) {
            //Drag started
            selectedPiece = clickedElement;
            //Dragged element position
            const pos = getPos(event, containerRect, selectedPiece);
            //Moving the highlight / hover to the current position
            gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
            //Saving current position, because of the move was incorrect the piece will be placed back to its origin position
            selectedPiecePos = pos;
            //Display settings
            selectedPiece.style.zIndex = 100;
            selectedPiece.style.cursor = 'grabbing';
            //Removing all hints if theres any
            gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            //Calculating all possible steps for current element
            calcValidSteps(event);
        } else {
            //If the click was out of border / not on piece / different colored piece, hide the highlight / hover
            gameBoard.querySelector('.highlight').style.cssText = `opacity: 0;`;
            gameBoard.querySelector('.hover').style.cssText = `opacity: 0;`;
            //Reset current selected element
            selectedPiece = null;
        }
    });

    document.addEventListener('mousemove', (event) => {
        //Only do calculation if there is a selected element
        if (selectedPiece) {
            //min & max is to keep the transformed element within border
            //480 is default width but only the half of the element can go out (design), so 480-30
            const x = Math.min(450, Math.max(-30, event.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2));
            //720 is default height but only the half of the element can go out (design), so 720-30
            const y = Math.min(690, Math.max(-30, event.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2));
            //Update position of selected element
            selectedPiece.style.transform = `translate(${x}px,${y}px)`;
            //Current cursor position
            const pos = getPos(event, containerRect, selectedPiece);
            //Update hover position according to cursor position
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        }
    });

    document.addEventListener('mouseup', (event) => {
        //Only do calculation if there is a selected element
        if (selectedPiece) {
            //Dragged element position
            const pos = getPos(event, containerRect, selectedPiece);
            //The current position is valid if there is a hint
            const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
            //If its not null (there is a hint element)
            if (valid) {
                //Capture check
                if (valid.getAttribute('data-hint') !== null) {
                    capture.play(); //Capture sound

                    const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
                    const foundPiece = pieces.find(piece => piece.name === capturedPiece.getAttribute('data-piece'));
                    //The player on turn gets the points and the captured piece
                    if (playerGo === 'w') {
                        playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                        playerCaptured[0].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
                    }
                    else {
                        playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                        playerCaptured[1].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
                    }
                    //Removing the element
                    capturedPiece.remove();
                } else click.play(); //Basic move -> click sound
                
                //Moves the selected element / highlight / hover to the clicked position
                selectedPiece.style.transform = `translate(${pos.x}%,${pos.y}%)`;
                gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
                gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
                //If the piece is a pawn and it has reached the enemy's baseline change direction vice-versa
                if (selectedPiece.getAttribute('data-piece').charAt(1) === 'p') {
                    if (selectedPiece.getAttribute('data-direction') === 'up' && pos.y === 0) selectedPiece.setAttribute('data-direction', 'down');
                    else if (selectedPiece.getAttribute('data-direction') === 'down' && pos.y === boardHeight) selectedPiece.setAttribute('data-direction', 'up');
                }
                //Display settings
                selectedPiece.style.zIndex = '';
                selectedPiece.style.cursor = 'grab';
                //Reset the selected element
                selectedPiece = null;
                //Change player on go
                playerGo = (playerGo === 'w') ? 'b' : 'w';
                //The move was successful, so remove all the hints
                gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            } else {
                //If the selected position is not the original position
                if(pos.x !== selectedPiecePos.x || pos.y !== selectedPiecePos.y) illegal.play(); //Play illegal sound
                //Set the selected element / highlight / hover back to its original position
                selectedPiece.style.transform = `translate(${selectedPiecePos.x}%,${selectedPiecePos.y}%)`;
                gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${selectedPiecePos.x}%, ${selectedPiecePos.y}%); opacity: 0.5;`;
                gameBoard.querySelector('.hover').style.cssText = `transform: translate(${selectedPiecePos.x}%, ${selectedPiecePos.y}%); opacity: 0.7;`;
                //Display settings
                selectedPiece.style.zIndex = '';
                selectedPiece.style.cursor = 'grab';
                //For click movement
                hintActive = selectedPiece;
                //Reset the selected element
                selectedPiece = null;
            }
        }
    });

    //Iterating through the pieces array (pieces.js)
    pieces.forEach((piece) => {
        //Position arrays length means the number of elements
        for (let i = 0; i < piece.position.length; i++){
            //Setting default parameters
            const figure = createElementWithAttributes('div', { class: 'piece', 'data-piece': piece.name, style: calcPos(piece.position[i]) });
            //White pawn moving upwards
            if (piece.name === 'wp') figure.setAttribute('data-direction', 'up');
            //Black pawn moving downwards
            else if (piece.name === 'bp') figure.setAttribute('data-direction', 'down');
            //Append the created element
            document.querySelector('.game-board').append(figure);
        }
    });
}

initGame(); //Just for testing


//mouseup & click movement -> if valid -> avoid using same line twice
//avatar input
//move history on the right side
//round counter -> finish game -> popup dashboard for winner (or draw)
//check for further possible steps -> if none -> end game