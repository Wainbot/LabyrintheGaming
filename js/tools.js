function measureFPS(newTime){
    if (lastTime === undefined) {
        lastTime = newTime;
        return;
    }

    var diffTime = newTime - lastTime;

    if (diffTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = newTime;
    }

    ctx.fillStyle = '#FFF';
    ctx.font = "8px 'Press Start 2P'";
    ctx.shadowColor = "transparent";
    ctx.fillText('FPS: ' + ((fps) ? fps : '??'), w - 70, h - 12);

    frameCount++;
};

function keydownEvent(evt) {
    keys[evt.keyCode] = true;
};

function keyupEvent(evt) {
    keys[evt.keyCode] = false;
};

function checkIfCanMove(direction) {
    var caseX  = Math.floor((player.x + (player.size / 2)) / player.size);
    var caseY  = Math.floor((player.y + (player.size / 2)) / player.size);

    switch(direction) {
        case 'UP':
            caseY--;
            if ((caseY * player.size + player.size == player.y || caseY * player.size + player.size > player.y - player.dy) && labyrinthe.lamap[caseX][caseY] == 2) {
                return false;
            }
            break;
        case 'DOWN':
            caseY++;
            if (labyrinthe.lamap.length * player.size <= player.y + player.size + player.dy) {
                return false;
            }
            if ((caseY * player.size == player.y + player.size || caseY * player.size < player.y + player.size + player.dy) && labyrinthe.lamap[caseX][caseY] == 2) {
                return false;
            }
            break;
        case 'LEFT':
            caseX--;
            if ((caseX * player.size + player.size == player.x || caseX * player.size + player.size > player.x - player.dx) && labyrinthe.lamap[caseX][caseY] == 2) {
                return false;
            }
            break;
        case 'RIGHT':
            caseX++;
            if (labyrinthe.lamap.length * player.size <= player.x + player.size + player.dx) {
                return false;
            }
            if ((caseX * player.size == player.x + player.size || caseX * player.size < player.x + player.size + player.dx) && labyrinthe.lamap[caseX][caseY] == 2) {
                return false;
            }
            break;
    }

    return true;
};

function checkIfEatCandy() {
    var candyFind = false;
    var caseX     = Math.floor((player.x + (player.size / 2)) / player.size);
    var caseY     = Math.floor((player.y + (player.size / 2)) / player.size);

    candy.forEach(function(c) {
        var candyX = Math.round(c.x / player.size);
        var candyY = Math.round(c.y / player.size);

        if (candyX == caseX && candyY== caseY) {
            candyFind = c;
        }
    });

    return candyFind;
};

function checkIfWin() {
    var caseX  = Math.floor((player.x + (player.size / 2)) / player.size);
    var caseY  = Math.floor((player.y + (player.size / 2)) / player.size);

    return labyrinthe.lamap[caseX][caseY] == 4;
};

function audioChat() {
    chatAudio.currentTime = 0;
    chatAudio.play();
};

function audioWin() {
    winAudio.currentTime = 0;
    winAudio.play();
};

function audioEffect() {
    effectAudio.currentTime = 0;
    effectAudio.play();
};

function startWizz() {
    var nbItv  = 300;
    var delta  = 10;
    var el     = document.getElementById("mon_canvas");
    el.className = "effect-wizz";
    setInterval(function() {
        el.className = "";
    }, 3000);
};

function startBlur() {
    var el = document.getElementById("mon_canvas");
    el.style.filter = "blur(15px)";
    setInterval(function() {
        el.style.filter = "none";
    }, 3000);
};

function startOpacity() {
    var el = document.getElementById("mon_canvas");
    el.style.opacity = "0.2";
    setInterval(function() {
        el.style.opacity = "1";
    }, 3000);
};

// From EDX
function calcDistanceToMove(delta, speed) {
    return (speed * delta) / 1000;
};