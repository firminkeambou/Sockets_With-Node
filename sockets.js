let readyPlayersCount = 0; // // we will be changing the hardcoding of readyplayers to use room features of socket.io, if we want that refreshing the page from both players will trigger the game to start;to count how many players are ready
function listen(io) {
  const pongNamespace = io.of('/pong'); // Create a namespace for the Pong game, this allows us to separate the Pong game logic from other potential games or features that might be added to the server in the future. By using a namespace, we can ensure that events related to the Pong game are only handled within that specific namespace, which helps to keep our code organized and maintainable.
  //many namespaces can be created for different games or features, and clients can connect to the specific namespace they are interested in. This way, we can have multiple games or features running on the same server without interference.
  //for example // tetrisNamespace = io.of('/tetris'); // Create a namespace for the Tetris game
  pongNamespace.on('connection', (socket) => {
    let room; // Declare the room variable here so that it can be accessed in the disconnect event handler, this allows us to manage the player's connection to the room more effectively and ensure that we can properly handle disconnections without losing track of which room the player was in.
    console.log('a user is connected with UUID', socket.id);
    socket.on('ready', () => {
      room = 'room' + Math.floor(readyPlayersCount / 2); // Create a room name based on the number of ready players, this will create a new room for every two players that are ready. For example, the first two players will be assigned to 'room0', the next two players will be assigned to 'room1', and so on.
      socket.join(room); // Join the socket to the room, this allows us to group players together and manage their interactions more effectively. By joining a room, we can easily broadcast events to all players in that room without affecting other players in different rooms.
      // pongNamespace.adapter.rooms.get(socket.id); // Get the room that the socket is currently in
      console.log(
        `Player with UUID ${socket.id} is ready to play! in room ${room}`,
      );
      // Here you can implement logic to start the game when both players are ready
      readyPlayersCount++;
      if (readyPlayersCount % 2 === 0) {
        console.log('Both players are ready. Starting the game!');
        //broadcasting events. You can emit an event to both players to start the game
        pongNamespace.in(room).emit('startGame', socket.id); // this will send the 'startGame' event to all clients in the specified room, which is what we want in this case since we want to start the game for both players in that room. The socket.id is included as data in the event, which can be used by the clients to identify which player triggered the event and potentially assign roles or positions in the game based on that information.
      }
    });
    socket.on('paddleMove', (paddleData) => {
      // Broadcast the paddle movement to the other player
      socket.to(room).emit('paddleMove', paddleData); // this will send the 'paddleMove' event to all clients in the specified room, which is what we want in this case since we only want to update the paddle position for the other player
    });

    socket.on('ballMove', (ballData) => {
      // Broadcast the ball movement to the other player
      socket.to(room).emit('ballMove', ballData); // this will send the 'ballMove' event to all clients in the specified room, which is what we want in this case since we only want to update the ball position for the other player
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
      pongNamespace.emit('playerDisconnected'); // Notify all clients that a player has disconnected
      socket.leave(room); // Remove the socket from the room, this ensures that the disconnected player is no longer part of the game and won't receive any further events related to that room. By leaving the room, we can also manage the game state more effectively and prevent any potential issues that might arise from a player disconnecting during a game.
    });
  });
}

module.exports = { listen };
