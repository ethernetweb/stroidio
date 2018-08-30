var Victor = require('Victor');
var maths = require('./maths');
var serverData = require('./globals');

exports.newPlayer = function(sid, name) {
    playerData = {
        'lastUpdated': Date.now(),
        'name': name,
        'id': sid,
        'position': new Victor(-100000, -100000),
        'velocity': new Victor(0, 0),
        'acceleration': new Victor(0, 0),
        'rotation': 0,
        'stats': {
            'maxHealth': 5,
            'currentHealth': 0,
            'gameOver': true,
        },
        'poly': [
            new Victor(0, -24),
            new Victor(13, 15),
            new Victor(0, 7),
            new Victor(-13, 15),
        ],
        'thrustersPoly': {
            'main': [
                new Victor(0, 0),
                new Victor(9, 10),
                new Victor(0, 19),
                new Victor(-9, 10),
            ]
        },
        'thrusters': {
            'main': new Victor(0, -5),
            'left': new Victor(-3, 0),
            'right': new Victor(3, 0),
        },
        'weapons': {
            'main': {
                'position': new Victor(0, -5),
                'speed': 125,
            },
        },
        'input': {
            'accelerate': false,
            'turnLeft': false,
            'turnRight': false,
            'strafeLeft': false,
            'strafeRight': false,
            'brake': false,
            'shoot': false,
        },
        'speedLimit': 5,
        'rotationSpeed': 3,
        'breakStrength': 10,
        'shootSpeed': 500,
    };
    let p = new Player(playerData);
    return p;
}


class Player {
    constructor(data) {
        this.lastUpdated = data.lastUpdated;
        this.name = data.name;
        this.id = data.id;
        this.stats = data.stats;
        this.position = data.position;
        this.velocity = data.velocity;
        this.acceleration = data.acceleration;
        this.rotation = data.rotation;
        this.poly = data.poly;
        this.thrustersPoly = data.thrustersPoly;
        this.thrusters = data.thrusters;
        this.weapons = data.weapons;
        this.input = data.input;
        this.moveSpeed = data.moveSpeed;
        this.speedLimit = data.speedLimit;
        this.rotationSpeed = data.rotationSpeed;
        this.breakStrength = data.breakStrength;
        this.shootSpeed = data.shootSpeed;
        this.lastShot = Date.now();
        this.shootBullet = false;
        this.kills = 0;
        console.log(`created new player!`);
    }
    update(dt, dtVictor) {

        // 'input':
        //     'accelerate'
        //     'turnLeft'
        //     'turnRight'
        //     'strafeLeft'
        //     'strafeRight'
        //     'brake'
        //
        let now = Date.now();
        if (!this.stats.gameOver) {
            if (this.input.accelerate) {
                this.acceleration.copy(this.thrusters.main);
                this.acceleration.multiply(dtVictor);
                this.velocity.add(this.acceleration);
            }
            if (this.input.turnLeft) {
                let rotationAmount = -(this.rotationSpeed * dt);
                this.rotation += rotationAmount;
                this.rotatePolyBy(rotationAmount);
                this.rotateThrustersBy(rotationAmount);
                this.rotateWeapons(rotationAmount);
            }
            if (this.input.turnRight) {
                let rotationAmount = (this.rotationSpeed * dt);
                this.rotation += rotationAmount;
                this.rotatePolyBy(rotationAmount);
                this.rotateThrustersBy(rotationAmount);
                this.rotateWeapons(rotationAmount);
            }
            if (this.input.strafeLeft) {
                this.acceleration.copy(this.thrusters.left);
                this.acceleration.multiply(dtVictor);
                this.velocity.add(this.acceleration);
            }
            if (this.input.strafeRight) {
                this.acceleration.copy(this.thrusters.right);
                this.acceleration.multiply(dtVictor);
                this.velocity.add(this.acceleration);
            }
            if (this.input.break) {
                let breakStrength = this.breakStrength * dt;
                this.velocity.mix(new Victor(0, 0), breakStrength);
            }
            if (this.input.shoot && now - this.lastShot > this.shootSpeed) {
                this.shootBullet = true;

                this.lastShot = now;
            }
        }

        var mSq = this.velocity.lengthSq();
        if (mSq > this.speedLimit * this.speedLimit) {
            this.velocity.normalize();
            var limit = new Victor(this.speedLimit, this.speedLimit);
            this.velocity.multiply(limit);
        }

        this.position.add(this.velocity);
        if (
            this.position.x > serverData.limitX ||
            this.position.x < 20
        ) {
            this.position.x = maths.constrain(this.position.x, 20, serverData.limitX);
            this.velocity.x = 0;
        }
        if (
            this.position.y > serverData.limitY ||
            this.position.y < 20
        ) {
            this.position.y = maths.constrain(this.position.y, 20, serverData.limitY);
            this.velocity.y = 0;
        }
    }
    rotateThrustersBy(amount) {
        for (let pos in this.thrusters) {
            this.thrusters[pos].rotate(amount);
        }
    }
    rotatePolyBy(amount) {
        for (let i = 0; i < this.poly.length; i++) {
            this.poly[i].rotate(amount);
        }
    }
    rotateWeapons(amount) {
        for (let pos in this.weapons) {
            this.weapons[pos].position.rotate(amount);
        }
    }
    setName(name) {
        this.name = name;
    }
    spawn() {
        this.stats.gameOver = false;
        this.stats.health = this.stats.maxHealth;
        this.position.x = maths.random(0, serverData.limitX);
        this.position.y = maths.random(0, serverData.limitY);
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }
    die() {
        this.stats.gameOver = true;
    }
    damage(owner) {
        this.stats.health -= 1;
        if (this.stats.health <= 0) {
            this.die();
        }
    }

}
