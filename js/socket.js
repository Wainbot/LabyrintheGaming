var username = "user";
username = prompt("What's your name?") || username;
var messages, data, datasend, users, socket;

// on load of page
window.addEventListener("load", function () {
    socket      = io.connect('http://localhost:8082', {transports: ['websocket', 'xhr-polling', 'jsonp-polling'], reconnect: false, rememberTransport: false});
    messages    = document.querySelector("#messages");
    data        = document.querySelector("#data");
    datasend    = document.querySelector("#datasend");
    users       = document.querySelector("#users");

    // Listener for send button
    datasend.addEventListener("click", function (evt) {
        sendMessage();
    });

    // detect if enter key pressed in the input field
    data.addEventListener("keypress", function (evt) {
        if (evt.keyCode == 13) {
            this.blur();
            sendMessage();
        }
    });

    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function () {
        console.log('connect');
        socket.emit('adduser', username);
    });

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (username_, data) {
        console.log('updatechat', username_, data);
        var classMeta = null;
        switch (username_) {
            case username:
                classMeta = "me";
                break;
            case "SERVER":
                classMeta = "server";
                break;
            default:
        }
        var chatMessage     = "<span " + (classMeta ? "class='"+classMeta+"' " : "") + "><b>" + username_ + ":</b> " + data + "</span>";
        messages.innerHTML += chatMessage;
        messages.scrollTop  = messages.scrollHeight;
        audioChat();
    });

    // listener, whenever the server emits 'updateplayers', this updates the username list
    socket.on('updateplayers', function (players_) {
        console.log('updateplayers', players_);

        players = {};
        users.innerHTML = "<tr><th>name</th><th>wins</th></tr>";
        for (var p in players_) {
            players[p]           = new Player(players_[p].name, players_[p].x, players_[p].y, players_[p].size, players_[p].sprite);
            players[p].score     = players_[p].score;
            players[p].countPas  = players_[p].countPas;
            players[p].direction = players_[p].direction;
            players[p].canPlay   = players_[p].canPlay;
            var userLineOfHTML   = '<tr><td class="name' + ((username == players[p].name) ? ' me' : '') + '">' + players[p].name + '</td><td class="score' + ((username == players[p].name) ? ' me' : '') + '">' + players[p].score + '</td></tr>';
            users.innerHTML     += userLineOfHTML;
        }
    });

    socket.on('updatename', function(newusername) {
        console.log('updatename', newusername);
        username = newusername;
    });

    socket.on('startgame', function(map, nbCases, tailleCases, candy_) {
        console.log('startgame', map, nbCases, tailleCases, candy_);
        timeForPlay   = 10;
        labTailleCases   = tailleCases;
        labyrinthe       = new Labyrinthe(nbCases, labTailleCases);
        labyrinthe.setMap(map);
        player           = players[username];
        candy = [];
        candy_.forEach(function(c) {
            candy.push(new Candy(c.effect, c.x, c.y, player.size));
        });
        gameStarted      = true;
        gameEndForWin    = false;
    });

    socket.on('waitingplayer', function() {
        console.log('waitingplayer');
        gameStarted = false;
    });

    socket.on('updatepos', function(name_, x_, y_, countPas_, direction_) {
        console.log('updatepos', name_, x_, y_, countPas_, direction_);
        players[name_].x         = x_;
        players[name_].y         = y_;
        players[name_].countPas  = countPas_;
        players[name_].direction = direction_;
    });

    socket.on('updatecandy', function(candy_) {
        console.log("updatecandy", candy_);
        candy = [];
        candy_.forEach(function(c) {
            candy.push(new Candy(c.effect, c.x, c.y, player.size));
        });
    });

    socket.on('endgame', function(name_) {
        console.log('endgame', name_);
        audioWin();
        gameStarted   = false;
        gameEndForWin = name_;
    });

    socket.on('candyeffect', function(effect) {
        console.log("candyeffect", effect);
        if (player.canPlay) {
            audioEffect();
            switch(effect) {
                case 1:
                    startWizz();
                    break;
                case 2:
                    startBlur();
                    break;
                case 3:
                    startOpacity();
                    break;
            }
        }
    });

    socket.on('waitingStartTimer', function(time) {
        console.log("time waiting start: ", time);
        timeForPlay = time;
    });

    function sendMessage() {
        var message = data.value;
        data.value  = "";
        socket.emit('sendchat', message);
    }
});