;(function (global) {
    'use strict';

    var __instances = {},
        __brain = false;

    var options = {},
        _defaultPublic = {
            containerField: '.game-field',
            containerLog: '.game-log',
            containerStatus: '.gamer-data',
            fSize: {
                h: 10, v: 10
            },
            fBarrier: [
                [4, 1], [3, 2], [2, 3], [1, 4]
            ],
            marker: {
                h: 'string',
                v: 'number'
            },
            helpPoint: false,
            timeoutAI: 1
        },
        _defaultPrivate = {
            fName: ['FUser', 'FBrain'],
            player: {
                kUser: 'FUser',
                kEnemy: 'FBrain'
            },
            tPoint: {
                DEF: 0,
                BAR: 1,
                KIL: 2,
                NUL: 3
            }
        };

    /**
     * Это конструктор игры Battlefiel. Представлен в единственном экземпляре.
     * Доступно ограниченнное количество методов.
     *
     * @param {?object} config          Конфигурация экземпляра, могут быть заданы необходимые
     *                                  настройки для приятной игры. Если оставить пустым настройки
     *                                  будут установленны по умолчанию, ировень сложности можно
     *                                  изменять при помощи специально метода.
     * @returns {Battlefield}           Единственный экземпляр игры.
     *
     * Параметры запуска:
     * ******************
     * var conf = {
     *  containerField: '.game-field',  // контейнер карты игровых полей
     *  containerLog: '.game-log',      // контейнер логирования хода игры
     *  containerStatus: '.gamer-data', // контейнер отображения имени и счета игроков
     *  fSize: {h: 15, v: 15},          // размерность игрового поля {по горизонтали, по вертикали}
     *  fBarrier: [                     // массив кораблей на игровом поле, расстановка случайным образом
     *      [4, 1], [3, 2], [2, 3]      // > установка по принцыпу [кол.клеток, кол.штук]
     *  ],
     *  marker: [                       // маркировки клеток, может принимать значение: [string|number|false]
     *      h: 'number',                // по горизонтали - числовой
     *      v: 'string'                 // по вертикали - сивольный
     *  ],
     *  helpPoint: true,                // вывод точек подсказок, попробуйте.
     *  timeoutAI: 400                  // время задержки между выстрелами интелекта
     * };
     * var BF = new Battlefield(conf);  // создание игрового экземпляра
     * BF.setLevel('hard');             // установка уровня сложности
     * BF.run();                        // запуск игры
     *
     * Рекомендуемые параметры:
     * ************************
     * Рекомендуется оставлять параметры по умолчанию. Редактировать уровень сложности при
     * помощи соответствующего метода или же при помощи игрового интерфейса.
     *
     *  {?array}    fBarrier            Необходимо устанавливать корабли по количеству занимаемых
     *                                  клеток от большего к меньшему. Общее количество клеток не
     *                                  должно привышать 50% размера игрового поля.
     *  {?boolean}  helpPoint           Можно как включать так и отключать для отображения подсказок
     *                                  в какие клетки стрелять нет смысла. Чаще всего это угловы
     *                                  клетки от попадания по кораблю. При выключнном параметре,
     *                                  ход по предполагаемому месту размещения подсказки будет защитан.
     *
     * @constructor
     */
    function Battlefield(config) {
        // Singleton
        if (__instances instanceof Battlefield)
            return __instances;
        __instances = this;

        // Merge config and full options
        if (typeof config == 'object') {
            for (var key in _defaultPublic)
                options[key] = config.hasOwnProperty(key) ? config[key] : _defaultPublic[key];
            options = Object.assign(options, _defaultPrivate);
        }
        else options = Object.assign(_defaultPublic, _defaultPrivate);
    }

    /**
     * Инициализирует запуск игры.
     *
     * @param brain_brain {?boolean}    если "true" запускает игру в режиме: Компьютер vs. Компьютера
     */
    Battlefield.prototype.run = function (brain_brain) {
        __brain = brain_brain || false;         // компьютер vs. компьютера
        if (__brain) {
            h.__userName = 'Компьютер.Левый';
            h.__brainName = 'Компьютер.Правый';
        }

        try {
            var ui = new GameUI(options);
            document.querySelector(options.containerField).innerHTML = '';

            var F = new Field({
                fName: options.fName,
                fSize: options.fSize,
                fBarrier: options.fBarrier,
                tPoint: options.tPoint
            });

            var fields = F
                .createField()
                .setBarrier(function (field, fKey) {
                    ui.createFieldHTML(field, fKey);
                });

            new Battle(fields, ui, options);
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * Устанавливает уровень сложности
     *
     * @param type                  Доступны типы: [easy|middle|hard]
     * @returns {Battlefield}
     */
    Battlefield.prototype.setLevel = function (type) {
        var level = {
            easy: {
                fSize: {h: 10, v: 10},
                fBarrier: [[4, 1], [3, 2], [2, 3], [1, 4]]
            },
            middle: {
                fSize: {h: 15, v: 15},
                fBarrier: [[5, 1], [4, 2], [3, 3], [2, 4], [1, 5]]
            },
            hard: {
                fSize: {h: 15, v: 20},
                fBarrier: [[6, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]]
            },
            dev: {
                fSize: {h: 20, v: 20},
                fBarrier: [[1, 6]]
            }
        };

        if (typeof level[type] == 'object') {
            var nLevel = level[type];

            options.fSize = nLevel.fSize;
            options.fBarrier = nLevel.fBarrier;

            return this;
        }
        else throw new Error('Указан несуществующий уровень сложности');

        return this;
    };

    /**
     * Устанавливает имя пользователя
     *
     * @param newName {?string}
     */
    Battlefield.prototype.setPlayerName = function (newName) {
        if (typeof newName == "string") {
            if (newName.length >= 3) {
                h.__userName = newName;
            }
        }
        return this;
    };


    // *****************************************************************************************************************
    /**
     * Отвечает за работу с игровыми полями
     *
     * @param conf
     * @constructor
     */
    function Field(conf) {
        if (!conf.fName instanceof Array || conf.fName.length === 0)
            throw new Error(h.getMessage('error_field_name'));

        if (typeof conf.fSize != 'object' || typeof conf.fSize.h != 'number' || typeof conf.fSize.v != 'number')
            throw new TypeError(h.getMessage('error_field_size'));

        if (!conf.fBarrier instanceof Array)
            throw new TypeError(h.getMessage('error_barrier_type'));

        if (typeof conf.tPoint != 'object')
            throw new Error(h.getMessage('error_point_type'));

        this.fName = conf.fName;
        this.fSize = conf.fSize;
        this.fBarrier = conf.fBarrier;
        this.tPoint = conf.tPoint;

        this.fList = {};
    }

    /**
     * Создает игровое согласно установленным параметрам
     * установленным в конструкторе класса
     *
     * @returns {Field}             Вернет обьект класса
     */
    Field.prototype.createField = function () {
        var self = this;

        self.fName.forEach(function (fKey) {
            var field = new Array(self.fSize.v);

            for (var v = 0; v < self.fSize.v; v++) {
                field[v] = new Array(self.fSize.h);

                for (var h = 0; h < self.fSize.h; h++)
                    field[v][h] = self.tPoint.DEF;
            }

            self.fList[fKey] = field;
        });

        return this;
    };

    /**
     * Устанавливает все корабли на игровые поля.
     * После того как корабли будут установленны будет вызван callback с параметрами:
     *  > @param {?array}   field   массив игрового поля кораблями
     *  > @param {?string}  fKey    ключ игрового поля из options.fName
     *
     * @param callback(field, fKey)
     * @returns {{?array}|*}        Вернет список игровых полей с установленными кораблями
     */
    Field.prototype.setBarrier = function (callback) {
        var self = this,
            maxIterations = self.fName.length * 100;

        self.fName.forEach(function (fKey) {
            var field = self.fList[fKey];

            self.fBarrier.forEach(function (ship) {
                var cell = ship[0],
                    ctn = ship[1];

                for (var c = 0; c < ctn; c++)
                    field = shipInField(cell, field);
            });

            self.fList[fKey] = field;
            if (typeof callback == 'function')
                callback(field, fKey);
        });

        return self.fList;


        // private method....................
        // ..................................

        // установит корабль на игровое поле
        function shipInField(cell, field) {
            if (maxIterations > 0) maxIterations--;
            else throw new Error(h.getMessage('error_max_iterations'));

            var sPoints = [],
                x = h.rand(0, self.fSize.v - 1),
                y = h.rand(0, self.fSize.h - 1);

            var posHorizontal = h.rand(1, 2) % 2 ? true : false;

            for (var i = 0; i < cell; i++) {
                var pX = x, pY = y;

                if (posHorizontal) pX = x + i;
                else pY = y + i;

                if (checkPoint(pX, pY, field))
                    sPoints.push([pX, pY]);
                else return shipInField(cell, field);
            }

            sPoints.forEach(function (point) {
                var x = point[0],
                    y = point[1];

                field[x][y] = self.tPoint.BAR;
            });

            return field;
        }

        // проверяет выбранную точку + ее окружение
        function checkPoint(x, y, field) {
            var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
                pX = 0, pY = 0;
            var sX = self.fSize.v - 1,
                sY = self.fSize.h - 1;

            if (x < 0 || x > sX || y < 0 || y > sY)
                return false;

            if (field[x][y] !== self.tPoint.DEF)
                return false;

            for (var i = 0; i < cP.length; i++) {
                pX = x + cP[i][0];
                pY = y + cP[i][1];

                if (pX >= 0 && pX <= sX && pY >= 0 && pY <= sY) {
                    if (field[pX][pY] != self.tPoint.DEF)
                        return false;
                }
            }

            return true;
        }
    };


    // *****************************************************************************************************************
    function Battle(fields, ui) {
        if (!ui instanceof GameUI)
            throw new Error(h.getMessage('error_ui_instance'));
        this.ui = ui;

        this.fields = fields;

        this._lsKill = [];                          // последнее попадание компьютером
        this._lsShot = [];                          // список точек доступных для выстрела
        this._ctnCell = [];                         // остаток кораблей у игрока

        for (var play in options.player) {          // заполнение данных
            var v = options.player[play];

            this._lsKill[v] = [];
            this._lsShot[v] = getListPoint();
            this._ctnCell[v] = getCountCell();
        }
        this.userKey = options.player.kUser;        // ключ игрока
        this.enemyKey = options.player.kEnemy;      // ключ компьютера

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

    /**
     * Осуществляет переход хода.
     * Получает ключ игрока который должен произвести свой ход.
     *
     * @param player {?string}
     */
    Battle.prototype.game = function (fKey) {
        this.ui.showProgress(fKey);                 // показываемчей ход
        this.player = fKey;

        switch (fKey) {
            case (this.userKey):
                if (__brain)
                    this.AIShot(this.enemyKey);
                else this.userShot();
                break;
            case (this.enemyKey):
                this.AIShot(this.userKey);
                break;
            default:
                throw new Error(h.getMessage('error_game_not_found'));
        }
    };

    /**
     * Вешиет событие клика пользователем по игровому полю противника
     */
    Battle.prototype.userShot = function () {
        var self = this;

        this.ui.clickToField(this.enemyKey, function (event) {
            if (self.player !== self.userKey)
                return false;
            try {
                var fKey = self.enemyKey,
                    Y = event.target.parentNode.cellIndex,
                    X = event.target.parentNode.parentNode.rowIndex;

                self.shot([X, Y], fKey);
            } catch (e) {
                self.game(self.userKey);
            }
        });
    };

    /**
     * Искуственный интелект.
     *
     * @param fKey
     * @constructor
     */
    Battle.prototype.AIShot = function (fKey) {
        var fSize = options.fSize,
            tPoint = options.tPoint,
            field = this.fields[fKey];

        var self = this,
            point = getPointShot();

        setTimeout(function () {
            self.shot(point, fKey);
        }, options.timeoutAI);


        // private method....................
        // ..................................

        // вернет случайную точку для выстрела
        function getPointShot() {
            var point = [];

            if (self._lsKill[fKey].length > 0) {
                point = getPointFinishing();
            } else {
                var rInx = h.rand(0, self._lsShot[fKey].length - 1);
                point = self._lsShot[fKey][rInx];
                self._lsShot[fKey].splice(rInx, 1);
            }

            var X = point[0], Y = point[1];
            if (X >= 0 && X < fSize.v && Y >= 0 && Y < fSize.h) {
                if (field[X][Y] !== tPoint.NUL || field[X][Y] !== tPoint.BAR)
                    return point;
            }

            return getPointShot();
        }

        // вернет точку для добивания
        function getPointFinishing() {
            var cP = [[-1, 0], [0, -1], [1, 0], [0, 1]],
                lsP = self._lsKill[fKey],
                point = [];

            if (lsP.length == 1) {                      // первый выстрел при добивание
                var X = lsP[0][0], Y = lsP[0][1];

                cP = h.shuffle(cP);
                for (var i = 0; i < cP.length; i++) {
                    var pX = X + cP[i][0],
                        pY = Y + cP[i][1];
                    if (pX >= 0 && pX < fSize.v && pY >= 0 && pY < fSize.h) {
                        if (field[pX][pY] !== tPoint.NUL)
                            return [pX, pY];
                    }
                }
            } else {                                    // второй и т.д выстрел при добивании
                var posHorizontal = lsP[0][0] == lsP[1][0],
                    min = fSize.h + fSize.v, max = 0;
                for (var i = 0; i < lsP.length; i++) {
                    var n = posHorizontal ? lsP[i][1] : lsP[i][0];

                    min = min > n ? n : min;
                    max = max < n ? n : max;
                }
                var nP = h.rand(1, 2) % 2 ? min - 1 : max + 1;
                point = posHorizontal ? [lsP[0][0], nP] : [nP, lsP[0][1]];
            }

            return point;
        }
    };

    /**
     * Осуществляет выстрел по игровому полю.
     *
     * @param point
     * @param fKey
     */
    Battle.prototype.shot = function (point, fKey) {
        var fSize = options.fSize,
            tPoint = options.tPoint;

        var self = this,
            _fKey = fKey == this.userKey ? this.enemyKey : this.userKey,
            X = point[0], Y = point[1];

        var check = checkPoint(point, fKey);

        if (typeof check == "boolean") {        // попал в игровое поле
            if (check) {                        // ранил
                // установка меток игрового поля
                this._ctnCell[fKey]--;
                this.fields[fKey][X][Y] = tPoint.KIL;
                this.ui.setMarker(point, tPoint.KIL, fKey);

                var isKill = isKillShip(point, fKey);
                if (typeof isKill == "boolean") {       // ранил
                    this._lsKill[fKey].push(point);
                    this.ui.printLog(point, tPoint.KIL, fKey);
                    this.ui.setHelpMarker(point, fKey, function (_point, fKey) {
                        var _pX = _point[0],
                            _pY = _point[1];
                        if (options.helpPoint) {
                            self.ui.setMarker(_point, tPoint.NUL, fKey, true);
                        }
                        self.fields[fKey][_pX][_pY] = tPoint.NUL;
                    });
                } else {                                // убил
                    this._lsKill[fKey] = [];    // корабль уничтожен, очистка последних попаданий

                    this.ui.printLog(point, tPoint.KIL + "_death", fKey);
                    isKill.forEach(function (_point) {
                        var _pX = _point[0], _pY = _point[1];

                        if (options.helpPoint) {
                            self.ui.setMarker(_point, tPoint.NUL, fKey, true);
                        }
                        self.fields[fKey][_pX][_pY] = tPoint.NUL;
                    });
                }

                if (isFinalGame(fKey)) {        // конец игры!
                    this.ui.finalGame(_fKey, fKey);
                }
                else this.game(_fKey);          // повтор хода
            } else {                            // мимо
                // установка меток игрового поля
                this.fields[fKey][X][Y] = tPoint.NUL;
                this.ui.setMarker(point, tPoint.NUL, fKey);
                this.ui.printLog(point, tPoint.NUL, fKey);

                this.game(fKey);                // переход хода
            }
        }
        else this.game(_fKey);                  // уже стрелял в эту точку -> повтор хода


        // private method....................
        // ..................................

        // проверяет точку выстрела по полю
        function checkPoint(point, fKey) {
            var X = point[0], Y = point[1];

            switch (self.fields[fKey][X][Y]) {
                case (tPoint.DEF):
                    return false;    // мимо
                case (tPoint.BAR):
                    return true;     // ранил
                default:
                    return null;               // что то другое
            }
        }

        // проверка уничтожения корабля
        function isKillShip(point, fKey) {
            var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
                field = self.fields[fKey],
                sPoints = [];

            return _checkPointToKill(point) ? sPoints : false;


            // private method....................
            // ..................................

            function _checkPointToKill(point, noCheck) {
                var X = point[0], Y = point[1],     // исходная проверяемая точка
                    nX = false, nY = false;         // не проверяемая точка при повторе
                var dopCheck = [];                  // дополнительные точки проверки

                if (typeof noCheck == "object") {
                    nX = noCheck[0];
                    nY = noCheck[1];
                }

                for (var i = 0; i < cP.length; i++) {
                    var pX = X + cP[i][0],
                        pY = Y + cP[i][1];

                    if (pX == nX && pY == nY) {
                        // точка проверенна при предыдущей итерации
                    } else {
                        // только если точка в рамках игрового поля
                        if (pX >= 0 && pX < fSize.v && pY >= 0 && pY < fSize.h) {
                            var val = field[pX][pY];

                            if (val == tPoint.BAR)
                                return false;                       // целая часть корабля -> не убит
                            else if (val == tPoint.KIL)
                                dopCheck.push([[pX, pY], [X, Y]]);  // доп.точка првоерки
                            else
                                sPoints.push([pX, pY]);             // подбитая часть корабля
                        }
                    }
                }

                // доп.точки проверки
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

        // проверяет окончание игры
        function isFinalGame(fKey) {
            return self._ctnCell[fKey] === 0;
        }
    };

    // *****************************************************************************************************************
    /**
     * Работа с пользовательским интерфейсом.
     * Работа с UI осуществляется только через этот класс!
     *
     * @constructor
     */
    function GameUI() {
        this.containerField = document.querySelector(options.containerField);
        this.containerLog = document.querySelector(options.containerLog);
        this.containerStatus = document.querySelector(options.containerStatus);

        this.posLeft = true;

        this.defaultHTML();
    }

    /**
     * Автоматически печатает html по умолчанию для блоков
     */
    GameUI.prototype.defaultHTML = function () {
        if (typeof this.containerStatus == "object") {
            var kUser = options.player.kUser,
                kEnemy = options.player.kEnemy;
            var html =
                '<span class="name ' + kUser + '">' + h.getMessage('player_' + kUser) + '</span>' +
                '<span>&amp;</span>' +
                '<span class="name ' + kEnemy + '">' + h.getMessage('player_' + kEnemy) + '</span>';

            this.containerStatus.innerHTML = html;
        }

        if (typeof this.containerLog == "object") {
            this.containerLog.appendChild(document.createElement('ul'));
        }
    };

    /**
     * Печатает таблицу игрового поля на страницу.
     * Поля должны передаваться по одному, с ключем. Устанавливает первым левый, потом правый.
     *
     * @param field {?array}        Массив игрового поля
     * @param fKey {?string}        Ключ игрового поля
     */
    GameUI.prototype.createFieldHTML = function (field, fKey) {
        var box = document.createElement('div'),
            printShip = this.posLeft ? true : __brain,
            dopAttr = this.posLeft ? 'lf' : 'rg';

        var table = createHtmlField(field, fKey, printShip),
            barrier = createBarrierInfo();

        box.setAttribute('class', 'board ' + dopAttr);
        box.innerHTML = table + barrier;
        this.containerField.appendChild(box);

        this.posLeft = this.posLeft ? false : true;


        // private method....................
        // ..................................

        // вернет html игрового поля
        function createHtmlField(field, fKey, printShip) {
            if (!field instanceof Array)
                throw new Error(h.getMessage('error_field_invalid'));

            var _ship = printShip || false,
                table = '';

            table += '<table class="field ' + fKey + '">';
            for (var x = 0; x < field.length; x++) {
                table += '<tr>';
                for (var y = 0; y < field[x].length; y++) {
                    var mm = '', ll = '';

                    if (options.marker !== false && typeof options.marker == 'object') {
                        var txtMM = typeof options.marker.v != 'undefined' ? (options.marker.v == 'string' ? h.getLetter(y) : (y + 1)) : (y + 1),
                            txtLL = typeof options.marker.h != 'undefined' ? (options.marker.h == 'string' ? h.getLetter(x) : (x + 1)) : (x + 1);

                        mm = x === 0 ? '<div class="mm">' + txtMM + '</div>' : '';
                        ll = y === 0 ? '<div class="ll">' + txtLL + '</div>' : '';
                    }

                    var ship = _ship ? (field[x][y] == options.tPoint.BAR ? ' let' : '') : '';
                    table += '<td>' + mm + ll + '<div class="box' + ship + '"></div></td>';
                }
                table += '</tr>';
            }
            table += '</table>';

            return table;
        }

        // вернет список доступных кораблей
        function createBarrierInfo() {
            var str = '';

            options.fBarrier.forEach(function (ship) {
                var box = '';
                for (var c = 0; c < ship[0]; c++)
                    box += '<div class="box"></div>';
                str += '<div class="let"><span>x' + ship[1] + '</span>' + box + '</div>';
            });

            return '<div class="list-let">' + str + '</div>';
        }
    };

    /**
     * Выделит заголовок игрока.
     *
     * @param fKey {?string}        Ключ игрового поля
     */
    GameUI.prototype.showProgress = function (fKey) {
        this.containerStatus.querySelectorAll('.name').forEach(function (span) {
            span.classList.remove('act');
        });

        this.containerStatus.querySelector('.name.' + fKey).classList.add('act');
    };

    /**
     * Отслеживает событие клика на игровое поле.
     *
     * @param fKey {?string}        Ключ игрового поля
     * @param callback {?function}  Функция будет выполнена при клике
     */
    GameUI.prototype.clickToField = function (fKey, callback) {
        this.containerField.querySelector('table.field.' + fKey).onclick = callback;
    };

    /**
     *
     * @param point {?array}        Точка выстрела, в формате [x, y]
     * @param tPoint {?string}      Тип попадания из списка {options.tPoint}
     * @param fKey {?string}        Ключ игрового поля
     * @param auto {?boolean}       Автоматическая установка. Нет - по умолчанию
     */
    GameUI.prototype.setMarker = function (point, tPoint, fKey, auto) {
        var auto = auto || false,
            X = point[0],
            Y = point[1];

        var elClass = "";

        switch (tPoint) {
            case (options.tPoint.KIL):
                elClass = 'kill';
                break;
            case (options.tPoint.KIL + "_death"):
                elClass = 'kill';
                break;
            case (options.tPoint.NUL):
                elClass = auto ? 'auto-null' : 'null';
                break;
        }

        var box = this.containerField.querySelector('table.field.' + fKey)
            .rows[X].cells[Y]
            .querySelector('.box');

        box.className += ' ' + elClass;
    };

    /**
     * Петчатает на игровое поле точки подсказки.
     * Раставляет точки по углам от попадания.
     *
     * @param point {?array}        Точка выстрела, в формате [x, y]
     * @param fKey {?string}        Ключ игрового поля
     */
    GameUI.prototype.setHelpMarker = function (point, fKey, callback) {
        var X = point[0],
            Y = point[1],
            sP = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

        for (var i = 0; i < sP.length; i++) {
            var nX = X + sP[i][0],
                nY = Y + sP[i][1];

            if (nX >= 0 && nX < options.fSize.v && nY >= 0 && nY < options.fSize.h) {
                if (typeof callback == "function")
                    callback([nX, nY], fKey)
            }
        }
    };

    /**
     * Логирует выполненный ход на страницу.
     *
     * @param point {?array}        Точка выстрела, в формате [x, y]
     * @param tPoint {?string}      Тип попадания из списка {options.tPoint}
     * @param fKey {?string}        Ключ игрового поля
     */
    GameUI.prototype.printLog = function (point, tPoint, fKey) {
        var X = point[0],
            Y = point[1];

        var tPoint_class = '',
            tPoint_name = '';

        switch (tPoint) {
            case (options.tPoint.KIL):
                tPoint_class = 'war';
                tPoint_name = 'ранил';
                break;
            case (options.tPoint.KIL + "_death"):
                tPoint_class = 'kil';
                tPoint_name = 'убил';
                break;
            case (options.tPoint.NUL):
                tPoint_class = 'nul';
                tPoint_name = 'мимо';
                break;
        }

        var player = fKey == options.player.kUser
                ? h.getMessage('player_' + options.player.kEnemy) : h.getMessage('player_' + options.player.kUser),
            __date = new Date(),
            time = __date.toLocaleTimeString(),
            marker = '';

        marker += options.marker.h == 'string' ? h.getLetter(X) : (X + 1);
        marker += "x";
        marker += options.marker.v == 'string' ? h.getLetter(Y) : (Y + 1);

        var html =
            '<span class="point">' + marker + '</span>' +
            '<span class="type ' + tPoint_class + '">' + tPoint_name + '</span>' +
            '<span class="name">' + player + '</span>' +
            '<span class="time">' + time + '</span>';

        var li = document.createElement('li');
        li.innerHTML = html;

        this.containerLog.querySelector('ul').insertBefore(li, this.containerLog.querySelector('ul').firstChild);
    };

    /**
     * Показывает сообщение об окончании игры
     *
     * @param winner_fKey
     * @param loser_fKey
     */
    GameUI.prototype.finalGame = function (winner_fKey, loser_fKey) {
        var str = '';

        str += '<div class="final">';
        str += '<h3>Игра окончена</h3>';
        str +=
            '<table>' +
            '   <tr class="winner">' +
            '       <td><b>Победитель</b></td>' +
            '       <td>' + h.getMessage('player_' + winner_fKey) + '</td>' +
            '   </tr>' +
            '   <tr class="loser">' +
            '       <td><b>Проиграл</b></td>' +
            '       <td>' + h.getMessage('player_' + loser_fKey) + '</td>' +
            '   </tr>' +
            '</table>';
        str += '</div>';

        this.modalWindow(str, {
            name: 'Новая игра',
            classElement: 'green',
            envClick: function (modal) {
                var BF = new Battlefield(options);
                BF.run(false);

                modal.close();
            }
        });
    };

    GameUI.prototype.modalWindow = function (html, footBtn) {
        var modal = {
            _fontID: 'modal_font',
            _contID: 'modal_cont',

            modBox: false,
            closeBtn: false,
            box: false,
            foot: false,

            constructModal: function (html, footBtn) {
                this.createHTML();

                this.modBox = document.querySelector('.modal-box#' + this._contID);
                this.closeBtn = this.modBox.querySelector('.modal-close');
                this.box = this.modBox.querySelector('.box');
                this.foot = this.modBox.querySelector('.mod_foot');

                this.box.innerHTML = html;

                console.log(typeof footBtn);
                if (typeof footBtn == "object") {
                    var self = this,
                        _param = typeof footBtn.classElement == "string" ? footBtn.classElement : '',
                        fBtn = document.createElement('button');

                    fBtn.setAttribute('class', 'btn ' + _param);
                    fBtn.innerHTML = footBtn.name;
                    fBtn.onclick = function () {
                        footBtn.envClick(self);
                    };
                    this.foot.appendChild(fBtn);
                } else if (typeof footBtn == "string") {
                    this.foot.innerHTML = footBtn;
                }
                else this.foot.style.display = 'none';

                this.autoPosition();

                var self = this;
                this.closeBtn.onclick = function () {
                    self.close();
                };
            },
            createHTML: function () {
                var crFont = document.createElement('div');
                crFont.setAttribute('class', 'modal-font');
                crFont.setAttribute('id', this._fontID);

                var crCont = document.createElement('div');
                crCont.setAttribute('class', 'modal-box');
                crCont.setAttribute('id', this._contID);
                crCont.innerHTML = '<div class="modal-close">&#215;</div>' +
                    '<div class="mod_head"><h2>Battlefield<small>2.0.0</small></h2></div>' +
                    '<div class="box"></div>' +
                    '<div class="mod_foot"></div>';

                var body = document.querySelector('body');
                body.appendChild(crFont);
                body.appendChild(crCont);
            },
            autoPosition: function () {
                var wid2 = this.modBox.clientWidth / 2,
                    hei2 = this.modBox.clientHeight / 2;

                this.modBox.style.marginTop = hei2 * (-1) + 'px';
                this.modBox.style.marginLeft = wid2 * (-1) + 'px';
            },
            close: function () {
                var _font = document.querySelector('.modal-font#' + this._fontID),
                    _cont = document.querySelector('.modal-box#' + this._contID);

                document.body.removeChild(_font);
                document.body.removeChild(_cont);
            }
        };

        modal.constructModal(html, footBtn);
    };


    // *****************************************************************************************************************
    var h = {
        __userName: 'Игрок',
        __brainName: 'Компьютер',

        rand: function (min, max) {
            var min = min || 0,
                max = max || 100;
            return parseInt(Math.random() * (max - min + 1) + min);
        },
        shuffle: function (arr) {
            var inx, buffer;
            for (var i = 0; i < arr.length - 1; i++) {
                inx = this.rand(0, arr.length - 1);
                buffer = arr[inx];

                arr[inx] = arr[arr.length - 1];
                arr[arr.length - 1] = buffer;
            }
            return arr;
        },
        getLetter: function (key, operand) {
            var operand = operand || '',
                alphabet = "ABCDIFGHIJKLMNOPQRSTUVWXYZ";
            if (key > alphabet.length)
                return h.getLetter(key - alphabet.length, (operand == '' ? 1 : operand + 1));

            return alphabet[key] + operand;
        },
        getMessage: function (type) {
            var mess = {
                error_field_name: 'Не верно указаны названия игровых полей',
                error_field_size: 'Неверно установлен размер игрового поля',
                error_field_invalid: 'Не могу напечатать игровое поле, неверный формат',
                error_barrier_type: 'Неверно указан список кораблей',
                error_point_type: 'Не установлены типы содержимого',
                error_max_iterations: 'Чего то я залип в рекурсии, может стоит изменить параметры??',
                error_ui_instance: 'Я не могу взаимодействовать с интерфейсом из за неправильно переданного параметра',
                error_game_not_found: 'Ход не известного мне игрока',
                player_FUser: this.__userName,
                player_FBrain: this.__brainName
            };

            return typeof mess[type] == "string" ? mess[type] : type;
        }
    };

    global.Battlefield = Battlefield;
})(this);