var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
 
var players = {};

var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};

 
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
  
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    score: 0
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the star object to the new player
	socket.emit('starLocation', star);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
 
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
socket.on('playerMovement', function (movementData) {
  players[socket.id].x = movementData.x;
  players[socket.id].y = movementData.y;
  // emit a message to all players about the player that moved
  socket.broadcast.emit('playerMoved', players[socket.id]);
});
socket.on('starCollected', function () {
  players[socket.id].score += 10;
  console.log(score);
   
  star.x = Math.floor(Math.random() * 700) + 50;
  star.y = Math.floor(Math.random() * 500) + 50;
  io.emit('starLocation', star);
  io.emit('scoreUpdate', players[socket.id]);
});
});
 
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});