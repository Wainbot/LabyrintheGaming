/**
 * !!! RAPPEL !!!
 * socket.emit           : au client courant
 * socket.broadcast.emit : aux clients différents du courant
 * io.sockets.emit        : à tous les clients
 */

// We need to use the express framework: have a real web servler that knows how to send mime types etc.
var express     = require('express');
var Labyrinthe  = require('./js/models/Labyrinthe.js');
var Candy       = require('./js/models/Candy.js');

// Init globals variables for each module required
var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io')({
    'transports': ['websocket' , 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
    'log level': 2
}).listen(server);

// launch the http server on given port
server.listen(8082);

// Indicate where static files are located. Without this, no external js file, no css...
app.use(express.static(__dirname + '/'));

// routing
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var labyrinthe    = false;
var candy         = [];
var players       = {};
var gameStarted   = false;
var labNbCases    = 30;
var labTailleCase = 600 / labNbCases;
    labTailleCase -= labTailleCase / labNbCases;

io.sockets.on('connection', function (socket) {
    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', socket.username, data);
    });

    // quand un joueur se connecte
    socket.on('adduser', function (username) {
        // on sauvegarde le nom du joueur
        var newusername = username;
        while (players[newusername] != undefined) {
            newusername = username + Math.floor(Math.random() * 1000);
        }
        if (newusername != username) {
            username        = newusername;
            socket.username = username;
            socket.emit('updatename', username);
        } else {
            socket.username = username;
        }

        players[username] = { score: 0, name: username, x: labTailleCase, y: labTailleCase, countPas: 0, direction: 0, canPlay: false, size: labTailleCase, sprite: (Object.keys(players).length % 3) + 1 };

        // on informe le joueur courant qu'il s'est connecté
        socket.emit('updatechat', 'SERVER', 'You are connected.');
        // on informe les autres joueurs qu'un joueur s'est connecté
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected.');
        // on tri par score pour le classement
        sortByScore();
        // on update les players et le classement de tous les joueurs
        io.sockets.emit('updateplayers', players);

        if (Object.keys(players).length > 1) {
            if (!gameStarted) {
                var waitingStart = 10;
                var intervalWaiting = setInterval(function() {
                    io.sockets.emit("waitingStartTimer", waitingStart);

                    if (waitingStart <= 0) {
                        deleteInterval();
                        startGame();
                    }

                    waitingStart--;
                }, 1000);

                function deleteInterval() {
                    clearInterval(intervalWaiting);
                    delete intervalWaiting;
                }
            } else {
                socket.emit('startgame', labyrinthe.lamap, labNbCases, labTailleCase, candy);
                socket.emit('updatechat', 'SERVER', 'Game in progress, wait to play.');
            }
        }
    });

    socket.on('sendpos', function(name_, x_, y_, countPas_, direction_) {
        players[name_].x         = x_;
        players[name_].y         = y_;
        players[name_].countPas  = countPas_;
        players[name_].direction = direction_;
        socket.broadcast.emit('updatepos', name_, x_, y_, countPas_, direction_);
    });

    socket.on('playerwin', function(name_) {
        // on informe le joueur courant qu'il a gagné
        socket.emit('updatechat', 'SERVER', 'You win !');

        // on informe les autres joueurs du gagnant
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' win !');

        if (gameStarted == true) {
            // on incrémente le score
            players[name_].score++;
        }

        // on reset le labyrinthe
        labyrinthe  = false;

        // le game est terminé
        gameStarted = false;

        // on reset la position des players
        for (var p in players) {
            players[p].x         = labTailleCase;
            players[p].y         = labTailleCase;
            players[p].countPas  = 0;
            players[p].direction = 0;
            players[p].canPlay = false;
        }

        // on classe par ordre de wins
        sortByScore();

        // on envoi les events de mise à jour
        io.sockets.emit('endgame', name_);
        io.sockets.emit('updateplayers', players);

        var waitingStart = 10;
        var intervalWaiting = setInterval(function() {
            io.sockets.emit("waitingStartTimer", waitingStart);

            if (waitingStart <= 0) {
                deleteInterval();
                startGame();
            }

            waitingStart--;
        }, 1000);

        function deleteInterval() {
            clearInterval(intervalWaiting);
            delete intervalWaiting;
        }
    });

    socket.on('playereatcandy', function(candy_) {
        candy.forEach(function(c) {
            if (c.x == candy_.x && c.y == candy_.y) {
                candy.splice(candy.indexOf(c), 1);
            }
        });
        io.sockets.emit('updatecandy', candy);
        socket.broadcast.emit('candyeffect', candy_.effect);
    });

    // quand le joueur se deconnecte
    socket.on('disconnect', function () {
        // suppression d'un joueur quand il se deconnecte
        delete players[socket.username];

        if (Object.keys(players).length < 2) {
            labyrinthe  = false;
            gameStarted = false;
            for (var p in players) {
                players[p] = { score: players[p].score, name: players[p].name, x: labTailleCase, y: labTailleCase, countPas: 0, direction: 0, canPlay: false, size: labTailleCase, sprite: players[p].sprite };
            }
            socket.broadcast.emit('waitingplayer');
        } else {
            var countPlay = 0;
            for (var p in players) {
                if (players[p].canPlay) {
                    countPlay++;
                }
            }
            if (countPlay > 1) {
                startGame();
            } else {
                labyrinthe  = false;
                gameStarted = false;
                for (var p in players) {
                    players[p] = { score: players[p].score, name: players[p].name, x: labTailleCase, y: labTailleCase, countPas: 0, direction: 0, canPlay: false, size: labTailleCase, sprite: players[p].sprite};
                }
                socket.broadcast.emit('waitingplayer');
            }
        }

        // on envoi les events de mise à jour pour supprimer le player et actualiser les autres
        io.sockets.emit('updateplayers', players);

        // message quand un joueur se deconnecte
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });
});

function sortByScore() {
    // on classe par ordre de wins
    var playersKeys   = Object.keys(players);
    var playersSorted = {};
    playersKeys.sort(function(a, b) {
        return  players[b].score - players[a].score;
    });
    for (var i = 0; i < playersKeys.length; i++) {
        playersSorted[playersKeys[i]] = players[playersKeys[i]];
    }
    players = playersSorted;
};

function startGame() {
    // on créer un nouveau labyrinthe
    labyrinthe = new Labyrinthe.Labyrinthe(labNbCases, labTailleCase - (labTailleCase / labNbCases));

    // on créer les bonbons
    generateCandy();

    // on reset la position des players
    for (var p in players) {
        players[p].x         = labTailleCase;
        players[p].y         = labTailleCase;
        players[p].countPas  = 0;
        players[p].direction = 0;
        players[p].canPlay   = true;
    }

    // on envoi les events de mise à jour des players
    io.sockets.emit('updateplayers', players);
    // on envoi les events de demarrage du jeu
    io.sockets.emit('startgame', labyrinthe.lamap, labNbCases, labTailleCase, candy);

    // on redémarre le jeu
    gameStarted = true;
};

function generateCandy() {
    candy = [];
    var nbCandy     = 0;
    var nbMaxCandy  = Math.floor((Math.random() * 5) + 2);

    while(nbCandy < nbMaxCandy) {
        var randomX = Math.floor(Math.random() * labyrinthe.lamap.length);
        var randomY = Math.floor(Math.random() * labyrinthe.lamap.length);

        if (labyrinthe.lamap[randomX][randomY] == 0 || labyrinthe.lamap[randomX][randomY] == 1) {
            var alreadyXY = false;
            candy.forEach(function(c) {
                if (c.x == randomX * labTailleCase && c.y == randomY * labTailleCase) {
                    alreadyXY = true;
                }
            });

            if (!alreadyXY) {
                var effect = Math.floor((Math.random() * 3) + 1);
                candy.push({ effect: effect, x: randomX * labTailleCase, y: randomY * labTailleCase });
                nbCandy++;
            }
        }
    }
}