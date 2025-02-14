/**********************************************
 * GLOBAL VARIABLES & STARTUP
 **********************************************/
var currentLevel = 0;
var flowersCollected = 0;

var narrationElement, puzzleContainer, canvas, ctx, timerElement;
var animationFrameId;

/**********************************************
 * Called by the "Start the Adventure" button
 **********************************************/
function startGame() {
  // Grab references to key DOM elements
  narrationElement = document.getElementById("narration");
  puzzleContainer = document.getElementById("puzzleContainer");
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  
  // Optional timer element if you ever want it
  timerElement = document.getElementById("timer");
  
  // Hide puzzle container & canvas initially
  puzzleContainer.style.display = "none";
  canvas.style.display = "none";
  
  // Begin with Level 1 context screen
  showLevel1Context();
}

/**********************************************
 * 1) LEVEL 1: RUNNING GAME
 **********************************************/

/* 
  showLevel1Context() – narrative screen before Level 1
*/
function showLevel1Context() {
  currentLevel = 0;
  // Hide canvas & puzzle container
  canvas.style.display = "none";
  puzzleContainer.style.display = "none";
  narrationElement.style.display = "block";
  
  // Show storyline
  narrationElement.innerHTML = `
    <h2>The Adventure Begins!</h2>
    <p>Kovid is trying to reach Tars to give her some flowers in time for Valentine's Day, but there's a rocky plain to get past first!
       Survive and collect 3 flowers for her in the process :)</p>
    <button onclick="startLevel1()">Begin Level 1</button>
  `;
}

/* 
  startLevel1() – sets up the obstacle course
*/
var level1Lives = 3;
var objectCount = 0;
var nextFlowerTarget = getRandomInt(3, 8); // random range for flower spawns
var obstacles = [];
var player = null;
var level1ObstacleInterval = null;

function startLevel1() {
  currentLevel = 1;
  level1Lives = 3;
  flowersCollected = 0;
  objectCount = 0;
  nextFlowerTarget = getRandomInt(3, 8);
  obstacles = [];
  
  // Show the canvas & narration, hide puzzle container
  canvas.style.display = "block";
  puzzleContainer.style.display = "none";
  narrationElement.style.display = "block";
  if (timerElement) timerElement.style.display = "none";
  
  narrationElement.innerHTML = `
    <h3>Level 1: The Run</h3>
    <p>Lives: ${level1Lives} | Flowers: ${flowersCollected}</p>
  `;
  
  // Player object
  player = {
    x: 50,
    y: 300,    // so bottom is at y=350 (height=50)
    width: 50,
    height: 50,
    vy: 0,
    onGround: true
  };
  
  // Keyboard listener for jumping
  document.addEventListener("keydown", level1HandleKeyDown);
  
  // Spawn obstacles every 2s
  level1ObstacleInterval = setInterval(spawnObstacleLevel1, 2000);
  
  // Start the game loop
  level1GameLoop();
}

/* 
  Key handler for jumping 
  (jump is ~10% shorter with vy=-16 instead of -18)
*/
function level1HandleKeyDown(e) {
  if ((e.code === "Space" || e.code === "ArrowUp") && player.onGround && currentLevel === 1) {
    player.vy = -16;
    player.onGround = false;
  }
}

/* 
  spawnObstacleLevel1() – spawns either a flower or an obstacle 
  after a random number of spawns 
*/
function spawnObstacleLevel1() {
  objectCount++;
  
  if (objectCount === nextFlowerTarget) {
    // Spawn a flower
    let flower = {
      x: canvas.width,
      y: 350 - 50,  // bottom at 350
      width: 50,
      height: 50,
      isFlower: true
    };
    obstacles.push(flower);
    
    // Reset next target
    nextFlowerTarget = objectCount + getRandomInt(3, 8);
  } else {
    // Spawn a regular obstacle (3 random sizes)
    let baseHeight = 50;
    let type = Math.floor(Math.random() * 3); // 0,1,2
    let height = baseHeight;
    if (type === 1) {
      height = Math.round(baseHeight * 1.2); // 60
    } else if (type === 2) {
      height = Math.round(baseHeight * 1.3); // ~65
    }
    let obstacle = {
      x: canvas.width,
      y: 350 - height,
      width: 50,
      height: height,
      isFlower: false
    };
    obstacles.push(obstacle);
  }
}

/* 
  The main loop for Level 1
*/
function level1GameLoop() {
  if (currentLevel !== 1) return; // safety check
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw ground
  ctx.fillStyle = "#32CD32"; // grassy green
  ctx.fillRect(0, 350, canvas.width, canvas.height - 350);
  
  // Gravity
  player.vy += 0.5;
  player.y += player.vy;
  if (player.y + player.height >= 350) {
    player.y = 350 - player.height;
    player.vy = 0;
    player.onGround = true;
  }
  
  // Draw player (blue square)
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Update obstacles
  for (let i = 0; i < obstacles.length; i++) {
    let obj = obstacles[i];
    obj.x -= 3; // move left
    
    // Draw
    ctx.fillStyle = obj.isFlower ? "magenta" : "red";
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    
    // Collision detection
    if (isColliding(player, obj)) {
      if (obj.isFlower) {
        flowersCollected++;
        obstacles.splice(i, 1);
        i--;
        narrationElement.innerHTML = `
          <h3>Level 1: The Run</h3>
          <p>Lives: ${level1Lives} | Flowers: ${flowersCollected}</p>
        `;
        
        // If 3 flowers are collected, level is complete
        if (flowersCollected >= 3) {
          endLevel1();
          return;
        }
      } else {
        // Obstacle
        level1Lives--;
        obstacles.splice(i, 1);
        i--;
        narrationElement.innerHTML = `
          <h3>Level 1: The Run</h3>
          <p>Lives: ${level1Lives} | Flowers: ${flowersCollected}</p>
        `;
        if (level1Lives <= 0) {
          alert("Ouch! Kovid stumbled. Try again!");
          resetLevel1();
          return;
        }
      }
    }
    
    // Remove if offscreen
    if (obj.x + obj.width < 0) {
      obstacles.splice(i, 1);
      i--;
    }
  }
  
  // Continue loop
  animationFrameId = requestAnimationFrame(level1GameLoop);
}

/* 
  Called once 3 flowers are collected
*/
function endLevel1() {
  clearInterval(level1ObstacleInterval);
  cancelAnimationFrame(animationFrameId);
  document.removeEventListener("keydown", level1HandleKeyDown);
  
  narrationElement.innerHTML = "Great job! You collected 3 flowers!";
  setTimeout(showLevel2Context, 2000);
}

/* 
  If the player runs out of lives, restart Level 1
*/
function resetLevel1() {
  clearInterval(level1ObstacleInterval);
  cancelAnimationFrame(animationFrameId);
  document.removeEventListener("keydown", level1HandleKeyDown);
  startLevel1();
}

/**********************************************
 * 2) TRANSITION SCREEN BEFORE WORDLE
 **********************************************/
function showLevel2Context() {
  currentLevel = 0;
  canvas.style.display = "none";
  puzzleContainer.style.display = "none";
  narrationElement.style.display = "block";
  
  narrationElement.innerHTML = `
    <h2>You successfully crossed the rocky plains!</h2>
    <p>You reached her house, but there's a code lock! How will you get through this?</p>
    <button id="continueButton">Continue</button>
  `;
  
  document.getElementById("continueButton").addEventListener("click", function() {
    startLevel2();
  });
}

/**********************************************
 * 2) LEVEL 2: WORDLE-STYLE PUZZLE
 **********************************************/
let currentRow = 0;
let currentCol = 0;
let board = [];
const targetWord = "HARDI"; // The secret 5-letter word

function startLevel2() {
  currentLevel = 2;
  
  // Hide Level 1 canvas, show puzzle container
  canvas.style.display = "none";
  puzzleContainer.style.display = "block";
  narrationElement.style.display = "block";
  if (timerElement) timerElement.style.display = "none";
  
  narrationElement.innerHTML = `
    <h2>Level 2: The Wordle Challenge</h2>
    <p>Enter the secret word to unlock the mystical gate.</p>
  `;
  
  createWordleBoard();
  
  // Listen for user input
  document.addEventListener("keyup", handleWordleKeyUp);
}

function createWordleBoard() {
  puzzleContainer.innerHTML = "";
  board = [];
  currentRow = 0;
  currentCol = 0;
  
  for (let i = 0; i < 6; i++) {
    let row = [];
    let rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    rowDiv.style.justifyContent = "center";
    rowDiv.style.marginBottom = "5px";
    
    for (let j = 0; j < 5; j++) {
      let tile = document.createElement("div");
      tile.style.width = "50px";
      tile.style.height = "50px";
      tile.style.lineHeight = "50px";
      tile.style.margin = "2px";
      tile.style.fontSize = "24px";
      tile.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive";
      tile.style.textTransform = "uppercase";
      tile.style.color = "#000";
      tile.style.textAlign = "center";
      tile.style.border = "2px solid #ff69b4"; // hot pink
      tile.style.backgroundColor = "#fff";
      
      tile.textContent = "";
      rowDiv.appendChild(tile);
      row.push("");
    }
    
    puzzleContainer.appendChild(rowDiv);
    board.push(row);
  }
}

function handleWordleKeyUp(e) {
  if (currentLevel !== 2) return;
  
  if (e.key === "Backspace") {
    if (currentCol > 0) {
      currentCol--;
      board[currentRow][currentCol] = "";
      updateWordleTile(currentRow, currentCol, "");
    }
  } else if (e.key === "Enter") {
    // Only submit if row is full
    if (currentCol === 5) {
      submitWordleGuess();
    } else {
      alert("You must fill all 5 letters before pressing Enter!");
    }
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    if (currentCol < 5) {
      let letter = e.key.toUpperCase();
      board[currentRow][currentCol] = letter;
      updateWordleTile(currentRow, currentCol, letter);
      currentCol++;
    }
  }
}

function updateWordleTile(row, col, letter) {
  let rowDiv = puzzleContainer.children[row];
  let tile = rowDiv.children[col];
  tile.textContent = letter;
}

function submitWordleGuess() {
  let guess = board[currentRow].join("");
  
  // Color each tile
  for (let i = 0; i < 5; i++) {
    let rowDiv = puzzleContainer.children[currentRow];
    let tile = rowDiv.children[i];
    let letter = guess[i];
    let color = "#d3d3d3"; // default gray
    
    if (targetWord[i] === letter) {
      color = "#ff69b4"; // correct position
    } else if (targetWord.includes(letter)) {
      color = "#ffb6c1"; // letter in word, wrong spot
    }
    tile.style.backgroundColor = color;
    tile.style.borderColor = color;
  }
  
  if (guess === targetWord) {
    document.removeEventListener("keyup", handleWordleKeyUp);
    flowersCollected++;
    narrationElement.innerHTML = `
      <h2>Correct!</h2>
      <p>You got past the gate, and you earned another flower. Flowers Collected: ${flowersCollected}</p>
    `;
    setTimeout(showLevel3Context, 2000);
  } else {
    currentRow++;
    currentCol = 0;
    if (currentRow === 6) {
      // Out of attempts
      document.removeEventListener("keyup", handleWordleKeyUp);
      alert("Not quite right. Try again!");
      startLevel2(); // reset
    }
  }
}

/**********************************************
 * 3) TRANSITION SCREEN BEFORE MEMORY MATCH
 **********************************************/
function showLevel3Context() {
  currentLevel = 0;
  canvas.style.display = "none";
  puzzleContainer.style.display = "none";
  narrationElement.style.display = "block";
  
  narrationElement.innerHTML = `
    <h2>A Memory to Cherish</h2>
    <p>
      After unlocking the code lock, Kovid now stands before the final door—
      the door to her heart!! But it can only be opened by recalling the
      treasured memories they share. Help him match these memories!
    </p>
    <button id="continueLevel3">Continue</button>
  `;
  
  document.getElementById("continueLevel3").addEventListener("click", function() {
    startLevel3();
  });
}

/**********************************************
 * 3) LEVEL 3: MEMORY MATCH
 **********************************************/
var firstCard = null;
var secondCard = null;
var lockBoard = false;

function startLevel3() {
  currentLevel = 3;
  
  canvas.style.display = "none";
  puzzleContainer.style.display = "block";
  narrationElement.style.display = "block";
  
  narrationElement.innerHTML = `
    <h2>Level 3: Memory Match</h2>
    <p>Find all matching pairs to earn a flower!</p>
  `;
  
  createMemoryBoard();
}

function createMemoryBoard() {
  puzzleContainer.innerHTML = "";
  
  let images = [
    "assets/images/img1.png",
    "assets/images/img2.png",
    "assets/images/img3.png",
    "assets/images/img4.png",
    "assets/images/img5.png",
    "assets/images/img6.png",
    "assets/images/img7.png",
    "assets/images/img8.png"
  ];
  let cardImages = images.concat(images); // total 16
  shuffleArray(cardImages);
  
  let grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(4, 100px)";
  grid.style.gridGap = "10px";
  grid.style.justifyContent = "center";
  
  for (let i = 0; i < cardImages.length; i++) {
    let card = document.createElement("div");
    card.className = "memory-card";
    card.style.width = "100px";
    card.style.height = "100px";
    card.style.backgroundColor = "#ffcccb";
    card.style.border = "2px solid #ff69b4";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "center";
    card.style.fontFamily = "'Comic Sans MS', 'Comic Sans', cursive";
    card.style.fontSize = "24px";
    card.style.cursor = "pointer";
    
    card.dataset.image = cardImages[i];
    card.dataset.flipped = "false";
    card.textContent = "?";
    
    card.addEventListener("click", onCardClick);
    grid.appendChild(card);
  }
  
  puzzleContainer.appendChild(grid);
}

function onCardClick(e) {
  if (lockBoard) return;
  let card = e.currentTarget;
  if (card.dataset.flipped === "true") return;
  
  flipCard(card);
  
  if (!firstCard) {
    firstCard = card;
    return;
  }
  secondCard = card;
  checkForMatch();
}

function flipCard(card) {
  card.dataset.flipped = "true";
  card.textContent = card.dataset.image;
  card.style.backgroundColor = "#fff";
}

function unflipCard(card) {
  card.dataset.flipped = "false";
  card.textContent = "?";
  card.style.backgroundColor = "#ffcccb";
}

function checkForMatch() {
  let isMatch = firstCard.dataset.image === secondCard.dataset.image;
  if (isMatch) {
    firstCard.removeEventListener("click", onCardClick);
    secondCard.removeEventListener("click", onCardClick);
    resetBoard();
    checkForGameComplete();
  } else {
    lockBoard = true;
    setTimeout(() => {
      unflipCard(firstCard);
      unflipCard(secondCard);
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function checkForGameComplete() {
  let cards = document.querySelectorAll(".memory-card");
  let allFlipped = true;
  cards.forEach(card => {
    if (card.dataset.flipped === "false") {
      allFlipped = false;
    }
  });
  if (allFlipped) {
    flowersCollected++;
    narrationElement.innerHTML = `
      <h2>Congratulations!</h2>
      <p>You matched all pairs and earned a flower. 
         Flowers Collected: ${flowersCollected}</p>
    `;
    setTimeout(completeGame, 2000);
  }
}

/**********************************************
 * FINAL STEP: COMPLETE THE GAME
 **********************************************/
function completeGame() {
  // This function can call a final end screen or do whatever you like.
  // If you have a "window.showEndScreen()" in script.js, call it:
  if (typeof window.showEndScreen === "function") {
    window.showEndScreen();
  } else {
    // Otherwise, just do an alert or something else.
    alert("All levels complete! Tars awaits your answer...");
  }
}

/**********************************************
 * HELPER FUNCTIONS
 **********************************************/
function isColliding(rect1, rect2) {
  return (
    rect1.x <= rect2.x + rect2.width &&
    rect1.x + rect1.width >= rect2.x &&
    rect1.y <= rect2.y + rect2.height &&
    rect1.y + rect1.height >= rect2.y
  );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
