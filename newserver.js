var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));


var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

var serverData = require("./Globals");


function newConnection(socket) {
    var sid = socket.id;
    var players = serverData.players;
    var player = serverData.players[sid];
    socket.on('disconnect', disconnectUser);
    socket.on('keysDown', playerInput);
    if (player === undefined) {
        serverData.players[sid] = {
            'name': 'undefined',
            'position': {
                'x': Math.random() * 800,
                'y': Math.random() * 800,
            },
            'moveUp': false,
            'moveLeft': false,
            'moveDown': false,
            'moveRight': false,
            'moveSpeed': 50
        }
    }

    function playerInput(keysDown) {
        player.moveUp = keysDown.keyW;
        player.moveLeft = keysDown.keyA;
        player.moveDown = keysDown.keyS;
        player.moveRight = keysDown.keyD;
        serverData.players[sid] = player;
    }

    function disconnectUser() {
        if (serverData.players[sid]) delete serverData.players[sid];
        io.sockets.emit('disconnectUser', sid)
    }
}


function fixedUpdate() {
    var now = Date.now();
    var dt = now - serverData.lastFixedUpdate;
    dt /= 1000, lastFixedUpdate = now;
    // figure out how to use p5 vector math
    if (serverData.players.length) {
        for (var id in serverData.players) {
            var p = serverData.players[id];
            if (p.moveUp) p.position.y -= p.moveSpeed * dt;
            if (p.moveLeft) p.position.x -= p.moveSpeed * dt;
            if (serverData.players[id].moveDown) p.position.y += p.moveSpeed * dt;
            if (serverData.players[id].moveRight) p.position.x += p.moveSpeed * dt;
            serverData.players[id] = p;
        }
    }
}


function serverUpdate() {
// These are no longer needed and are redundant
//    var serverData = {};
//    serverData.playerData = players;
    io.sockets.emit('updateLoop', serverData.players);
}


var serverUpdateLoop = setInterval(serverUpdate, 1000 / serverData.serverUpdateRate);
var fixedUpdateLoop = setInterval(fixedUpdate, 1000 / serverData.fixedUpdateRate);

console.log("My socket server is running normally");
