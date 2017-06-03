function Player(name_, x_, y_, size_, sprite_) {
    var SPRITESHEET_URL       = "/assets/sprites/player" + sprite_ + ".png";
    var SPRITE_WIDTH          = 460.25;
    var SPRITE_HEIGHT         = 600;
    var NB_FRAMES_PER_POSTURE = 4;
    var spriteX               = 0;
    var spriteY               = 0;
    this.name                 = name_;
    this.x                    = x_;
    this.y                    = y_;
    this.size                 = size_;
    this.dx                   = 2;
    this.dy                   = 2;
    this.direction            = 'DOWN';
    this.countPas             = 0;
    this.countPasb            = 0;
    this.oDirection           = this.direction;
    this.score                = 0;
    this.canPlay              = false;
    this.sprite               = sprite_;
    var spritesheet           = new Image();
    spritesheet.src           = SPRITESHEET_URL;

    this.move = function() {
        // si le joueur gagne
        if (checkIfWin()) {
            socket.emit('playerwin', username);
        } else {
            if (38 in keys && keys[38]) { // up
                if (this.y - this.dy > 0 && checkIfCanMove('UP')) {
                    this.direction = 'UP';
                    if (this.oDirection == this.direction) {
                        this.countPasb++;
                        if (this.countPasb == 10) {
                            this.countPasb = 0;
                            this.countPas++;
                        }
                    } else {
                        this.oDirection = this.direction;
                        this.countPas   = 0;
                        this.countPasb  = 0;
                    }
                    this.y -= this.dy;
                    socket.emit('sendpos', username, this.x, this.y, this.countPas, this.direction);
                }
            }
            if (40 in keys && keys[40]) { // down
                if (this.y + this.dy < h && checkIfCanMove('DOWN')) {
                    this.direction = 'DOWN';
                    if (this.oDirection == this.direction) {
                        this.countPasb++;
                        if (this.countPasb == 10) {
                            this.countPasb = 0;
                            this.countPas++;
                        }
                    } else {
                        this.oDirection = this.direction;
                        this.countPas   = 0;
                        this.countPasb  = 0;
                    }
                    this.y += this.dy;
                    socket.emit('sendpos', username, this.x, this.y, this.countPas, this.direction);
                }
            }
            if (37 in keys && keys[37]) { // left
                if (this.x - this.dx > 0 && checkIfCanMove('LEFT')) {
                    this.direction = 'LEFT';
                    if (this.oDirection == this.direction) {
                        this.countPasb++;
                        if (this.countPasb == 10) {
                            this.countPasb = 0;
                            this.countPas++;
                        }
                    } else {
                        this.oDirection = this.direction;
                        this.countPas   = 0;
                        this.countPasb  = 0;
                    }
                    this.x -= this.dx;
                    socket.emit('sendpos', username, this.x, this.y, this.countPas, this.direction);
                }
            }
            if (39 in keys && keys[39]) { // right
                if (this.x + this.dx < w && checkIfCanMove('RIGHT')) {
                    this.direction = 'RIGHT';
                    if (this.oDirection == this.direction) {
                        this.countPasb++;
                        if (this.countPasb == 10) {
                            this.countPasb = 0;
                            this.countPas++;
                        }
                    } else {
                        this.oDirection = this.direction;
                        this.countPas   = 0;
                        this.countPasb  = 0;
                    }
                    this.x += this.dx;
                    socket.emit('sendpos', username, this.x, this.y, this.countPas, this.direction);
                }
            }

            // si le joueur mange un bonbon
            var eatCandy = checkIfEatCandy();
            if (eatCandy) {
                socket.emit('playereatcandy', eatCandy);
            }
        }
    };

    this.draw = function(ctx) {
        spriteX = (this.countPas % NB_FRAMES_PER_POSTURE) * SPRITE_WIDTH;
        switch (this.direction) {
            case 'UP':
                spriteY = SPRITE_HEIGHT * 3;
                break;
            case 'DOWN':
                spriteY = SPRITE_HEIGHT * 0;
                break;
            case 'LEFT':
                spriteY = SPRITE_HEIGHT * 2;
                break;
            case 'RIGHT':
                spriteY = SPRITE_HEIGHT * 1;
                break;
        }

        ctx.drawImage(spritesheet, spriteX, spriteY, SPRITE_WIDTH, SPRITE_HEIGHT, this.x, this.y, this.size, this.size);
    };
};