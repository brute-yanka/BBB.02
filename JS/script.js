// ========== INPUT VERIFICATION ==========
//Main variables
let playerBlack = null;
let playerWhite = null;
let roundsValue = null;

function verifyInput() {
    //Selectors for further usage
    playerBlack = document.getElementById('player1').value.trim();
    playerWhite = document.getElementById('player2').value.trim();
    roundsValue = parseInt(document.getElementById('rounds').value);
    //Check if player names are not empty
    if (playerBlack === '' || playerWhite === '') {
        createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Hibás játékos név!');
        return false;
    }
    //Check if rounds number is between criteria
    if (0 >= roundsValue || roundsValue > 15 || isNaN(roundsValue)) {
        createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Hibás fordulók száma!<br>(Min: 1 - Max: 15)');
        return false;
    }
    //If all checks pass, return true to indicate valid input
    return true;
}

document.getElementById('start').addEventListener('click', () => {
    if (verifyInput()) {
        //Change active section
        document.querySelector('section.home').classList.remove('active');
        document.querySelector('section.game').classList.add('active');
        //Set game settings
        const players = document.querySelectorAll('.player-name');
        const avatars = document.querySelectorAll('.player-avatar');
        players[0].innerHTML = `${playerBlack} <span>0</span>`;
        avatars[0].src = `Assets/Avatar/${Math.floor(Math.random() * 5) + 1}.png`;
        document.querySelector('.round-number').textContent = roundsValue;
        players[1].innerHTML = `${playerWhite} <span>0</span>`;
        avatars[1].src = `Assets/Avatar/${Math.floor(Math.random() * 5) + 1}.png`;
        //Initialize game
        initGame();
        createToast('info', '<i class="ri-information-line"></i>', 'A játékot a Fehér játékos tudja kezdeni!');
    }
});

document.querySelector('.reset-game').addEventListener('click', () => {
    // fully reset the game
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

// ========== NOTIFICATIONS ==========
function createToast(type, icon, text) {
    const container = document.querySelector('.notifications'); //Container to append toast
    //Create toast with custom parameters
    const toast = createElementWithAttributes('li',
        { class: `toast ${type}` },
        `<div class="column">
            ${icon}
            <span>${text}</span>
        </div>
        <i class="ri-close-line"></i>`
    );
    //Append the toast to the container
    container.append(toast);
    //Remove manually on click
    toast.querySelector('.ri-close-line').addEventListener('click', () => toast.remove());
    //Remove automatically after 4s
    setTimeout(() => toast.remove(), 4000);
}

// ========== INITIALIZE ==========
function initGame() {
    const gameBoard = document.querySelector('.game-board');
    let containerRect = gameBoard.getBoundingClientRect();
    //Need to update the gameBoard bounding rect on resize to avoid incorrect calculations
    window.addEventListener("resize",() => containerRect = gameBoard.getBoundingClientRect());

    let selectedPiece = null; //Currently selected element (for drag&drop)
    let preSelectedPiece = null; //This is for the joker spell
    let hintActive = null; //Currently selected element (for click)
    let selectedPiecePos; //Selected piece position (if move was illegal set the elmenet to its original pos)
    let playerGo = 'w'; //Player on go
    let freezeActivated = false; //Freeze spell
    //These are for calculation like -> transform: translate(100%, 100%);
    const boardWidth = 700;
    const boardHeight = 1100;
    //For displaying points and captured pieces
    const playersPoint = document.querySelectorAll('.player-name span');
    const playerCaptured = document.querySelectorAll('.player-captured');
    const playerAbility = document.querySelectorAll('.player-ability');

    // ========== ABILITY HANDLER ==========
    function abilityHandler() {
        //Selectors for further usage
        const player = this.closest('.player-component').getAttribute('data-player');
        const color = this.closest('.player-component').getAttribute('data-player-color');
        const ability = this.querySelector('.spell-image').getAttribute('data-name');
        //Check if the clicked spell was the player on go
        if (playerGo === color) {
            //Check for the chosen ability
            if (ability === 'Joker') {
                //If there is no pre-selected element, throw an error
                if (!hintActive) {
                    createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Jelöljön ki egy elemet!<br>(Erről lesz a lépés átmásolva.)');
                    return; //Stop executing the function
                }
                //This is the pre-selected element -> use its attribute and set the post-selected attribute to it
                preSelectedPiece = hintActive;
                //Giving information to the user
                createToast('info', '<i class="ri-information-line"></i>', 'Jelöljön ki egy elemet!<br>(Erre lesz a lépés átmásolva.)');
            } else {
                freezeActivated = true; //Freeze ability is activated for the player
                createToast('success', '<i class="ri-check-line"></i>', `${player} játékos sikeresen aktiválta a fagyasztás képességet!`);
                createToast('info', '<i class="ri-information-line"></i>', `${player} játékos kettőt tud lépni!`);
            }
            //Make the selected spell inactive
            this.querySelector('.spell').classList.add('inactive');
            //Remove listener not to use ability again (in the current round)
            this.removeEventListener('click', abilityHandler);
        }
    }
    //Iterate through all the ability elements and add listener
    playerAbility.forEach((element) => element.addEventListener('click', abilityHandler)); // !!!! KORONKET RESET !!!!

    // ========== MOVING PIECES WITH CLICK ==========
    function movePieceToPos(event) {
        //Select basic variables
        const pos = getPos(event, containerRect, event.target); //Current position of the clicked hint element
        const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`); //Need for possibility of capture
        //Capture check
        if (valid.getAttribute('data-hint') !== null) {
            capture.play(); //Capture sound
            //Selectors for further usage
            const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
            const foundPiece = pieces.find(piece => piece.name === capturedPiece.getAttribute('data-piece'));
            //The player on turn gets the points and the captured piece
            if (playerGo === 'w') {
                playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                playerCaptured[1].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
            }
            else {
                playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                playerCaptured[0].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
            }
            //Removing the element
            capturedPiece.remove();
        } else click.play(); //Basic move -> click sound

        //Moves the selected element / highlight / hover to the clicked position
        hintActive.style.transform = `translate(${pos.x}%, ${pos.y}%)`;
        // Check if the element has the data-original attribute
        if (hintActive.hasAttribute('data-original')) {
            //If so there was a valid step with it so change it back to its original attribute
            hintActive.setAttribute('data-piece', hintActive.getAttribute('data-original'));
            //Remove the unnecessary attribute
            hintActive.removeAttribute('data-original');
            createToast('info', '<i class="ri-information-line"></i>', `Joker képesség használata végetért!`);
        }
        gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
        gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
        //If the piece is a pawn and it has reached the enemy's baseline change direction vice-versa
        if (hintActive.getAttribute('data-piece').charAt(1) === 'p') {
            if (hintActive.getAttribute('data-direction') === 'up' && pos.y === 0) hintActive.setAttribute('data-direction', 'down');
            else if (hintActive.getAttribute('data-direction') === 'down' && pos.y === boardHeight) hintActive.setAttribute('data-direction', 'up');
        }
        //The move was successful, so remove all the hints
        gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
        //Change player on go (if there is no active spell)
        if (!freezeActivated) playerGo = (playerGo === 'w') ? 'b' : 'w';
        freezeActivated = false;
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
            //Start drag
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
            //Check for joker spell
            if (preSelectedPiece) {
                //Save its original attribute
                selectedPiece.setAttribute('data-original', selectedPiece.getAttribute('data-piece'));
                //Change the selected pieces attribute to the pre-selected pieces attribute
                selectedPiece.setAttribute('data-piece', preSelectedPiece.getAttribute('data-piece'));
                //Reset pre-selected piece
                preSelectedPiece = null;
                createToast('success', '<i class="ri-check-line"></i>', `Joker képesség sikeresen aktiválva!`);
            }
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
                        playersPoint[1].textContent = parseInt(playersPoint[1].textContent) + foundPiece.points;
                        playerCaptured[1].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
                    }
                    else {
                        playersPoint[0].textContent = parseInt(playersPoint[0].textContent) + foundPiece.points;
                        playerCaptured[0].append(createElementWithAttributes('span', {'data-piece': foundPiece.name}));
                    }
                    //Removing the element
                    capturedPiece.remove();
                } else click.play(); //Basic move -> click sound
                //Moves the selected element / highlight / hover to the clicked position
                selectedPiece.style.transform = `translate(${pos.x}%,${pos.y}%)`;
                // Check if the element has the data-original attribute
                if (selectedPiece.hasAttribute('data-original')) {
                    //If so there was a valid step with it so change it back to its original attribute
                    selectedPiece.setAttribute('data-piece', selectedPiece.getAttribute('data-original'));
                    //Remove the unnecessary attribute
                    selectedPiece.removeAttribute('data-original');
                    createToast('info', '<i class="ri-information-line"></i>', `Joker képesség használata végetért!`);
                }
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
                //Change player on go (if there is no active spell)
                if (!freezeActivated) playerGo = (playerGo === 'w') ? 'b' : 'w';
                freezeActivated = false;
                //The move was successful, so remove all the hints
                gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            } else {
                //If the selected position is not the original position
                if (pos.x !== selectedPiecePos.x || pos.y !== selectedPiecePos.y) {
                    illegal.play(); //Play illegal sound
                    createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Sikertelen lépés! (Illegális)');
                }
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


//mouseup & click movement -> if valid -> avoid using same lines twice
//round counter -> finish game -> popup dashboard for winner (or draw)
//check for further possible steps -> if none -> end game
// iv)Az a játékos nyer, aki először szedi le az ellenfele minden bábuját.
// Ha ennyi kör alatt senki sem nyer, a játszma akkor is érjen véget, és az oldal hirdessen győztest a leütött figurák pontjai alapján

//ha paraszt lepest rak ra masik elemre akkor vinni kell annak az iranyat is (plusz visszarakni)