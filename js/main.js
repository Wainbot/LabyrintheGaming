var canvas, ctx, w, h, players, player, labyrinthe, fps, canPlay, frameCount, time, lastTime, labTailleCases, keys,
    gameEndForWin, timeForPlay, isPlaying, chatAudio, winAudio, candy;

// Entrée du jeu
window.addEventListener('load', function() {
    canvas        = document.querySelector("#mon_canvas");
    ctx           = canvas.getContext("2d");
    canvas.width  = 600;
    canvas.height = 600;
    w             = canvas.width;
    h             = canvas.height;
    gameStarted   = false;
    gameEndForWin = false;
    canPlay       = false;
    players       = {};
    candy         = [];
    frameCount    = 0;
    time          = 20;
    timeForPlay   = 15;
    isPlaying     = function(audio) {
        return !audio.paused;
    };
    chatAudio     = document.getElementById('chat_audio');
    winAudio      = document.getElementById('win_audio');
    keys          = {
        37: false,
        38: false,
        39: false,
        40: false
    };

    if (!(chatAudio.play instanceof Function)){
        chatAudio = document.getElementById('chat_audio_ie8');
        isPlaying = function(audio) {return audio.playState==2;}
    }
    if (!(winAudio.play instanceof Function)){
        winAudio = document.getElementById('chat_audio_ie8');
        isPlaying = function(audio) {return audio.playState==2;}
    }

    requestAnimationFrame(mainLoop);
});

// Boucle principale
function mainLoop(time) {
    ctx.clearRect(0, 0, w, h);
    ctx.textBaseline = "hanging";
    ctx.fillStyle    = '#FFF';
    ctx.font         = "20px 'Press Start 2P'";

    // jeu qui n'est pas lancé
    if (!gameStarted) {
        // si il y a un gagnant
        if (gameEndForWin) {
            ctx.fillText(gameEndForWin + " win !", 250 - (gameEndForWin.length * 10), 160);
        }

        // si il y a moins de 2 joueurs
        //if (Object.keys(players).length < 2) {
            ctx.fillText("Waiting for players", 110, 220);
        //} else {
        //    ctx.fillText("Next game started after " + timeForPlay + "s", 35, 240);
        //    ctx.fillText(Object.keys(players).length + " players", 220, 280);
        //}
    } else {
        // on dessine le labyrinthe
        labyrinthe.draw(ctx);
        // on dessine les bonbons
        candy.forEach(function(c) {
            c.draw(ctx);
        });

        if (player.canPlay) {
            // on peut bouger le perso
            document.addEventListener("keydown", keydownEvent, true);
            document.addEventListener("keyup", keyupEvent, true);

            // on fait bouger le player puis on le dessine
            player.move();
            player.draw(ctx);
        } else {
            // on ne peut pas bouger le perso
            document.removeEventListener("keydown", keydownEvent, true);
            document.removeEventListener("keyup", keyupEvent, true);

            ctx.font = "8px 'Press Start 2P'";
        }

        // on dessine tous les players
        for (var p in players) {
            if (p != username) {
                if (players[p].canPlay) {
                    players[p].draw(ctx);
                }
            }
        }
    }

    measureFPS(time);

    window.requestAnimationFrame(mainLoop);
};