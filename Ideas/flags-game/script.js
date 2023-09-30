//Initial References
let draggableObjects;
let dropPoints;
const startButton = document.getElementById('start');
const result = document.getElementById('result');
const controls = document.querySelector('.controls-container');
const dragContainer = document.querySelector('.draggable-objects');
const dropContainer = document.querySelector('.drop-points');

const data = ['belgium', 'bhutan', 'brazil', 'china', 'cuba', 'ecuador', 'georgia', 'germany', 'hong-kong', 'india', 'iran', 'myanmar', 'norway', 'spain', 'sri-lanka', 'sweden', 'switzerland', 'united-states', 'uruguay', 'wales'];

let deviceType = '';
let initialX = 0;
let initialY = 0;
let currentElement = '';
let moveElement = false;

//Detect touch device
const isTouchDevice = () => {
    try {
        //We try to create Touch Event (It would fail for desktops and throw error)
        document.createEvent('TouchEvent');
        deviceType = 'touch';
        return true;
    } catch (e) {
        deviceType = 'mouse';
        return false;
    }
};

let count = 0;

//Random value from Array
const randomValueGenerator = () => {
    return data[Math.floor(Math.random() * data.length)];
};

//Win Game Display
const stopGame = () => {
    controls.classList.remove('hide');
    startButton.classList.remove('hide');
};

//Drag & Drop Functions
function dragStart(e) {
    if (isTouchDevice()) {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
        //Start movement for touch
        moveElement = true;
        currentElement = e.target;
    } else {
        e.dataTransfer.setData('text', e.target.id);
    }
};

//Events fired on the drop target
function dragOver(e) {
    e.preventDefault();
};

//For touchscreen movement
const touchMove = (e) => {
    if (moveElement) {
        e.preventDefault();
        let newX = e.touches[0].clientX;
        let newY = e.touches[0].clientY;
        let currentSelectedElement = document.getElementById(e.target.id);
        currentSelectedElement.parentElement.style.top = currentSelectedElement.parentElement.offsetTop - (initialY - newY) + 'px';
        currentSelectedElement.parentElement.style.left = currentSelectedElement.parentElement.offsetLeft - (initialX - newX) + 'px';
        initialX = newX;
        initialY = newY;
    }
};

const drop = (e) => {
    e.preventDefault();
    if (isTouchDevice()) {
        moveElement = false;
        //Select country name div using the custom attribute
        const currentDrop = document.querySelector(`div[data-id='${e.target.id}']`);
        //Get boundaries of div
        const currentDropBound = currentDrop.getBoundingClientRect();
        //If the position of flag falls inside the bounds of the conutry name
        if (initialX >= currentDropBound.left &&
            initialX <= currentDropBound.right &&
            initialY >= currentDropBound.top &&
            initialY <= currentDropBound.bottom) {
            currentDrop.classList.add('dropped');
            //Hide actual image
            currentElement.classList.add('hide');
            currentDrop.innerHTML = ``;
            //Insert new img element
            currentDrop.insertAdjacentHTML('afterbegin', `<img src='Images/${currentElement.id}.png'>`);
            count++;
        }
    } else {
        //Access data
        const draggedElementData = e.dataTransfer.getData('text');
        //Get custom attribute value
        const droppableElementData = e.target.getAttribute('data-id');
        if (draggedElementData === droppableElementData) {
            const draggedElement = document.getElementById(draggedElementData);
            //Dropped class
            e.target.classList.add('dropped');
            //Hide current img
            draggedElement.classList.add('hide');
            //Draggable set to false
            draggedElement.setAttribute('draggable', false);
            e.target.innerHTML = ``;
            //Insert new img
            e.target.insertAdjacentHTML('afterbegin', `<img src='Images/${draggedElementData}.png'>`);
            count++;
        }
    }
    //Win
    if (count == 6) {
        result.innerText = 'You Won!';
        stopGame();
    }
};

//Creates flags and countries
const creator = () => {
    dragContainer.innerHTML = '';  
    dropContainer.innerHTML = '';  
    let randomData = [];
    //For string random values in array
    for (let i = 1; i <= 6; i++){
        let randomValue = randomValueGenerator();
        if (!randomData.includes(randomValue)) {
            randomData.push(randomValue);
        } else {
            //If value already exists then decrement i by one
            i--;
        }
    }
    for (let i of randomData) {
        const flagDiv = document.createElement('div');
        flagDiv.classList.add('draggable-image');
        flagDiv.setAttribute('draggable', true);
        if (isTouchDevice()) {
            flagDiv.style.position = 'absolute';
        }
        flagDiv.innerHTML = `<img src='Images/${i}.png' id='${i}'>`;
        dragContainer.appendChild(flagDiv);
    }
    //Sort the array randomly before creating country divs
    randomData = randomData.sort(() => 0.5 - Math.random());
    for (let i of randomData) {
        const countryDiv = document.createElement('div');
        countryDiv.innerHTML = `<div class='countries' data-id='${i}'> ${i.charAt(0).toUpperCase() + i.slice(1).replace('-', '')}`;
        dropContainer.appendChild(countryDiv);
    }
};

//Start Game
startButton.addEventListener('click', (startGame = async () => {
    currentElement = '';
    controls.classList.add('hide');
    startButton.classList.add('hide');
    //This will wait for creator to create the images and then move forward
    await creator();
    count = 0;
    dropPoints = document.querySelectorAll('.countries');
    draggableObjects = document.querySelectorAll('.draggable-image');
    //Events
    draggableObjects.forEach((element) => {
        element.addEventListener('dragstart', dragStart);
        //For touch screen
        element.addEventListener('touchstart', dragStart);
        element.addEventListener('touchend', drop);
        element.addEventListener('touchmove', touchMove);
    });
    dropPoints.forEach((element) => {
        element.addEventListener('dragover', dragOver);
        element.addEventListener('drop', drop);
    });
}));