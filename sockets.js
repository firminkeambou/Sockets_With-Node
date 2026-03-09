let readyPlayersCount = 0; // // we will be changing the hardcoding of readyplayers to use room features of socket.io, if we want that refreshing the page from both players will trigger the game to start;to count how many players are ready
function listen(io) {
  io.on('connection', (socket) => {
    console.log('a user is connected with UUID', socket.id);
    socket.on('ready', () => {
      console.log(`Player with UUID ${socket.id} is ready to play!`);
      // Here you can implement logic to start the game when both players are ready
      readyPlayersCount++;
      if (readyPlayersCount % 2 === 0) {
        console.log('Both players are ready. Starting the game!');
        //broadcasting events. You can emit an event to both players to start the game
        io.emit('startGame', socket.id); // socket.id is choosen as a referee Id, the last connected user //this will send a 'startGame' event to all connected clients, different from socket.broadcast.emit('startGame') which will send the event to all clients except the one that triggered the event. In this case, since we want to start the game for both players, we use io.emit() to ensure that both players receive the 'startGame' event.
      }
    });
    socket.on('paddleMove', (paddleData) => {
      // Broadcast the paddle movement to the other player
      socket.broadcast.emit('paddleMove', paddleData); // this will send the 'opponentPaddleMove' event to all clients except the one that triggered the event, which is what we want in this case since we only want to update the opponent's paddle position for the other player
    });

    socket.on('ballMove', (ballData) => {
      // Broadcast the ball movement to the other player
      socket.broadcast.emit('ballMove', ballData); // this will send the 'ballMove' event to all clients except the one that triggered the event, which is what we want in this case since we only want to update the ball position for the other player
    });
    socket.on('ballMove', (ballData) => {
      // Broadcast the ball movement to the other player
      socket.broadcast.emit('ballMove', ballData); // this will send the 'ballMove' event to all clients except the one that triggered the event, which is what we want in this case since we only want to update the ball position for the other player
    });
    socket.on('disconnect', (reason) => {
      console.log(
        'a user disconnected for reason:',
        reason,
        '; with UUID',
        socket.id,
      );
      // Here you can implement logic to handle player disconnection, such as resetting the game or notifying the other player
      //readyPlayersCount--; // Reset the ready players count when a player disconnects
      io.emit('playerDisconnected'); // Notify all clients that a player has disconnected
    });
  });
}

module.exports = { listen };
