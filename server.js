var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));


var socket = require('socket.io');
var io = socket(server);

var Victor = require('victor');
var Player = require('./player');
var serverData = require('./globals');
var maths = require('./maths');
var bulletManager = require('./bullet');
var c2d = require('./p5.collide2d');
var totalPlayers = 0;
io.sockets.on('connection', newConnection);
function newConnection(socket) {
    totalPlayers ++;
    var sid = socket.id;
    var players = serverData.players;
    var player;
    socket.on('disconnect', disconnectUser);
    socket.on('checkName', verifyName);
    socket.on('keysDown', playerInput);
    socket.on('spawn', spawnPlayer);

    function spawnPlayer(name) {
        if (name === '') {
            name = `player#${totalPlayers}`;
        }
        if (player === undefined) {

            serverData.players[sid] = Player.newPlayer(sid, name);
            serverData.players[sid].spawn();
            player = serverData.players[sid];
        } else {
            serverData.players[sid].setName(name);
            serverData.players[sid].spawn();
        }
    }

    function playerInput(keysDown) {
        if (player !== undefined) player.input = keysDown;
    }

    function disconnectUser() {
        if (serverData.players[sid]) delete serverData.players[sid];
        io.sockets.emit('disconnectUser', sid)
    }

    function verifyName(name) {
        if (player !== undefined) {
            if (!serverData.players[sid].stats.gameOver) return;
        }
        let nameTaken = false;
        if (name !== '') {
            for (let id in players) {
                if (sid !== id && players[id].name === name) {
                    nameTaken = true;
                    break;
                }
            }
        }
        socket.emit('nameVerified', nameTaken);
    }

}

function fixedUpdate() {
    var now = Date.now();
    var dt = now - serverData.lastFixedUpdate;
    dt /= 1000;
    let dtVictor = new Victor(dt, dt);
    serverData.lastFixedUpdate = now;
    // figure out how to use p5 vector math
    for (let id in serverData.players) {
        let p = serverData.players[id];
        p.update(dt, dtVictor);
        if (p.shootBullet) {
            let position = Victor.fromObject(p.position);
            position.add(p.thrusters.main);
            let velocity = Victor.fromObject(p.weapons.main.position);
            velocity.multiply(new Victor(p.weapons.main.speed, p.weapons.main.speed));
            bData = {
                'position': position,
                'velocity': velocity,
                'owner': p.id,
                'aliveTime': 3000,
            }
            io.sockets.emit('playerPlayShootSound', p.id);
            let bullet = bulletManager.newBullet(bData);
            serverData.bullets.push(bullet);
            p.shootBullet = false;
            io.sockets.emit('updatedBulletList', serverData.bullets);
        }
        p.lastUpdated = now;
    }
    for (let i = serverData.bullets.length - 1; i >= 0; i--) {
        let b = serverData.bullets[i];
        if (b.remove) {
            serverData.bullets.splice(i, 1);
            continue;
        }
        b.update(dt, dtVictor);
        for (var id in serverData.players) {
            let p = serverData.players[id];
            if (p.id !== b.owner) {
                let poly = [];
                for (var j = 0; j < p.poly.length; j++) {
                    poly[j] = p.poly[j].clone();
                }
                for (let k = 0; k < poly.length; k++) {
                    poly[k].x += p.position.x;
                    poly[k].y += p.position.y;
                }
                let hit = c2d.collideCirclePoly(b.position.x, b.position.y, b.size, poly, true);
                if (hit) {
                    b.remove = true;
                    p.damage(b.owner);
                    if (p.stats.gameOver) {
                        let killer = serverData.players[b.owner];
                        killer.kills ++;
                        let ownerName = killer.name;
                        let deathData = {
                            'id': p.id,
                            'killed': p.name,
                            'killer': ownerName,
                        }
                        io.sockets.emit('playerDied', deathData);
                    }
                }
            }
        }
    }

}

function serverUpdate() {
    serverData.serverTimeMS = Date.now();
    io.sockets.emit('updateLoop', serverData);
    checkBulletRemoval();
}

function checkBulletRemoval() {
    for (let i = serverData.bullets.length - 1; i >= 0; i--) {
        if (serverData.bullets[i].remove) {
            serverData.bullets.slice(i, 1);
        }
    }
}
var fixedUpdateLoop = setInterval(fixedUpdate, 1000 / serverData.fixedUpdateRate);
var serverUpdateLoop = setInterval(serverUpdate, 1000 / serverData.serverUpdateRate);
console.log("My socket server is running normally");
