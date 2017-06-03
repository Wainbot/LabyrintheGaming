function Candy(effect_, x_, y_, size_) {
    this.effect               = effect_;
    this.x                    = x_;
    this.y                    = y_;
    this.size                 = size_;
    var SPRITESHEET_URL       = "/assets/sprites/candy" + this.effect + ".png";
    var spritesheet           = new Image();
    spritesheet.src           = SPRITESHEET_URL;

    this.draw = function(ctx) {
        ctx.drawImage(spritesheet, 0, 0, 500, 500, this.x, this.y, this.size, this.size);
    };
};