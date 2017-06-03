function Labyrinthe(nbCases, tailleCases) {
    var _couleur = {
        C_0 : "#FFFFFF", // couloirs
        //C_1 : "#292d35", // murs
        C_1 : "#000", // murs
        C_2 : "#4b66ff", // depart
        C_3 : "#f0f001", // arrivée
        C_4 : "#e74c3c", // inconnu
        C_5 : "#8e44ad", // inconnu
    };

    var _tailleCase = tailleCases; // La taille d'une case (en px ici)
    var _tailleMax = nbCases; // Le nombre de cases
    this.lamap = generate(_tailleMax); // Le tableau dans lequel sera stocké le laby

    this.draw = function(context) {
        var c;
        context.save();

        for(var y = 0; y < _tailleMax; y++){
            for(var x = 0; x < _tailleMax; x++){
                switch(this.lamap[x][y]){
                    case 2 :
                        c = _couleur.C_1;
                        break;
                    case 3 :
                        c = _couleur.C_2;
                        break;
                    case 4 :
                        c = _couleur.C_3;
                        break;
                    case 5 :
                        c = _couleur.C_4;
                        break;

                    default :
                        c = _couleur.C_0;
                        break;
                }
                drawSquare(_tailleCase, c, context, 0, 0);
                context.translate(_tailleCase, 0);
            }
            context.translate(-_tailleCase * (_tailleMax), _tailleCase);
        }
        context.restore();
    };

    function drawSquare(taille, couleur, ctx, x, y){
        ctx.fillStyle = couleur;
        ctx.fillRect(x, y, taille, taille);
        ctx.fill();
    }

    /**
     * Code récupéré sur http://lemon-cake.fr/generateur-labyrinthe-algo-growing-tree/
     * Algo "Growing Tree"
     * @param _tailleZone
     * @returns {Array}
     */
    function generate(_tailleZone) {
        var x, y, k, l, temp, fin, nbVoisins, dir;
        var map          = new Array(_tailleMax);
        var pile         = new Array();
        var voisins      = new Array(4);
        var maxTailleMax = _tailleMax-1;

        for (x = 0; x < _tailleMax; x++) {
            map[x] = new Array(_tailleMax);
            map[0][x] = map[x][0] = 2;
        }

        for (y = 2; y < _tailleMax; y=y+2) {
            for (x = 2; x < _tailleMax; x=x+2) {
                map[x][y-1] = 2;
                map[x-1][y] = 2;
                map[x][y] = 2;
            }
        }

        temp = Math.floor((_tailleMax-2)/2);
        x    = Math.floor(Math.random()*temp)*2+1;
        y    = Math.floor(Math.random()*temp)*2+1;

        do {
            fin = false;
            while (!fin){
                map[x][y] = 1;
                nbVoisins = 0;

                if (( y-2 >= 1)&&( map[x][y-2] != 1 ))				voisins[nbVoisins++] = 0;
                if (( y+2 <= maxTailleMax)&&( map[x][y+2] != 1 ))	voisins[nbVoisins++] = 2;
                if (( x+2 <= maxTailleMax)&&( map[x+2][y] != 1 ))	voisins[nbVoisins++] = 1;
                if (( x-2 >= 1)&&( map[x-2][y] != 1 ))				voisins[nbVoisins++] = 3;

                if (nbVoisins == 0 ) fin = true;
                else {
                    k = l = 0;
                    pile.push(x);
                    pile.push(y);
                    dir = voisins[Math.floor(Math.random()*nbVoisins)];

                    switch(dir){
                        case 0 :
                            l -= 2;
                            break;
                        case 1 :
                            k += 2;
                            break;
                        case 2 :
                            l += 2;
                            break;
                        case 3 :
                            k -= 2;
                            break;
                        default :
                            break;
                    }
                    map[x+k/2][y+l/2] = 0;
                    x += k;
                    y += l;
                }
            }
            y = pile.pop();
            x = pile.pop();
        }
        while(pile[0]);
        map[1][1] = 3;
        map[_tailleMax-1][maxTailleMax] = 4;

        return map;
    };

    this.setMap = function(map) {
        this.lamap = map;
    };
};

// Pour utiliser ce model js en front et back (nodejs)
if (typeof module !== 'undefined' && module.exports) {
    module.exports.Labyrinthe = Labyrinthe;
}