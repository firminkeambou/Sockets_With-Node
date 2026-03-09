// Canvas Related
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
//opening a websocket connection to the server on a specific port, the URL should match the one defined in the server.js file
const socket = io('http://localhost:8200/');

//const socket = io(); // Connect to the same server that served the webpage, which will automatically connect to the correct URL and port for the WebSocket connection. This way, we can avoid hardcoding the URL and port in the client-side code, making it more flexible and easier to deploy in different environments without needing to change the client-side code.
// defining who is te referee
let isReferee = false; // by default, there is no referee before the beginning of the game
let paddleIndex = 0;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [225, 225]; // keeping X coodinates of the two paddles at the very beginning of the game respectively the paddle at the bottom of the screen and the paddle at the top of the screen

let trajectoryX = [0, 0]; // direction of the ball, trajectory for both the computer and the player
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;
//let computerSpeed = 4; no longer neeeded as we are introducing the second player rather than the computer

// Score for Both Players
let score = [0, 0]; // score for the player/referee, then the computer (opponent)

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = 'white';
  context.font = '32px Courier New';
  context.fillText('Waiting for opponent...', 20, canvas.height / 2 - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Bottom Paddle (payer)== placing the player's paddle at the bottom of the screen
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle(computer or another player) == placing the opponent's paddle at the top of the screen
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = '32px Courier New';
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;
  socket.emit('ballMove', { xPosition: ballX, yPosition: ballY, score }); // emitting the new position of the ball to the server, so that the server can broadcast this information to the other player and update the position of the ball accordingly
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection; // ballDirection=1 or negative 1(-1)
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
  // emmiting the new position of the ball to the server, so that the server can broadcast this information to the other player and update the position of the ball accordingly
  socket.emit('ballMove', { xPosition: ballX, yPosition: ballY, score });
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      // Reset Ball, Increase Computer Difficulty, add to Player Score
      /* if (computerSpeed < 6) {
        computerSpeed += 0.5;
      } */
      ballReset();
      score[0]++;
    }
  }
}

// Computer Movement
/*
//no longer needed as we expect a second player
 function computerAI() {
  if (playerMoved) {
    if (paddleX[1] + paddleDiff < ballX) {
      paddleX[1] += computerSpeed;
    } else {
      paddleX[1] -= computerSpeed;
    }
    if (paddleX[1] < 0) {
      paddleX[1] = 0;
    } else if (paddleX[1] > width - paddleWidth) {
      paddleX[1] = width - paddleWidth;
    }
  }
} */

// Called Every Frame
function animate() {
  //computerAI();
  if (isReferee) {
    ballMove();
    ballBoundaries();
  }
  renderCanvas();

  window.requestAnimationFrame(animate); // replace setInterval(animate, 1000 / 60) with window.requestAnimationFrame(animate) to ensure that the animation runs smoothly at the optimal frame rate for the user's device, which can help improve performance and reduce CPU usage compared to using setInterval() with a fixed frame rate. Additionally, requestAnimationFrame() will automatically pause the animation when the user navigates to a different tab or minimizes the browser window, which can further improve performance and reduce unnecessary resource usage.
}

// Load Game, Reset Everything
function loadGame() {
  createCanvas();
  renderIntro(); // needed for multiplayers using sockets
  socket.emit('ready'); // emitting ready event called "ready" to the server, so that the server can know that this player is ready to play and can start the game when both players are ready
}

// Start Game, Reset Everything
function startGame() {
  paddleIndex = isReferee ? 0 : 1; // The referee will control the bottom paddle (player 1), while the other player will control the top paddle (player 2);
  window.requestAnimationFrame(animate);
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > width - paddleWidth) {
      paddleX[paddleIndex] = width - paddleWidth;
    }
    socket.emit('paddleMove', { xPosition: paddleX[paddleIndex] }); // emitting the new position of the paddle to the server, so that the server can broadcast this information to the other player and update the position of the opponent's paddle accordingly
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load
loadGame();

socket.on('connect', () => {
  console.log('connected as ....', socket.id);
});
socket.on('startGame', (refereeId) => {
  console.log(
    'Received startGame event from server with refereeId:',
    refereeId,
  );
  // You can use the refereeId to determine which player is which, if needed
  isReferee = socket.id === refereeId; // The player whose socket ID matches the refereeId is the referee
  startGame(); // Start the game when the 'startGame' event is received; at this moment, the positions of both players are not shared among players
});
socket.on('paddleMove', (paddleData) => {
  // Update the opponent's paddle position based on the data received from the server
  const opponentPaddleIndex = 1 - paddleIndex; // The opponent's paddle index is the opposite of the current player's paddle index (0 or 1)
  paddleX[opponentPaddleIndex] = paddleData.xPosition; // Update the position of the opponent's paddle (the one that is not controlled by the current player)
});
socket.on('ballMove', (ballData) => {
  // Update the ball position based on the data received from the server
  ballX = ballData.xPosition;
  ballY = ballData.yPosition;
  score = ballData.score; // Update the score based on the data received from the server, so that both players have the same score information
});
