// Wait until the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get references to the key elements on your page
    const startGameBtn = document.getElementById("startGameBtn");
    const gameContainer = document.getElementById("gameContainer");
    const endScreen = document.getElementById("endScreen");
    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");
  
    // When the "Start the Adventure" button is clicked:
    startGameBtn.addEventListener("click", () => {
      // Hide the start button (and any welcome content)
      startGameBtn.style.display = "none";
      // Show the game container so the canvas appears
      gameContainer.style.display = "block";
      
      // Start the game logic (this function should be defined in game.js)
      startGame();
    });
  
    // Event listener for when Tars accepts being Kovid's valentine
    yesBtn.addEventListener("click", () => {
      alert("Yay! Tars, you made the adventure complete!");
      // You can add further actions here, like playing a celebratory animation.
    });
  
    // Event listener for when Tars declines
    noBtn.addEventListener("click", () => {
      alert("Oh no! The adventure isn’t over yet... Kovid will keep trying!");
      // Optionally, you could add a fun mechanic here or allow a retry.
    });
  
    // This global function will be called by the game logic when the game ends.
    // It hides the game area and shows the end screen with the final invitation.
    window.showEndScreen = function() {
      gameContainer.style.display = "none";
      endScreen.style.display = "block";
    };
  });
  