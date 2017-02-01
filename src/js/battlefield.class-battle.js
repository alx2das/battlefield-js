function Battle(fields, battlefield, htmlSelector) {
    if (!(battlefield instanceof Battlefield))
        throw new Error('Invalid Battlefield object in the construct Battle');

    GameUI.apply(this, arguments);

    this.fields = fields;
    this.battlefield = battlefield;

    this._lsKill = [];                          // последнее попадание компьютером
    this._lsShot = [];                          // список точек доступных для выстрела
    this._ctnCell = [];                         // остаток кораблей у игрока

    for (var p in options.player) {             // заполнение данных
        var v = options.player[p];

        this._lsKill[v] = [];
        this._lsShot[v] = getListPoint();
        this._ctnCell[v] = getCountCell();
    }
    this.userKey = options.player.kUser;        // ключ игрока
    this.enemyKey = options.player.kBrain;      // ключ компьютера

    // первый ход
    this.player = h.rand(1, 2) % 2 ? this.userKey : this.enemyKey;
    this.game(this.player);


    // private method....................
    // ..................................

    function getListPoint() {
        var __fullPoint = [];
        for (var i = 0; i < options.fSize.h; i++) {
            for (var j = 0; j < options.fSize.v; j++)
                __fullPoint.push([j, i]);
        }
        return __fullPoint;
    }

    function getCountCell() {
        var __countCell = 0;
        options.fBarrier.forEach(function (ship) {
            __countCell += ship[0] * ship[1];
        });
        return __countCell;
    }
}

Battle.prototype = Object.create(GameUI.prototype);

Battle.prototype.game = function (fKey) {
    try {
        this.showProgress(fKey);
        this.player = fKey;

        switch (fKey) {
            case (this.userKey):
                this.shotUser();
                break;
            case (this.enemyKey):
                this.shotAI(this.userKey);
                break;
            default:
                throw new Error(h.getMessage('err_invalid_player'));
        }
    } catch (err) {
        h.showExceptions(err);
    }
};

Battle.prototype.shotUser = function () {
    var self = this;

    this.clickToField(this.enemyKey, function (event) {
        if (self.player !== self.userKey)
            return false;

        try {
            var Y = event.target.parentNode.cellIndex,
                X = event.target.parentNode.parentNode.rowIndex;

            self.shot([X, Y], self.enemyKey);
        } catch (err) {
            self.game(self.userKey);
        }
    });
};

Battle.prototype.shotAI = function (fKey) {
    var self = this,
        field = this.fields[fKey],
        fSize = options.fSize,
        tPoint = options.tPoint,
        point = getPointShot();

    setTimeout(function () {
        self.shot(point, fKey);
    }, 300);


    // private method....................
    // ..................................

    // вернет случайную точку для выстрела
    function getPointShot() {
        var point = [];

        if (self._lsKill[fKey].length > 0) {                    // если ранее попадали по кораблю
            point = getPointFinishing();
        } else {                                                // случайный выстрел
            var rInx = h.rand(0, self._lsShot[fKey].length - 1);
            point = self._lsShot[fKey][rInx];                   // получаем случайную точку
            self._lsShot[fKey].splice(rInx, 1);                 // удаляем точку из доступных для выстрела
        }

        // проверка полученной точки...
        if (point instanceof Array && point[0] !== 'undefined' && point[1] !== 'undefined') {
            var X = point[0], Y = point[1];
            if (X >= 0 && X < options.fSize.v && Y >= 0 && Y < options.fSize.h) {
                if (field[X][Y] !== tPoint.NUL || field[X][Y] !== tPoint.BAR)
                    return point;
            }
        }

        return getPointShot();
    }

    // вернет точку для добивания
    function getPointFinishing() {
        var cP = [[-1, 0], [0, -1], [1, 0], [0, 1]],            // возможные направления для добивания
            lsP = self._lsKill[fKey],
            point = [];

        var i = 0, n = 0;

        if (lsP.length == 1) {                                  // первый выстрел при добивание
            var X = lsP[0][0], Y = lsP[0][1];

            cP = h.shuffle(cP);                                 // перемешает массив
            for (i = 0; i < cP.length; i++) {                   // выбираем случайное направление для выстрела
                var pX = X + cP[i][0],
                    pY = Y + cP[i][1];

                // точка в рамках поля и туда еще не стреляли
                if (pX >= 0 && pX < fSize.v && pY >= 0 && pY < fSize.h) {
                    if (field[pX][pY] !== tPoint.NUL)
                        return [pX, pY];
                }
            }
        } else {                                                // второй и т.д выстрел при добивании
            var posHorizontal = lsP[0][0] == lsP[1][0],         // определяем направление корабля
                min = fSize.h + fSize.v, max = 0;               // крайние точки

            for (i = 0; i < lsP.length; i++) {                  // поиск крайних точек корабля
                n = posHorizontal ? lsP[i][1] : lsP[i][0];

                min = min > n ? n : min;
                max = max < n ? n : max;
            }

            // случайным образом определяем с какого края стрелять по караблю
            var nP = h.rand(1, 2) % 2 ? min - 1 : max + 1;
            point = posHorizontal ? [lsP[0][0], nP] : [nP, lsP[0][1]];
        }

        return point;
    }
};

Battle.prototype.shot = function (point, fKey) {
    var self = this,
        ctnCellShip = 0,
        _fKey = fKey == this.userKey ? this.enemyKey : this.userKey;
    var X = point[0], Y = point[1];

    var check = checkPoint(point, fKey);                        // проверка выстрела
    if (typeof check == 'boolean') {                            // во что то попал
        if (check) {                                            // попал на по кораблю -> РАНИЛ
            this._ctnCell[fKey]--;                              // минус 1 точка для выстрела

            this.fields[fKey][X][Y] = options.tPoint.KIL;
            var isKill = isKillShip(point, fKey);
            if (typeof isKill == 'boolean') {                   // корабль просто ранен
                this._lsKill[fKey].push(point);                 // сохраняем последнее попадание

                this.setMarker(point, fKey, options.tPoint.KIL);
                this.setHelpMarker(point, fKey, function (_point) {// при ранении установим точки подсказки
                    var _X = _point[0],
                        _Y = _point[1];
                    self.fields[fKey][_X][_Y] = options.tPoint.NUL;
                });
            }
            else {                                              // корабль убит
                this._lsKill[fKey] = [];                        // очищаем список последнего попадания

                isKill.forEach(function (_point) {
                    var _X = _point[0],
                        _Y = _point[1];

                    // ставим метки на игровое поле, если разрешены подсказки
                    if (options.printHelp) {
                        self.setMarker(_point, fKey, options.tPoint.NUL, true);
                        self.fields[fKey][_X][_Y] = options.tPoint.NUL;
                    }
                    if (_fKey == options.player.kBrain)
                        self.fields[fKey][_X][_Y] = options.tPoint.NUL;
                });

                this.setMarker(point, fKey, options.tPoint.KIL + '_death');
                this.shipInfoMap(ctnCellShip, fKey);
            }

            if (this._ctnCell[fKey] === 0) {                    // конец игры
                this.player = false;
                this.gameOver(_fKey);
            } else this.game(_fKey);                            // повтор хода
        }
        else {                                                  // попадание по пустой клетке -> МИМО
            this.fields[fKey][X][Y] = options.tPoint.NUL;
            this.setMarker(point, fKey, options.tPoint.NUL);
            this.game(fKey);                                    // переход кода
        }
    }
    else this.game(_fKey);                                      // уже стрелял в эту точку -> повтор хода


    // private method....................
    // ..................................

    // проверяет точку выстрела по полю
    function checkPoint(point, fKey) {
        var X = point[0], Y = point[1];

        switch (self.fields[fKey][X][Y]) {
            case (options.tPoint.DEF):                          // мимо
                return false;
            case (options.tPoint.BAR):                          // ранил
                return true;
            default:                                            // что то другое
                return null;
        }
    }

    // проверка уничтожения корабля
    function isKillShip(point, fKey) {
        var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
            field = self.fields[fKey],
            sPoints = [],
            lsCellShip = [];

        if (_checkPointToKill(point)) {
            // ctnCellShip = lsCellShip.length + 1;
            lsCellShip.push(point);
            ctnCellShip = lsCellShip;

            return sPoints;
        }
        else return false;


        // private method....................
        // ..................................

        // убит или нет корабль, если да то заполнет массив соседних точек
        function _checkPointToKill(point, noCheck) {
            var X = point[0], Y = point[1],                     // исходная проверяемая точка
                nX = false, nY = false;                         // не проверяемая точка при повторе
            var dopCheck = [];                                  // дополнительные точки проверки

            if (typeof noCheck == "object") {                   // не проверяемая точка, при рекурсии
                nX = noCheck[0];
                nY = noCheck[1];
            }

            for (var i = 0; i < cP.length; i++) {               // перебор точек по кругу
                var pX = X + cP[i][0],
                    pY = Y + cP[i][1];

                if (pX === nX && pY === nY) {                   // эту точку уже проверили
                    // точка проверенна при предыдущей итерации
                } else {
                    // только если точка в рамках игрового поля
                    if (pX >= 0 && pX < options.fSize.v && pY >= 0 && pY < options.fSize.h) {
                        var val = field[pX][pY];

                        if (val == options.tPoint.BAR)
                            return false;                       // целая часть корабля -> не убит
                        else if (val == options.tPoint.KIL) {   // раненая часть корабля, запомним для рекурсии
                            lsCellShip.push([pX, pY]);          // подсчет палуб
                            dopCheck.push([[pX, pY], [X, Y]]);  // доп.точка првоерки
                        }
                        else sPoints.push([pX, pY]);            // подбитая часть корабля,
                    }
                }
            }

            // доп.точки проверки, если еще есть то запуск рекурсии
            if (dopCheck.length === 0)
                return true;                                    // точек более нет -> убит
            else {
                var sRes = 0;
                for (var k = 0; k < dopCheck.length; k++) {
                    if (!_checkPointToKill(dopCheck[k][0], dopCheck[k][1]))
                        return false;
                    else sRes++;
                }
                return sRes == dopCheck.length;                 // проверенно == доп.точек
            }
        }
    }
};