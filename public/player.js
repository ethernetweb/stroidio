function displayPlayer(player) {
    push();
    translate(player.position.x, player.position.y);
    fill(255);
    if (player.input.accelerate) {
        push();
        rotate(player.rotation);
        fill('#ffffa0');
        drawPoly(player.thrustersPoly.main);
        pop();
        if (!engineFireSound.isPlaying()) {
            engineFireSound.loop();
        }
    } else {
        if (engineFireSound.isPlaying()) engineFireSound.stop();
    }

    drawPoly(player.poly);
    displayPlayerHealth(player);
    textSize(10);
    text(`${player.name}`, 0, -38);
    pop();
}

function updatePlayer(player, dt) {
    // 'input':
    //     'accelerate'
    //     'turnLeft'
    //     'turnRight'
    //     'strafeLeft'
    //     'strafeRight'
    //     'brake'
    //
    let dtVictor = new Victor(dt, dt);
    if (!player.stats.gameOver) {

        if (player.input.accelerate) {
            player.acceleration.copy(player.thrusters.main);
            player.acceleration.multiply(dtVictor);
            player.velocity.add(player.acceleration);
        }
        if (player.input.turnLeft) {
            let rotationAmount = -(player.rotationSpeed * dt);
            player.rotation += rotationAmount;
            rotatePolyBy(rotationAmount);
            rotateThrustersBy(rotationAmount);
        }
        if (player.input.turnRight) {
            let rotationAmount = (player.rotationSpeed * dt);
            player.rotation += rotationAmount;
            rotatePolyBy(rotationAmount);
            rotateThrustersBy(rotationAmount);
        }
        if (player.input.strafeLeft) {
            player.acceleration.copy(player.thrusters.left);
            player.acceleration.multiply(dtVictor);
            player.velocity.add(player.acceleration);
        }
        if (player.input.strafeRight) {
            player.acceleration.copy(player.thrusters.right);
            player.acceleration.multiply(dtVictor);
            player.velocity.add(player.acceleration);
        }
        if (player.input.break) {
            let breakStrength = player.breakStrength * dt;
            player.velocity.mix(new Victor(0, 0), breakStrength);
        }
    }

    var mSq = player.velocity.lengthSq();
    if (mSq > player.speedLimit * player.speedLimit) {
        player.velocity.normalize();
        var limit = new Victor(player.speedLimit, player.speedLimit);
        player.velocity.multiply(limit);
    }
    player.position.add(player.velocity);

    function rotateThrustersBy(amount) {
        for (let pos in player.thrusters) {
            player.thrusters[pos].rotate(amount);
        }
    }

    function rotatePolyBy(amount) {
        for (let i = 0; i < player.poly.length; i++) {
            player.poly[i].rotate(amount);
        }
    }

    function rotateWeapons(amount) {
        for (let pos in player.weapons) {
            player.weapons[pos].position.rotate(amount);
        }
    }
}


function displayPlayerData(player) {
    push();
    textAlign(LEFT, BOTTOM);
    let speed = player.velocity.length();
    speed *= 10;
    text(`m / s: ${Math.floor(speed)}`, 10, height - 5);
    pop();
}

function displayPlayerHealth(player) {
    push();
    translate(0, 28);
    let mappedHealth = map(player.stats.health, player.stats.maxHealth, 0, 36, 0, true);
    fill(255, 0, 0);
    rect(-36 / 2, 0, 36, 6);
    fill(0, 255, 0);
    rect(-36 / 2, 0, mappedHealth, 6);
    pop();
}

function playShootSoundAtPlayer(id) {
    let pid = players[id];
    // if (players[id] !== undefined) {
    //     let psid = players[socket.id];
    //     if (psid !== undefined) {
    //         let d = dist(psid.position.x, psid.position.y, pid.position.x, pid.position.y);
    //         let mapVolume = map(d, 0, 500, 0.5, 0);
    //         shootSound.setVolume(mapVolume);
    //     } else {
    //     shootSound.setVolume(0.5);
    // }
    shootSound.play();
    // }

}

function playerDied(data) {
    if (players[data.id] !== undefined) {
        if (data.id === socket.id) {
            youDied(data);
        }
    }
    var kill = document.createElement("kill");
    kill.innerHTML = `${data.killer} killed ${data.killed}`;
    document.getElementById('kill-feed').appendChild(kill);
    setTimeout(function() {
        removeKillFromFeed(kill)
    }, 5000);

}

function removeKillFromFeed(kill) {
    kill.remove();
}
