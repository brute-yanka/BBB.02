//========== INPUT VERIFICATION ==========
//Main variables
const players = document.querySelectorAll('.player-name');
const avatars = document.querySelectorAll('.player-avatar');
const playerCaptured = document.querySelectorAll('.player-captured');
const playerAbility = document.querySelectorAll('.player-ability');
let playerBlack = null;
let playerWhite = null;
let roundsValue = null;

createToast('info', '<i class="ri-information-line"></i>', '1 kör = Mindkét játékos lép!<br>(Kivéve képesség volt aktiválva!)');
function verifyInput() {
    //Selectors for further usage
    playerBlack = document.getElementById('player1').value.trim();
    playerWhite = document.getElementById('player2').value.trim();
    roundsValue = parseInt(document.getElementById('rounds').value);
    //Check if player names are not empty
    if (playerBlack === '' || playerWhite === '' || playerWhite === playerBlack) {
        createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Hiba!<br>(Játékosnév mező nem lehet üres!)<br>(Játékosnév hossza max. 15 karakter!)<br>(A játékosnév nem egyezhet meg!)');
        return false;
    }
    //Check if rounds number is between criteria
    if (0 >= roundsValue || isNaN(roundsValue)) {
        createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Hibás fordulók száma!<br>(Min: 1)');
        return false;
    }
    //If all checks pass, return true to indicate valid input
    return true;
};

document.getElementById('start').addEventListener('click', () => {
    if (verifyInput()) {
        //Change active section
        document.querySelector('section.home').classList.remove('active');
        document.querySelector('section.game').classList.add('active');
        //Set game settings
        players[0].innerHTML = `${playerBlack} <span>0</span>`;
        avatars[0].src = `Assets/Avatar/${Math.floor(Math.random() * 5) + 1}.png`;
        document.querySelector('.round-number').textContent = roundsValue;
        players[1].innerHTML = `${playerWhite} <span>0</span>`;
        avatars[1].src = `Assets/Avatar/${Math.floor(Math.random() * 5) + 1}.png`;
        //Initialize game
        initGame();
    }
});

//========== BASIC FUNCTIONS ==========
//Helper for element creation
function createElementWithAttributes(tag, attributes, innerHTML) {
    const element = document.createElement(tag);
    for (const attribute in attributes) element.setAttribute(attribute, attributes[attribute]);
    if (innerHTML !== undefined) element.innerHTML = innerHTML;
    return element;
};

//All attributes getter
function getAllAttributes(element) {
    const attributesObject = {};
    element.getAttributeNames().forEach(attributeName => {
        const attributeValue = element.getAttribute(attributeName);
        attributesObject[attributeName] = attributeValue;
    });
    return attributesObject;
};

//String to int (used for initial position ('12'))
function initPos(input) {
    const translateX = 800 - parseInt(input[0]) * 100;
    const translateY = 1200 - parseInt(input[1] + input[2]) * 100;
    return `transform: translate(${translateX}%, ${translateY}%)`;
};

//Calculate position relative to the container (rounded for grid display)
function calcPos(event, container, piece) {
    const pieceWidth = piece.getBoundingClientRect().width;
    const pieceHeight = piece.getBoundingClientRect().height;
    const maxX = container.width - pieceWidth / 2 - 1; //Need to subtract the half of the elements width to keep element inside board
    const maxY = container.height - pieceHeight / 2 - 1; //Need to subtract the half of the elements height to keep element inside board
    const minX = -(pieceWidth / 2 - 1); //To keep element inside board
    const minY = -(pieceHeight / 2 - 1); //To keep element inside board
    //Need to divide with the piece width / height which is rounded and then multiplied by 100, so the result is a gridish appearance
    const x = Math.round(Math.min(maxX, Math.max(minX, event.clientX - container.left - pieceWidth / 2)) / pieceWidth) * 100;
    const y = Math.round(Math.min(maxY, Math.max(minY, event.clientY - container.top - pieceHeight / 2)) / pieceHeight) * 100;
    return { x, y };
};

//Get position from elements attribute
function getPos(element) {
    const style = element.getAttribute('style');
    const match = /translate\(([^,]+),\s*([^,]+)\)/.exec(style);
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    return { x, y };
};

//========== NOTIFICATIONS ==========
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
    //Remove automatically after 5s
    setTimeout(() => toast.remove(), 5000);
};

initGame();
//========== INITIALIZE ==========
function initGame() {
    createToast('info', '<i class="ri-information-line"></i>', 'A játékot a Fehér játékos tudja kezdeni!');
    const gameBoard = document.querySelector('.game-board');
    let containerRect = gameBoard.getBoundingClientRect();
    function updateClientRect() { containerRect = gameBoard.getBoundingClientRect(); }

    let selectedPiece = null; //Currently selected element
    let selectedPiecePos = null; //Selected piece position (if move was illegal set the elmenet to its original pos)
    let dragged = false; //For drag&drop
    let playerGo = 'w'; //Player on go
    let freezeActivated = false; //Freeze spell
    let jokerActivated = false; //Joker spell
    let currRoundsValue = 0 //For current round
    //These are for calculation like -> transform: translate(100%, 100%);
    const boardWidth = 700;
    const boardHeight = 1100;
    //For displaying points and captured pieces
    const playersPoint = document.querySelectorAll('.player-name span');

    //========== CHECK DEVICE TYPE (Touch / non-touch device) ==========
    const deviceType = (function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    })();

    //========== CALCULATE ALL THE VALID STEPS ==========
    function calcValidSteps(selectedPiece) {
        // Initialize an array to store hint coordinates
        const hints = [];
        //All the attributes in an object
        const attributes = getAllAttributes(selectedPiece);
        //Selected element current pos
        const pos = getPos(selectedPiece);
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
                            hints.push({ x: posX, y: posY, isCaptureHint: true });
                        //Means that it was pawn or same color
                        break;
                    }
                    //Means there is no collision
                    else hints.push({ x: posX, y: posY, isCaptureHint: false });
                //Out of board
                } else break;
            }
            //Need to check if piece is pawn
            if (attributes['data-piece'].charAt(1) === 'p') {
                const captureLeft = gameBoard.querySelector(`[style*="transform: translate(${pos.x - 100}%, ${pos.y - direction * 100}%)"]`);
                if (captureLeft !== null && captureLeft.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                    hints.push({ x: pos.x - 100, y: pos.y - direction * 100, isCaptureHint: true });
                //---
                const captureRight = gameBoard.querySelector(`[style*="transform: translate(${pos.x + 100}%, ${pos.y - direction * 100}%)"]`);
                if (captureRight !== null && captureRight.getAttribute('data-piece').charAt(0) !== attributes['data-piece'].charAt(0))
                    hints.push({ x: pos.x + 100, y: pos.y - direction * 100, isCaptureHint: true });
            }
        }
        return hints;
    };

    //Valid step helper
    function showHints(hints) {
        hints.forEach(hint => {
            const hintElement = createElementWithAttributes('div', { class: 'hint', style: `transform: translate(${hint.x}%, ${hint.y}%)` });
            if (hint.isCaptureHint) hintElement.setAttribute('data-hint', 'capture-hint');
            gameBoard.append(hintElement);
            // Add event listener to the hint element for click handling
            hintElement.addEventListener('click', (event) => placePiece(calcPos(event, containerRect, event.target)));
        });
    };

    //========== JOKER PROMOTION ==========
    function getOtherPieces(selectedPiece, selectedPieceName, selectedPieceDirection) {
        //Empty the container
        document.querySelector('.promotion').innerHTML = '';
        //Check if selected piece is a pawn
        if (selectedPieceDirection) {
            //Append a pawn that goes the opposite direction
            document.querySelector('.promotion').append(createElementWithAttributes('div', { class: 'promotion-piece', 'data-piece': `${selectedPieceName.charAt(0)}p`, 'data-direction': selectedPieceDirection === 'up' ? 'down' : 'up' }));
        }
        //Get every piece (except the selected) that has the same color
        pieces.filter(piece => piece.name.charAt(0) === selectedPieceName.charAt(0) && piece.name !== selectedPieceName).forEach(piece => {
            //If the selected piece is not pawn both direction should be appened
            if (piece.name.charAt(1) === 'p') {
                document.querySelector('.promotion').append(createElementWithAttributes('div', { class: 'promotion-piece', 'data-piece': piece.name, 'data-direction': 'up' }));
                document.querySelector('.promotion').append(createElementWithAttributes('div', { class: 'promotion-piece', 'data-piece': piece.name, 'data-direction': 'down' }));
            } else {
                document.querySelector('.promotion').append(createElementWithAttributes('div', { class: 'promotion-piece', 'data-piece': piece.name }));
            }
        });
        //Add event listener to the elements
        document.querySelectorAll('.promotion-piece').forEach(piece => {
            piece.addEventListener('click', (event) => {
                //Save current piece attributes
                selectedPiece.setAttribute('data-original-piece', selectedPiece.getAttribute('data-piece'));
                selectedPiece.setAttribute('data-original-direction', selectedPiece.getAttribute('data-direction'));
                //Update current piece attributes
                selectedPiece.setAttribute('data-piece', event.target.getAttribute('data-piece'));
                selectedPiece.setAttribute('data-direction', event.target.getAttribute('data-direction'));
                //Empty the container
                document.querySelector('.promotion').innerHTML = '';
                //Message
                createToast('success', '<i class="ri-check-line"></i>', `Joker képesség sikeresen aktiválva!`);
                //Deactivate ability
                jokerActivated = false;
                //Removing all hints
                gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
                //Update all possible steps for current element
                showHints(calcValidSteps(selectedPiece));
            });
        });
    };

    //========== PIECE PLACEMENT HANDLER ==========
    function placePiece(pos) {
        //The current position is valid if there is a hint
        const valid = gameBoard.querySelector(`.hint[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
        //If its not null (there is a hint element)
        if (valid) {
            //Check capture possibility
            if (valid.getAttribute('data-hint') !== null) {
                capture.play(); //Capture sound
                //Select capture piece for further usage(points, captured pieces)
                const capturedPiece = gameBoard.querySelector(`.piece[style*="transform: translate(${pos.x}%, ${pos.y}%)"]`);
                //Check if captured element is joker (only the default pieces point are added)
                const pieceName = capturedPiece.hasAttribute('data-original-piece') ? capturedPiece.getAttribute('data-original-piece') : capturedPiece.getAttribute('data-piece');
                const foundPiece = pieces.find(piece => piece.name === pieceName);
                //The player on turn gets the points and the captured piece
                const currentPlayerIndex = (playerGo === 'w') ? 1 : 0;
                playersPoint[currentPlayerIndex].textContent = parseInt(playersPoint[currentPlayerIndex].textContent) + foundPiece.points;
                //Check end-game (by captured pieces)
                if (parseInt(playersPoint[currentPlayerIndex].textContent) === 29) endGame();
                //Check for further step possibility (if joker ability was used and there are no other pieces just pawns)
                if (document.querySelector(`.player-component[data-player-color=${playerGo === 'w' ? 'b' : 'w'}] .spell-image[data-name="Joker"]`).parentNode.classList.contains('inactive') &&
                    document.querySelectorAll(`.piece[data-piece^='${playerGo === 'w' ? 'b' : 'w'}']:not([data-piece$='p'])`).length === 0) {
                    //Since only pawns cant attack in the way of its movement
                    document.querySelectorAll(`.piece[data-piece^='${playerGo === 'w' ? 'b' : 'w'}p']`).forEach(pawn => {
                        //If there is only one pawn that can move its not game-end
                        if (calcValidSteps(pawn).length > 0)
                            return; //No need to check further steps
                    });
                    //Its end-game if the joker ability is not available and the pawn(s) cant move
                    endGame();
                }
                //Add captured element
                playerCaptured[currentPlayerIndex].append(createElementWithAttributes('span', { 'data-piece': foundPiece.name }));
                //Remove the element
                capturedPiece.remove();
            } else click.play(); //Basic move -> click sound
            //Moves the selected element / highlight / hover to the clicked position
            selectedPiece.style.transform = `translate(${pos.x}%,${pos.y}%)`;
            //Check if the element has the data-original attribute
            if (selectedPiece.hasAttribute('data-original-piece')) {
                //If so there was a valid step with it so change it back to its original attribute
                selectedPiece.setAttribute('data-piece', selectedPiece.getAttribute('data-original-piece'));
                selectedPiece.setAttribute('data-direction', selectedPiece.getAttribute('data-original-direction'));
                //Remove the unnecessary attributes
                selectedPiece.removeAttribute('data-original-piece');
                selectedPiece.removeAttribute('data-original-direction');
                createToast('info', '<i class="ri-information-line"></i>', 'Joker képesség használata végetért!');
            }
            gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
            //If the piece is a pawn and it has reached the enemy's baseline change direction vice-versa;
            if (selectedPiece.getAttribute('data-direction') === 'up' && pos.y === 0) selectedPiece.setAttribute('data-direction', 'down');
            else if (selectedPiece.getAttribute('data-direction') === 'down' && pos.y === boardHeight) selectedPiece.setAttribute('data-direction', 'up');
            //The move was successful, so remove all the hints
            gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            //Change player on go (if there is no active spell)
            if (!freezeActivated) {
                playerGo = (playerGo === 'w') ? 'b' : 'w';
                //Update current round
                document.querySelector('.curr-round-number').textContent = Math.floor(currRoundsValue += 0.5);
                //Check end-game (by rounds)
                if (Math.floor(currRoundsValue) === roundsValue) endGame();
            }
            else freezeActivated = false;
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
        }
        //Display settings
        selectedPiece.style.zIndex = '';
        selectedPiece.style.cursor = 'grab';
        //Reset the selected element
        dragged = false;
    };

    //========== ABILITY HANDLER ==========
    function abilityHandler() {
        //Selectors for further usage
        const player = this.closest('.player-component').getAttribute('data-player');
        const color = this.closest('.player-component').getAttribute('data-player-color');
        const ability = this.querySelector('.spell-image').getAttribute('data-name');
        //Check if the clicked spell was the player on go
        if (playerGo === color) {
            //Check for the chosen ability
            if (ability === 'Joker') {
                //If there is no selected element, throw an error
                if (selectedPiece) {
                    //If the selected element is not the same color as the player on go, throw an error
                    if (playerGo !== selectedPiece.getAttribute('data-piece').charAt(0)) {
                        createToast('error', '<i class="ri-indeterminate-circle-line"></i>', 'Jelöljön ki egy elemet!<br>(Erre lesz a lépés átmásolva.)');
                        return; //Stop executing the function
                    }
                    //Display all the possible pieces
                    getOtherPieces(selectedPiece,
                        selectedPiece.getAttribute('data-piece'),
                        selectedPiece.hasAttribute('data-direction') ? selectedPiece.getAttribute('data-direction') : null
                    );
                    //Activate ability
                    jokerActivated = true;
                    notify.play(); //Play notification sound
                }
            } else {
                freezeActivated = true; //Freeze ability is activated for the player
                notify.play(); //Play notification sound
                createToast('success', '<i class="ri-check-line"></i>', `${player} játékos sikeresen aktiválta a fagyasztás képességet!`);
                createToast('info', '<i class="ri-information-line"></i>', `${player} játékos kettőt tud lépni!`);
            }
            //Make the selected spell inactive
            this.querySelector('.spell').classList.add('inactive');
            //Remove listener not to use ability again (in the current round)
            this.removeEventListener('click', abilityHandler);
        }
    };

    //========== NON-TOUCH DEVICE DRAG & DROP ==========
    function onMouseDown(event) {
        //Prevent default drag&drop
        event.preventDefault();
        const clickedElement = event.target;
        //Check if clicked element is a piece and its color equals to player on go
        if (clickedElement.classList.contains('piece') && clickedElement.getAttribute('data-piece').charAt(0) === playerGo) {
            //Start drag
            selectedPiece = clickedElement;
            dragged = true;
            //Dragged element position
            const pos = getPos(selectedPiece);
            //Saving current position, because of the move was incorrect the piece will be placed back to its origin position
            selectedPiecePos = pos;
            //Moving the highlight / hover to the current position
            gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
            //Display settings
            selectedPiece.style.zIndex = 100;
            selectedPiece.style.cursor = 'grabbing';
            //Removing all hints
            gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            //Check for joker spell
            if (jokerActivated) getOtherPieces(selectedPiece, selectedPiece.getAttribute('data-piece'), selectedPiece.hasAttribute('data-direction') ? selectedPiece.getAttribute('data-direction') : null);
            //Calculating all possible steps for current element
            showHints(calcValidSteps(selectedPiece));
        } else {
            //If the click was out of border / not on piece / different colored piece, hide the highlight / hover
            gameBoard.querySelector('.highlight').style.cssText = `opacity: 0;`;
            gameBoard.querySelector('.hover').style.cssText = `opacity: 0;`;
            //Reset current selected element
            dragged = false;
            //If there was a click but not on the hint element, remove all the hint
            if(!clickedElement.classList.contains('hint')) gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
        }
    };

    function onMouseMove(event) {
        //Only do calculation if there is a selected element
        if (!dragged) return;
        //min & max is to keep the transformed element within border
        //480 is default width but only the half of the element can go out (design), so 480-30
        const x = Math.min(450, Math.max(-30, event.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2));
        //720 is default height but only the half of the element can go out (design), so 720-30
        const y = Math.min(690, Math.max(-30, event.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2));
        //Update position of selected element
        selectedPiece.style.transform = `translate(${x}px,${y}px)`;
        //Current cursor position
        const pos = calcPos(event, containerRect, selectedPiece);
        //Update hover position according to cursor position
        gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
    };

    function onMouseUp(event) {
        //Only do calculation if there is a dragged element
        if (!dragged) return;
        placePiece(calcPos(event, containerRect, selectedPiece));
    };

    //========== TOUCH DEVICE DRAG & DROP ==========
    function onTouchStart(event) {
        const clickedElement = event.targetTouches[0].target; // Get the first touch
        if (clickedElement.classList.contains('piece') && clickedElement.getAttribute('data-piece').charAt(0) === playerGo) {
            selectedPiece = clickedElement;
            dragged = true;
            const pos = getPos(selectedPiece);
            selectedPiecePos = pos;
            gameBoard.querySelector('.highlight').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.5;`;
            gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
            selectedPiece.style.zIndex = 100;
            selectedPiece.style.cursor = 'grabbing';
            gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
            if (jokerActivated) getOtherPieces(selectedPiece, selectedPiece.getAttribute('data-piece'), selectedPiece.hasAttribute('data-direction') ? selectedPiece.getAttribute('data-direction') : null);
            showHints(calcValidSteps(selectedPiece));
        } else {
            gameBoard.querySelector('.highlight').style.cssText = `opacity: 0;`;
            gameBoard.querySelector('.hover').style.cssText = `opacity: 0;`;
            dragged = false;
            if (!clickedElement.classList.contains('hint')) gameBoard.querySelectorAll('.hint').forEach((hint) => hint.remove());
        }
    };

    function onTouchMove(event) {
        if (!dragged) return;
        const touch = event.targetTouches[0]; // Get the first touch

        const x = Math.min(450, Math.max(-30, touch.clientX - containerRect.left - selectedPiece.getBoundingClientRect().width / 2));
        const y = Math.min(690, Math.max(-30, touch.clientY - containerRect.top - selectedPiece.getBoundingClientRect().height / 2));

        selectedPiece.style.transform = `translate(${x}px, ${y}px)`;

        const pos = calcPos(touch, containerRect, selectedPiece);
        gameBoard.querySelector('.hover').style.cssText = `transform: translate(${pos.x}%, ${pos.y}%); opacity: 0.7;`;
    };

    function onTouchEnd(event) {
        if (!dragged) return;
        const touch = event.changedTouches[0];
        placePiece(calcPos(touch, containerRect, selectedPiece));
    };

    //========== INITIALIZE EVENT LISTENERS (self-calling) ==========
    (function () {
        //If the device is a touch device add different listeners
        if (deviceType) {
            document.addEventListener('touchstart', onTouchStart);
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
        } else {
            document.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        playerAbility.forEach((element) => element.addEventListener('click', abilityHandler));
        document.querySelectorAll('.reset-game').forEach((button) => button.addEventListener('click', resetGame));
        window.addEventListener("resize", updateClientRect); //Need to update the gameBoard bounding rect on resize to avoid incorrect calculations
    })();

    //========== CREATE BOARD PIECES ==========
    pieces.forEach((piece) => {
        //Position arrays length means the number of elements
        for (let i = 0; i < piece.position.length; i++){
            //Setting default parameters
            const figure = createElementWithAttributes('div', { class: 'piece', 'data-piece': piece.name, style: initPos(piece.position[i]) });
            //White pawn moving upwards
            if (piece.name === 'wp') figure.setAttribute('data-direction', 'up');
            //Black pawn moving downwards
            else if (piece.name === 'bp') figure.setAttribute('data-direction', 'down');
            //Append the created element
            document.querySelector('.game-board').append(figure);
        }
    });

    //========== RESET GAME ==========
    function resetGame(init = true) {
        //Remove endgame panel display
        document.querySelector('.endgame').classList.remove('active');
        //Restore event listeners (to avoid duplicates)
        if (deviceType) {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        } else {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        playerAbility.forEach((element) => element.removeEventListener('click', abilityHandler));
        document.querySelectorAll('.reset-game').forEach((button) => button.removeEventListener('click', resetGame));
        window.removeEventListener("resize", updateClientRect);
        //Reset every element
        document.querySelectorAll('.piece').forEach((piece) => piece.remove());
        document.querySelectorAll('.hint').forEach((hint) => hint.remove());
        document.querySelectorAll('.spell').forEach((spell) => spell.classList.remove('inactive'));
        document.querySelector('.promotion').innerHTML = '';
        //Reset highlight
        gameBoard.querySelector('.highlight').style.cssText = `opacity: 0;`;
        gameBoard.querySelector('.hover').style.cssText = `opacity: 0;`;
        //Reset points
        players[0].innerHTML = `${playerBlack} <span>0</span>`;
        players[1].innerHTML = `${playerWhite} <span>0</span>`;
        //Reset captured pieces
        playerCaptured[0].innerHTML = '';
        playerCaptured[1].innerHTML = '';
        //Reset current round
        document.querySelector('.curr-round-number').textContent = 0;
        //Initialize game
        if(init) initGame();
    };

    //========== ENDGAME ==========
    function endGame() {
        //Stop dragging
        dragged = false;
        //Selectors for further usage
        const container = document.querySelector('.endgame');
        const homeButton = document.getElementById('home');
        const player1Points = parseInt(playersPoint[0].textContent);
        const player2Points = parseInt(playersPoint[1].textContent);
        const images = document.querySelectorAll('.modal-box-player img');
        //Display endgame panel
        container.classList.add('active');
        //Check if user want to go to home page
        homeButton.addEventListener('click', () => {
            resetGame(false);
            //Reset inputs
            document.querySelectorAll('.home-input').forEach((input) => input.value = '');
            //Change active section
            document.querySelector('section.home').classList.add('active');
            document.querySelector('section.game').classList.remove('active');
        });
        //Set winner
        if (player1Points > player2Points) {
            document.querySelector('.modal-box > h3').innerHTML = `<span>${playerBlack}</span> a győztes!`;
            images[0].setAttribute('data-winner', '');
            gameEnd.play(); //Play game-end sound (there is a winner)
        } else if (player1Points < player2Points) {
            document.querySelector('.modal-box > h3').innerHTML = `<span>${playerWhite}</span> a győztes!`;
            images[1].setAttribute('data-winner', '');
            gameEnd.play(); //Play game-end sound (there is a winner)
        } else {
            document.querySelector('.modal-box > h3').innerHTML = `Döntetlen!`;
            //If there was previous round and there was a winner -> remove for current round
            images[0].removeAttribute('data-winner');
            images[1].removeAttribute('data-winner');
            gameDraw.play(); //Play game-end sound (draw)
        }
        //Change values
        images.forEach((image, index) => image.src = avatars[index].src);
        document.querySelectorAll('.modal-box-player p span').forEach((points, index) => points.textContent = players[index].querySelector('span').textContent);
    };
}