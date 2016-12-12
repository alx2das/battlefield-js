;(function (global) {
    'use strict';

    var __instances = {};

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
                h: 'number',
                v: 'number'
            },
            helpPoint: true
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
     *  helpPoint: true                 // вывод точек подсказок, попробуйте.
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
     * @returns {?null}
     */
    Battlefield.prototype.run = function () {
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

            return null;
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
    };


    // *****************************************************************************************************************
    /**
     * Отвечает за работу с игровыми полями
     *
     * @param conf
     * @constructor
     */
    function Field(conf) {
        if (!conf.fName instanceof Array || conf.fName.length == 0)
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
    function Battle(fields, ui, options) {
        if (!ui instanceof GameUI)
            throw new Error(h.getMessage('error_ui_instance'));

        this.ui = ui;

        this.listPoint = [];
        this.userKey = options.player.kUser;
        this.enemyKey = options.player.kEnemy;
        this.fields = fields;

        this.player = h.rand(1, 2) % 2 ? this.userKey : this.enemyKey;
        this.game(this.player);
    }

    /**
     * Осуществляет переход хода.
     * Получает ключ игрока который должен произвести свой ход.
     *
     * @param player {?string}
     */
    Battle.prototype.game = function (player) {
        this.ui.showProgress(player);
        this.player = player;

        switch (player) {
            case (this.userKey):
                this.userShot();
                break;
            case (this.enemyKey):
                this.AIShot(this.userKey);
                break;
            default:
                throw new Error(h.getMessage('error_game_not_found'));
        }
    };

    /**
     * Выстрел пользователя.
     * Вешает событие отслеживания клика по полю кротивника
     */
    Battle.prototype.userShot = function () {
        var self = this;

        this.ui.clickToField(this.enemyKey, function (event) {
            if (self.player !== self.userKey)
                return false;

            var fKey = self.enemyKey,
                _check = null;

            try {
                var Y = event.target.parentNode.cellIndex,
                    X = event.target.parentNode.parentNode.rowIndex;

                _check = self.shot([X, Y], fKey);
            } catch (e) {
                self.game(self.userKey);
            }

            if (typeof _check == "boolean") {
                if (_check) {
                    self.fields[fKey][X][Y] = options.tPoint.KIL;
                    self.ui.setMarker([X, Y], options.tPoint.KIL, fKey);

                    var _isKill = self.isKill([X, Y], fKey);

                    if (typeof _isKill == "boolean") {
                        self.ui.setHelpMarker([X, Y], fKey);
                        self.ui.printLog([X, Y], options.tPoint.KIL, fKey);
                    } else {
                        _isKill.forEach(function (point) {
                            self.ui.setMarker(point, options.tPoint.NUL, fKey, true);
                        });
                        self.ui.printLog([X, Y], options.tPoint.KIL + "_death", fKey);
                    }
                } else {
                    self.fields[fKey][X][Y] = options.tPoint.NUL;
                    self.ui.setMarker([X, Y], options.tPoint.NUL, fKey);
                    self.ui.printLog([X, Y], options.tPoint.NUL, fKey);

                    self.game(fKey);
                }
            }
        });
    };

    Battle.prototype.AIShot = function (fKey) {
        var self = this;

        if (typeof this.listPoint[fKey] == "undefined")
            this.listPoint[fKey] = createListPoint();

        var pList = this.listPoint[fKey],
            rPoint = pList[h.rand(0, pList.length)];

        var _check = this.shot(rPoint, fKey);
        if (typeof _check == "boolean") {
            if (_check) {
                console.log("\t\t> ранил");
            } else {
                console.log("\t\t> мимо");

                this.listPoint[fKey] = pList.splice(rPoint, 1);
                this.game(fKey);
            }
        }

        console.log(rPoint, pList.length);



        function createListPoint() {
            console.log('Расчитываю точки выстрелов');

            var field = self.fields[fKey],
                list = [];

            for (var i = 0; i < field.length; i++) {
                for (var j = 0; j < field[i].length; j++) {
                    list.push([i, j]);
                }
            }

            return list;
        }
    };

    /**
     * Проверяет попадание по игровому полю
     *
     * @param point {?array}        Точка выстрела, в формате [x, y]
     * @param fKey {?string}        Ключ игрового поля
     * @returns {?boolean|null}     boolean или null - если повторный выстрел в одну точку
     */
    Battle.prototype.shot = function (point, fKey) {
        var X = point[0],
            Y = point[1],
            P = this.fields[fKey][X][Y];

        switch (P) {
            case (options.tPoint.DEF):
                return false;
            case (options.tPoint.BAR):
                return true;
            default:
                return null;
        }
    };

    /**
     * Проверяет уничтожен ли корабль.
     *
     * @param point {?array}        Точка попадания в корабль, в формате [x, y]
     * @param fKey {?string}        Ключ игрового поля
     * @returns {*}                 Если убит, то вернет список координатов точек во круг, иначе false
     */
    Battle.prototype.isKill = function (point, fKey) {
        var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
            field = this.fields[fKey],
            vKil = options.tPoint.KIL,
            vBar = options.tPoint.BAR;
        var sPoints = [],
            sX = options.fSize.v,
            sY = options.fSize.h;

        return checkPointToKill(point) ? sPoints : false;


        // private method....................
        // ..................................

        function checkPointToKill(point, noCheck) {
            var X = point[0],
                Y = point[1];
            var nX = typeof noCheck == "object" ? noCheck[0] : false,
                nY = typeof noCheck == "object" ? noCheck[1] : false;
            var dopCheck = [];

            for (var i = 0; i < cP.length; i++) {
                var pX = X + cP[i][0],
                    pY = Y + cP[i][1];

                if (pX == nX && pY == nY) {
                    // пропуск точки проверки
                } else {
                    if (pX >= 0 && pX < sX && pY >= 0 && pY < sY) {
                        var val = field[pX][pY];

                        if (val == vBar)
                            return false;
                        else if (val == vKil)
                            dopCheck.push([[pX, pY], [X, Y]]);
                        else
                            sPoints.push([pX, pY]);
                    }
                }
            }

            if (dopCheck.length == 0)
                return true;
            else {
                var sRes = 0;
                for (var k = 0; k < dopCheck.length; k++) {
                    if (!checkPointToKill(dopCheck[k][0], dopCheck[k][1]))
                        return false;
                    else sRes++;
                }

                return sRes == dopCheck.length;
            }
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
        var self = this,
            box = document.createElement('div'),
            printShip = this.posLeft ? true : false,
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

                        mm = x == 0 ? '<div class="mm">' + txtMM + '</div>' : '';
                        ll = y == 0 ? '<div class="ll">' + txtLL + '</div>' : '';
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
    GameUI.prototype.setHelpMarker = function (point, fKey) {
        var X = point[0],
            Y = point[1],
            sP = [[-1, -1], [1, -1], [1, 1], [-1, 1]],
            elClass = 'auto-null';

        for (var i = 0; i < sP.length; i++) {
            var nX = X + sP[i][0],
                nY = Y + sP[i][1];

            if (nX >= 0 && nX < options.fSize.v && nY >= 0 && nY < options.fSize.h) {
                var box = this.containerField.querySelector('table.field.' + fKey)
                    .rows[nX].cells[nY]
                    .querySelector('.box');

                box.className += ' ' + elClass;
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

        marker += options.marker.h == 'string' ? h.getLetter(Y) : (Y + 1);
        marker += "x";
        marker += options.marker.v == 'string' ? h.getLetter(X) : (X + 1);

        var html =
            '<span class="point">' + marker + '</span>' +
            '<span class="type ' + tPoint_class + '">' + tPoint_name + '</span>' +
            '<span class="name">' + player + '</span>' +
            '<span class="time">' + time + '</span>';

        var li = document.createElement('li');
        li.innerHTML = html;

        this.containerLog.querySelector('ul').insertBefore(li, this.containerLog.querySelector('ul').firstChild);
    };


    // *****************************************************************************************************************
    var h = {
        __userName: 'Игрок',

        rand: function (min, max) {
            var min = min || 0,
                max = max || 100;
            return parseInt(Math.random() * (max - min + 1) + min);
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
                player_FBrain: 'Компьютер',
            };

            return mess[type];
        }
    };

    global.Battlefield = Battlefield;
})(this);