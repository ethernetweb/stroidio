
function checkUserInput(id) {
    if (players[id] !== undefined) {
        let input = players[id].input;
        if (keyIsDown(38) || keyIsDown(87)) {
            // 38 = arrow up
            // 87 = W
            input.accelerate = true;
        } else {
            input.accelerate = false;
        }
        if (keyIsDown(37) || keyIsDown(65)) {
            // 37 = arrow left
            // 65 = A
            input.turnLeft = true;
        } else {
            input.turnLeft = false;
        }
        if (keyIsDown(39) || keyIsDown(68)) {
            // 39 = arrow right
            // 68 = D
            input.turnRight = true;
        } else {
            input.turnRight = false;
        }
        if (keyIsDown(40) || keyIsDown(83)) {
            // 40 = arrow down
            // 83 = S
            input.break = true;
        } else {
            input.break = false;
        }
        if (keyIsDown(81)) {
            // 81 = Q
            input.strafeLeft = true;
        } else {
            input.strafeLeft = false;
        }
        if (keyIsDown(69)) {
            // 69 = Q
            input.strafeRight = true;
        } else {
            input.strafeRight = false;
        }
        if (keyIsDown(32)) {
            // 32 = Space bar
            input.shoot = true;
        } else {
            input.shoot = false;
        }
        socket.emit('keysDown', input);
    }

}

function keyPressed(event) {
    console.log(`keyCode: ${event.keyCode}`);
    if (event.keyCode === 13) {
        // ENTER PRESSED
        checkCanPlay();
    }
}
