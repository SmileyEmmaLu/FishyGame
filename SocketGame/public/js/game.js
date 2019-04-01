
var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: 'rgba(111,160,209,1)',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);
var velocity = 0;

function preload() {
  this.load.image('ship', 'assets/brown.png');
  this.load.image('otherPlayer', 'assets/enemy.png');
  this.load.image('star', 'assets/fish.png');
}

function create() {
  var self = this;
  
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  
  
  this.socket.on('scoreUpdate', function (scores) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);//CHANGE HTIS TO SIZ
      }
    });
    
  });
velocity = Math.random()*-150;
  this.socket.on('starLocation', function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star').setDisplaySize(50,37);

    self.star.setVelocity(velocity, 0);
    self.physics.add.overlap(self.ship, self.star, function () {
      console.log("overlap")
      this.socket.emit('starCollected');
    }, null, self);
  });
}

function addPlayer(self, playerInfo) {
  self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
}
// function star(self, aiStar){
//   self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star').setDisplaySize(50,37);
//     self.physics.add.overlap(self.ship, self.star, function () {
//       this.socket.emit('starCollected');
//     }, null, self);
//   self.star.setVelocity(Math.random()*800, 0);
// }
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.ship && this.star) {
    if (this.cursors.left.isDown) {
      this.ship.setVelocity(-150, 0);
    } else if (this.cursors.right.isDown) {
      this.ship.setVelocity(150, 0);
    } else if(this.cursors.up.isDown) {
      this.ship.setVelocity(0,-150);
    } else if (this.cursors.down.isDown){
      this.ship.setVelocity(0,150);
    }

    console.log(this.star.x);
    console.log(this.ship.x)

      
  
    //this.physics.world.wrap(this.ship, 5);

    // emit player movements
    var x = this.ship.x;
    var y = this.ship.y;
    
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
    
    };
    if(this.star.x > 800 || this.star.y >600|| this.star.x <0 || this.star.y<0){
      this.star.setVelocity(velocity*-1,0);
    }
  }
  
}