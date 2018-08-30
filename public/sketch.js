var socket;
var timeout = 3000;
var players = {};
var bullets = [];
var backgroundImage;
var shootSound;
var ping = 0;
var pageNeedsReload = false;
var serverStartStamp = 0;

function setup() {
    socket = io();
    socket.on('disconnectUser', disconnectUser);
    socket.on('updateLoop', serverUpdate);
    socket.on('playerPlayShootSound', playShootSoundAtPlayer); // player.js
    socket.on('nameVerified', nameVerification);
    socket.on('updatedBulletList', setBullets);
    socket.on('playerDied', playerDied); // player.js
    socket.on('disconnect', serverDisconnected);
    createCanvas(windowWidth, windowHeight);
}

function setBullets(bulletList) {
    bullets = bulletList;
}



function disconnectUser(id) {
    delete players[id];
    console.log(`user ${id} disconnected`);
}

function preload() {
    backgroundImage = loadImage('assets/images/space-image.png');
    shootSound = loadSound('assets/sounds/shoot.wav');
    engineFireSound = loadSound('assets/sounds/engine-fire.wav');
}


function draw() {
    background(51);
    checkUserInput(socket.id);
    textAlign(CENTER, TOP);
    fill(255);
    fixedUpdate();
    push();
    if (players[socket.id] !== undefined) {
        let p = players[socket.id];
        translate(-p.position.x, -p.position.y);
        translate(width / 2, height / 2);
        image(backgroundImage, 0, 0);
    } else {
        translate(-(backgroundImage.width / 2) + (width / 2), -(backgroundImage.height / 2) + (height / 2));
        image(backgroundImage, 0, 0);
    }
    for (var i = 0; i < bullets.length; i++) {
        displayBullet(bullets[i]);
    }
    for (let id in players) {
        displayPlayer(players[id]);
    }
    pop();
    showPublicServerData();
    if (players[socket.id] !== undefined) {
        displayPlayerData(players[socket.id]);
    }
}

function showPublicServerData() {
    push();
    textAlign(LEFT, TOP);
    translate(10, 5);
    text(`users connected: ${Object.keys(players).length}`, 0, 0);
    translate(0, 15);
    text(`latency: ${ping}`, 0, 0);
    pop();
}

function serverUpdate(data) {
    if (serverStartStamp === 0) {
        serverStartStamp = data.serverStartStamp;
    }
    if (serverStartStamp !== data.serverStartStamp && !pageNeedsReload) {
        serverRestarted();
    }
    if (pageNeedsReload) {
        return;
    }
    ping = Date.now() - data.serverTimeMS;
    if (data.players !== undefined) {
        var playerData = data.players;
        if (playerData[socket.id] !== undefined && players[socket.id] !== undefined) {
            playerData[socket.id].inputs = players[socket.id].inputs;
        }
        for (let id in playerData) {
            let p = playerData[id];
            p.position = Victor.fromObject(p.position);
            p.velocity = Victor.fromObject(p.velocity);
            p.acceleration = Victor.fromObject(p.acceleration);
            for (let i = 0; i < p.poly.length; i++) {
                p.poly[i] = Victor.fromObject(p.poly[i]);
            }
            for (var t in p.thrusters) {
                p.thrusters[t] = Victor.fromObject(p.thrusters[t]);
            }
            players[id] = playerData[id];
        }
    }
    if (data.bullets !== undefined) {
        bullets = data.bullets;
    }
    checkBulletRemoval();
}

function checkBulletRemoval() {
    for (let id in bullets) {
        if (bullets[id].remove) {
            delete bullets[id];
        }
    }
}

var lastFixedUpdate = Date.now();

function fixedUpdate() {
    var now = Date.now();
    var dt = now - lastFixedUpdate;
    dt /= 1000;
    lastFixedUpdate = now;
    for (var i = 0; i < bullets.length; i++) {
        updateBullet(bullets[i], dt);
    }
    for (let id in players) {
        updatePlayer(players[id], dt);
        if (now - players[id].lastUpdated > timeout) disconnectUser(id);
    }
}

function drawPoly(poly) {
    beginShape();
    for (let i = 0; i < poly.length; i++) {
        let pos = poly[i];
        vertex(pos.x, pos.y);
    }
    endShape();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
var playerName = '';

function checkCanPlay() {
    if (!pageNeedsReload) {
        playerName = document.getElementById('player-name-input').value;
        socket.emit('checkName', playerName);
    }
}
function youDied(data) {
    document.getElementById('main-wrapper').style.display = "block";
    let deathMessage = document.getElementById('death-message');
    deathMessage.style.opacity = 1;
    deathMessage.innerHTML = `you were killed by ${data.killer}`;

}
function serverDisconnected() {
    let errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = "Disconnected... Trying to reconnect.";
    errorMessage.style.opacity = 1;
    document.getElementById('player-name-input').style.display = "none";
    document.getElementById('start-button').style.display = "none";
    document.getElementById('main-wrapper').style.display = "block";
}
function serverRestarted() {
    pageNeedsReload = true;
    socket.close();
    let errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = "Server restarted, please refresh page";
    errorMessage.style.opacity = 1;
    document.getElementById('player-name-input').style.display = "none";
    document.getElementById('start-button').style.display = "none";
    document.getElementById('main-wrapper').style.display = "block";
    document.getElementById('death-message').style.opacity = 0;

}

function nameVerification(bool) {
    if (!pageNeedsReload) {
        let errorMessage = document.getElementById('error-message');
        if (bool) {
            // name is taken, error, select other name
            errorMessage.innerHTML = "Nickname taken!";
            errorMessage.style.opacity = 1;
        } else {
            // name is not taken, request spawn.
            document.getElementById('main-wrapper').style.display = "none";
            document.getElementById('death-message').style.opacity = 0;
            errorMessage.style.opacity = 0;
            socket.emit('spawn', playerName);
        }
    }
}
