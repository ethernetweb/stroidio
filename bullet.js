var Victor = require('Victor');
// var maths = require('./maths');
let bulletId = 0;
exports.newBullet = function(data) {
    data.id = bulletId;
    bulletId ++;
    let b = new Bullet(data);
    return b;
}

class Bullet {
    constructor(data) {
        this.id = data.id;
        this.owner = data.owner;
        this.position = data.position;
        this.velocity = data.velocity;
        this.aliveTime = data.aliveTime;
        this.size = 6;
        this.remove = false;
        this.timeCreated = Date.now();
    }
    update(dt, dtVictor) {
        if (Date.now() - this.timeCreated > this.aliveTime) {
            this.remove = true;
            return;
        }
        let velocity = Victor.fromObject(this.velocity);
        velocity.multiply(dtVictor);
        this.position.add(velocity);
        if (this.position.x < 0 || this.position.y < 0 || this.position.x > 3840 || this.position.y > 2160) {
            this.remove = true;
        }
    }
}
