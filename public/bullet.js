
function displayBullet(bullet) {
    if (bullet !== undefined) {
        push();
        translate(bullet.position.x, bullet.position.y);
        ellipse(0, 0, bullet.size, bullet.size);
        pop();
    }
}

function updateBullet(bullet, dt) {
    if (bullet !== undefined) {
        let velocityX = (bullet.velocity.x * dt);
        let velocityY = (bullet.velocity.y * dt);
        bullet.position.x += velocityX;
        bullet.position.y += velocityY;
    }
}
