/**
 * battlefield-js v1.0.0
 * This is classic game Battlefield for browsers, implemented on language JavaScript.
 * 
 * repository: git+https://github.com/alx2das/battlefield-js.git
 * bugs: [object Object]
 * 
 * Copyright 2017, Alexandr Builov
 * Date: Sat Feb 04 2017
 */
(function(window){   
   "use strict";   

    var options = {},                                               // глобальный объект с опциями игры
        // публичные свойства, могут быть изменены через config
        _optionsPublic = {
            printName: true,                                        // печатать имена игроков
            printLog: true,                                         // ведения журнала боя
            printHelp: true,                                        // использовать подсказки

            fSize: {                                                // размерность игрового поля
                h: 15, v: 15                                        // h - горизонтально, v - вертикально
            },
            fBarrier: [                                             // список кораблей на игровом поле
                [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]              // по принципу: ["кол-во палуб", "кол-во штук"]
            ],
            fMarker: {                                              // обозначение ячеек
                h: 'number', v: 'char'                              // могут быть: char или number
            }
        },
        // приватные, не доступны для изменения
        _optionsPrivate = {
            player: {                                               // коды играков, должны начинаться с буквы
                kUser: 'FUser', kBrain: 'FBrain'
            },
            winner: {
                kUser: 0, kBrain: 0
            },
            tPoint: {                                               // типы точек игрового поля
                DEF: 0, BAR: 1, KIL: 2, NUL: 3                      // пусто, корабль, ранил, мимо
            }
        };

    var _instances = false,                                         // Singleton
        _globalLevel = 'middle';                                    // уровень сложности по умолчанию

    /**
     * Инициализирует игру, устанавливает параметры по умолчанию
     *
     * Требуется:
     *      options = {}        - глобальный объект с опциями игры
     *      h = {}              - глобальный обьект функций помошников
     *
     * @param htmlSelector      - строковый селектор элемента на странице
     * @param config            - объект настроек по умолчанию, доступные параметры: _optionsPublic
     * @returns {Battlefield}
     * @constructor
     */
    function Battlefield(htmlSelector, config) {
        // Singleton
        if (_instances instanceof Battlefield)
            return _instances;
        _instances = this;

        // объединяем установленные опции игры с доступными
        if (typeof config == 'object') {
            for (var key in _optionsPublic)
                options[key] = config.hasOwnProperty(key) ? config[key] : _optionsPublic[key];
            options = Object.assign(options, _optionsPrivate);
        }
        else options = Object.assign(_optionsPublic, _optionsPrivate);

        options.htmlSelector = document.querySelector(htmlSelector);
    }

    /**
     * Запуск игры
     */
    Battlefield.prototype.run = function () {
        try {
            var F = new Field();
            var fields = F.setBarrier();

            new Battle(fields, this);
        } catch (err) {
            h.showExceptions(err);
        }
    };

    /**
     * Вернет настройки для указанного уровеня сложности
     *
     * @param type
     * @returns {*}
     */
    Battlefield.prototype.getLevel = function (type) {
        var level = {
            easy: {
                fSize: {h: 10, v: 10},
                fBarrier: [[4, 1], [3, 2], [2, 3], [1, 4]]
            },
            middle: {
                fSize: {h: 15, v: 15},
                fBarrier: [[5, 2], [4, 3], [3, 4], [2, 5], [1, 6]]
            },
            hard: {
                fSize: {h: 15, v: 20},
                fBarrier: [[6, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]]
            }
        };

        if (typeof level[type] == 'object') {
            return level[type];
        }
        else throw new Error(h.getMessage('err_invalid_level'));
    };

    /**
     * Установит уровень сложности
     *
     * @param type
     * @returns {Battlefield}
     */
    Battlefield.prototype.setLevel = function (type) {
        var nLevel = this.getLevel(type);

        options.fSize = nLevel.fSize;
        options.fBarrier = nLevel.fBarrier;

        _globalLevel = type;

        return this;
    };

    /**
     * Выведет модальное окно для изменения настроек игры
     */
    Battlefield.prototype.updateConfig = function () {
        var self = this;

        var contentHtml =
            '<table class="bf-config">' +
            '   <tr>' +
            '       <td class="name top">Уровень сложности:</td>' +
            '       <td class="options" id="config_level">' +
            '           <button class="btn ' + (_globalLevel == "easy" ? "active" : "") + '" value="easy">Легкий</button>' +
            '           <button class="btn ' + (_globalLevel == "middle" ? "active" : "") + '" value="middle">Средний</button>' +
            '           <button class="btn ' + (_globalLevel == "hard" ? "active" : "") + '" value="hard">Сложный</button>' +
            '           <button class="btn rg ' + (_globalLevel == "user" ? "active" : "") + '" value="user">Настроить</button>' +
            '       </td>' +
            '   </tr>' +
            '   <tr><td colspan="2"><div class="border"></div></td></tr>' +

            '   <tr>' +
            '       <td class="name">Размер поля:</td>' +
            '       <td class="options no-label" id="opt-fsize">' +
            '           <label class="no-act" data-type="h">Горизонтально: <input type="number" id="type-h" min="10" max="25" value="15" disabled></label>' +
            '           <label class="no-act" data-type="v">Вертикально: <input type="number" id="type-v" min="10" max="25" value="15" disabled></label>' +
            '       </td>' +
            '   </tr>' +

            '   <tr>' +
            '       <td class="name">Корабли на поле</td>' +
            '       <td class="options no-label" id="opt-fbarrier">' +
            '           <label class="no-act">6&nbsp;&nbsp;/ <input type="number" id="bar_6" bar="6" value="1" min="0" max="6" disabled /></label>' +
            '           <label class="no-act">5&nbsp;&nbsp;/ <input type="number" id="bar_5" bar="5" value="2" min="0" max="6" disabled /></label>' +
            '           <label class="no-act">4&nbsp;&nbsp;/ <input type="number" id="bar_4" bar="4" value="3" min="0" max="6" disabled /></label>' +
            '           <label class="no-act">3&nbsp;&nbsp;/ <input type="number" id="bar_3" bar="3" value="4" min="0" max="6" disabled /></label>' +
            '           <label class="no-act">2&nbsp;&nbsp;/ <input type="number" id="bar_2" bar="2" value="5" min="0" max="6" disabled /></label>' +
            '           <label class="no-act">1&nbsp;&nbsp;/ <input type="number" id="bar_1" bar="1" value="6" min="0" max="6" disabled /></label>' +
            '       </td>' +
            '   </tr>' +

            '</table>';
        contentHtml = '<form>' + contentHtml + '</form>';

        var newLevel = _globalLevel;

        h.modalWindow(h.getMessage('options'), contentHtml, [{
                elValue: h.getMessage('new_game'),
                onClick: function (modal) {
                    modal.close();

                    try {
                        if (newLevel == 'user') {
                            var nOpt = getUserOptions();

                            options.fSize = nOpt.fSize;
                            options.fBarrier = nOpt.fBarrier;

                            _globalLevel = newLevel;
                        } else {
                            if (newLevel.length > 0 && newLevel != _globalLevel)
                                self.setLevel(newLevel);
                        }

                        self.run();
                    } catch (err) {
                        h.showExceptions(err);
                    }
                }
            },{
                elValue: h.getMessage('set_default_params'),
                elClass: 'btn-warning',
                onClick: function (modal) {
                    modal.close();

                    self.setLevel('middle');
                    self.run();
                }
            },{
                elValue: h.getMessage('close'),
                elClass: 'btn-danger',
                onClick: function (modal) {
                    modal.close();
                }
            }
        ]);

        var table = document.querySelector('.bf-config');
        var btnList = document
            .getElementById('config_level')
            .querySelectorAll('button');

        activeFormOptions(_globalLevel == 'user');
        echoOptions(options);

        // выбор уровня сложности
        btnList.forEach(function (btn) {
            btn.onclick = function (env) {

                newLevel = env.target.value;

                btnList.forEach(function (b) {
                    b.classList.remove('active');
                });
                env.target.classList += ' active';

                if (newLevel == 'user') {
                    activeFormOptions(true);
                } else {
                    activeFormOptions(false);
                    echoOptions(self.getLevel(newLevel));
                }

                return false;
            }
        });

        // private method....................
        // ..................................

        // активирует форму для ввода пользовательских настроек
        function activeFormOptions(active) {
            // размер игрового поля
            table.querySelector('#opt-fsize').querySelectorAll('label')
                .forEach(function (label) {
                    var input = label.querySelector('input');

                    if (active) {
                        label.classList = '';
                        input.disabled = false;
                    } else {
                        label.classList = 'no-act';
                        input.disabled = true;
                    }
                });

            // корабли на поле
            table.querySelector('#opt-fbarrier').querySelectorAll('label')
                .forEach(function (label) {
                    var input = label.querySelector('input');

                    if (active) {
                        label.classList = '';
                        input.disabled = false;
                    } else {
                        label.classList = 'no-act';
                        input.disabled = true;
                    }
                });
        }

        // вернет настройки пользователя
        function getUserOptions() {
            var nOptions = {
                fSize: {h: 0, v: 0},
                fBarrier: []
            };

            // размер игрового поля
            nOptions.fSize.h = parseInt(table.querySelector('input#type-h').value);
            nOptions.fSize.v = parseInt(table.querySelector('input#type-v').value);

            // корабли на игровом поле
            table.querySelector('#opt-fbarrier').querySelectorAll('label')
                .forEach(function (label) {
                    var input = label.querySelector('input'),
                        ship = parseInt(input.getAttribute('bar')),
                        ctn = parseInt(input.value);

                    if (ctn > 0)
                        nOptions.fBarrier.push([ship, ctn]);
                });

            return nOptions;
        }

        // напечатает переданные настройки
        function echoOptions(nOptions) {
            // размер игрового поля
            table.querySelector('input#type-h').value = nOptions.fSize.h;
            table.querySelector('input#type-v').value = nOptions.fSize.v;

            // корабли на игровом поле
            table.querySelector('#opt-fbarrier').querySelectorAll('input').forEach(function (input) {
                input.value = 0;
            });

            nOptions.fBarrier.forEach(function (barrier) {
                var ship = barrier[0],                              // кол-во палуб корабля
                    ctn = barrier[1];                               // кол-во кораблей

                table.querySelector('#opt-fbarrier').querySelector('input#bar_' + ship).value = ctn;
            });
        }
    };

    /**
     * Класс для создания игрового поля
     *
     * Требуется:
     *      options = {}        - глобальный объект с опциями игры
     *      h = {}              - глобальный обьект функций помошников
     *
     * @constructor
     */
    function Field() {
        if (options.fSize.h < 10 || options.fSize.h > 25 || options.fSize.v < 10 || options.fSize.v > 25)
            throw new RangeError(h.getMessage('err_size_field'));

        if (!(options.fBarrier instanceof Array) || options.fBarrier.length < 1)
            throw new RangeError(h.getMessage('err_barrier'));

        this.fields = [];
        this.fName = [options.player.kUser, options.player.kBrain];

        for (var player in options.player) {                        // создание игровых полей
            var fKey = options.player[player];

            var field = new Array(options.fSize.v);
            for (var i = 0; i < options.fSize.v; i++) {
                field[i] = new Array(options.fSize.h);

                for (var j = 0; j < options.fSize.h; j++)
                    field[i][j] = options.tPoint.DEF;
            }

            this.fields[fKey] = field;
        }
    }

    /**
     * Устанавливает корабли на игровое поле
     *
     * @returns {Array}
     */
    Field.prototype.setBarrier = function () {
        var self = this,
            maxIteration = this.fName.length * 100;

        this.fName.forEach(function (fKey) {                        // на каждое игровое поле ставим по отдельности
            var field = self.fields[fKey];

            options.fBarrier.forEach(function (ship) {              // перебираем типы кораблей
                var cell = ship[0],                                 // кол-во палуб
                    ctn = ship[1];                                  // кол-во штук

                for (var c = 0; c < ctn; c++)                       // устанавливаем по одному
                    field = shipInField(cell, field);
            });

            self.fields[fKey] = field;
        });

        return this.fields;                                         // игровые поля с кораблями


        // private method....................
        // ..................................

        // установит корабль на игровое поле
        function shipInField(cell, field) {
            if (maxIteration > 0) maxIteration--;                   // от зацикливания рекурсии
            else throw new RangeError(h.getMessage('err_max_iteration'));

            var sPoint = [],                                        // массив точек для размещения корабля
                x = h.rand(0, options.fSize.v - 1),                 // случайная координата начала установки
                y = h.rand(0, options.fSize.h - 1);

            var posHorizontal = h.rand(1, 2) % 2;                   // случайное направление, горизонтально/вертикально

            for (var i = 0; i < cell; i++) {                        // перебор палуб
                var pX = x, pY = y;

                if (posHorizontal) pX = x + i;                      // направление корабля
                else pY = y + i;

                if (checkPoint(pX, pY, field))                      // если точка свободна, сохраняем ее
                    sPoint.push([pX, pY]);
                else return shipInField(cell, field);               // перезапуск
            }

            // сюда дайдет если только все точки доступны для размещения
            sPoint.forEach(function (point) {                       // точки которые можно нанести на карту
                var x = point[0],
                    y = point[1];

                field[x][y] = options.tPoint.BAR;
            });

            return field;                                           // вернем карту с размещенным кораблем
        }

        // проверяет выбранную точку + ее окружение
        function checkPoint(x, y, field) {
            var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
                pX = 0, pY = 0;
            var sX = options.fSize.v - 1,
                sY = options.fSize.h - 1;

            if (x < 0 || x > sX || y < 0 || y > sY)                 // исходная точка в рамках игрового поля
                return false;

            if (field[x][y] !== options.tPoint.DEF)                 // точка свободна
                return false;

            for (var i = 0; i < cP.length; i++) {                   // перебор соседних точек
                pX = x + cP[i][0];
                pY = y + cP[i][1];

                if (pX >= 0 && pX <= sX && pY >= 0 && pY <= sY) {   // сеседние точки могут быть за гранью поля
                    if (field[pX][pY] != options.tPoint.DEF)        // но не могут быть заняты другим кораблем
                        return false;
                }
            }

            return true;                                            // если все условия проверки пройдены, можно ставить
        }
    };

    /**
     * Запускает алгоритмы обстрела игроками поля боя
     *
     * Требуется:
     *      options = {}        - глобальный объект с опциями игры
     *      h = {}              - глобальный обьект функций помошников
     *
     * @param fields            - обьект массивов игровых поле
     * @param battlefield       - экземпляр Battlefield
     * @constructor
     */
    function Battle(fields, battlefield) {
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

    Battle.prototype = Object.create(GameUI.prototype);             // наследование

    /**
     * Осуществляет переход хода
     *
     * @param fKey              - строковый ключ игрока
     */
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

    /**
     * Ход игрока,
     * ожидает событие клика по игровому полю
     */
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

    /**
     * Ход компьютера,
     * в зависимости от попадания по кораблю противника будет
     * добивать корабль или стрелять по случайной клетке
     *
     * @param fKey              - строковый ключ игрока
     */
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

    /**
     * Осуществляет выстрел по игровому полю
     *
     * @param point             - массив 2 элементов с точкой на игровом поле
     * @param fKey              - строковый ключ игрока
     */
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

    /**
     * Класс управления пользовательским интерфейсом
     *
     * Требуется:
     *      options = {}        - глобальный объект с опциями игры
     *      h = {}              - глобальный обьект функций помошников
     *
     * @param htmlSelector      - document.querySelector
     * @constructor
     */
    function GameUI(fields, battlefield) {
        if (options.htmlSelector == null)
            throw new Error(h.getMessage('err_invalid_selector'));

        this.fields = fields;
        this.battlefield = battlefield;

        var self = this;
        var playerName =
            '<div class="left">' +
            '   <a href="#">Battlefield</a>' +
            '</div>' +
            '<div class="right">' +
            '   <span class="js" id="new_game">' + h.getMessage('new_game') + '</span>' +
            '   <span class="js" id="config">' + h.getMessage('options') + '</span>' +
            '</div>';

        // очистка блока
        options.htmlSelector.innerHTML = '';

        // имена игроков
        if (options.printName) {
            var echoTotal = options.winner.kUser + options.winner.kBrain != 0;
            playerName +=
                '<div class="center">' +
                '<span class="name" id="' + options.player.kUser + '">' + h.getPlayerName(options.player.kUser) + '</span>' +
                (echoTotal ? '<span class="total" id="' + options.player.kUser + '">' + options.winner.kUser + '</span>' : '') +
                '<span>&</span>' +
                (echoTotal ? '<span class="total" id="' + options.player.kBrain + '">' + options.winner.kBrain + '</span>' : '') +
                '   <span class="name" id="' + options.player.kBrain + '">' + h.getPlayerName(options.player.kBrain) + '</span>' +
                '</div>';
        }

        this.nameHtml = document.createElement('div');
        this.nameHtml.setAttribute('class', 'bf-player-name');
        this.nameHtml.innerHTML = playerName;
        options.htmlSelector.appendChild(this.nameHtml);

        // игровые поля
        this.fieldHtml = document.createElement('div');
        this.fieldHtml.setAttribute('class', 'bf-fields');
        this.fieldHtml.innerHTML = this.getFieldHTML(options.player);
        options.htmlSelector.appendChild(this.fieldHtml);

        // логирование боя
        if (options.printLog) {
            var filter =
                '<div class="bf-filter no-active">' +
                '   <b>' + h.getMessage('filter') + ':</b>' +
                '   <span class="js" id="' + options.player.kUser + '">' + h.getPlayerName(options.player.kUser) + '</span>' +
                '   <span class="js" id="' + options.player.kBrain + '">' + h.getPlayerName(options.player.kBrain) + '</span>' +
                '   <span class="js active" id="full">' + h.getMessage('full') + '</span>' +
                '</div>';

            this.logFilter = null;
            this.actFilter = '';

            this.logHtml = document.createElement('div');
            this.logHtml.setAttribute('class', 'bf-logger');
            this.logHtml.innerHTML = '<h2>' + h.getMessage('info_log_title') + filter + '</h2><ul></ul>';
            options.htmlSelector.appendChild(this.logHtml);
        }


        document.getElementById('new_game').onclick = function () {
            self.battlefield.run();
        };
        document.getElementById('config').onclick = function () {
            self.battlefield.updateConfig();
        };

    }

    /**
     * Вернет HTML разметку игрового поля
     *
     * @param player            - строковый ключ игрока
     * @returns {string}
     */
    GameUI.prototype.getFieldHTML = function (player) {
        var fields = this.fields,
            html = '';

        for (var k in player) {
            var fKey = player[k],
                dopAttr = fKey == options.player.kUser ? 'lf' : 'rg',
                printShip = dopAttr == 'lf';

            html += '<div class="board ' + dopAttr + '">';
            html += getFieldTable(fKey, printShip);
            html += getBarrierInfo(fKey);
            html += '</div>';
        }

        return html;


        // private method....................
        // ..................................

        // вернет HTML игрового поля
        function getFieldTable(fKey, printShip) {
            printShip = printShip || false;
            var table = '';

            table += '<table class="field" id="' + fKey + '">';
            for (var x = 0; x < options.fSize.v; x++) {
                table += '<tr>';
                for (var y = 0; y < options.fSize.h; y++) {
                    var mm = '', ll = '';

                    // установка маркеров
                    if (options.fMarker !== false && typeof options.fMarker == 'object') {
                        var txtMM = typeof options.fMarker.h != 'undefined' ? (options.fMarker.h == 'char' ? h.getLetter(y) : (y + 1)) : (y + 1),
                            txtLL = typeof options.fMarker.v != 'undefined' ? (options.fMarker.v == 'char' ? h.getLetter(x) : (x + 1)) : (x + 1);

                        mm = x === 0 ? '<div class="mm">' + txtMM + '</div>' : '';
                        ll = y === 0 ? '<div class="ll">' + txtLL + '</div>' : '';
                    }

                    var ship = '';
                    if (printShip)
                        ship = fields[fKey][x][y] == options.tPoint.BAR ? ' let' : '';
                    table += '<td>' + mm + ll + '<div class="box' + ship + '"></div></td>';
                }
                table += '</tr>';
            }
            table += '</table>';

            return table;
        }

        // вернет HTML списка кораблей
        function getBarrierInfo(fKey) {
            var html = '';

            options.fBarrier.forEach(function (ship) {
                var box = '';
                for (var c = 0; c < ship[0]; c++)
                    box += '<div class="box"></div>';
                html +=
                    '<div class="let" id="cell_' + ship[0] + '">' +
                    '   <span data-ctn="' + ship[1] + '">x' + ship[1] + '</span>' +
                    '   ' + box +
                    '</div>';
            });

            return '<div class="list-let" id="' + fKey + '">' + html + '</div>';
        }
    };

    /**
     * Оповещает пользователя о переходе хода,
     * блокирует игровое поле ожидающего
     *
     * @param fKey              строковый ключ игрока
     * @returns {*}
     */
    GameUI.prototype.showProgress = function (fKey) {
        // в конце игры, блокируем игровые поля и убираем метку активности с имени
        if (!fKey) {
            this.fieldHtml.querySelectorAll('table.field').forEach(function (table) {
                table.classList.add('timeout');
            });

            if (options.printName) {
                this.nameHtml.querySelectorAll('.name').forEach(function (span) {
                    span.classList.remove('act');
                });
            }
            return false;
        }

        // делаем игровое поле неактивным
        this.fieldHtml.querySelectorAll('table.field.timeout').forEach(function (table) {
            table.classList.remove('timeout');
        });
        this.fieldHtml.querySelector('table.field#' + fKey).classList.add('timeout');

        if (!options.printName)
            return null;

        // ставим метку к кому перешел ход
        this.nameHtml.querySelectorAll('.name').forEach(function (span) {
            span.classList.remove('act');
        });
        this.nameHtml.querySelector('.name#' + fKey).classList.add('act');
    };

    /**
     * Вешает событие ожидания клика по игровому полю
     *
     * @param fKey              - строковый ключ игрока
     * @param callback          - фукция
     */
    GameUI.prototype.clickToField = function (fKey, callback) {
        this.fieldHtml.querySelector('table.field#' + fKey).onclick = callback;
    };

    /**
     * Печатает маркер на игровом поле
     *
     * @param point             - точка в формате [x, y]
     * @param fKey              - строковый ключ игрока
     * @param tPoint            - тип точки
     * @param auto              - автоматическая точка
     * @returns {null}
     */
    GameUI.prototype.setMarker = function (point, fKey, tPoint, auto) {
        var X = point[0],
            Y = point[1],
            elClass = '';
        auto = auto || false;

        switch (tPoint) {
            case (options.tPoint.NUL):                              // мимо
                elClass = auto ? 'auto-null' : 'null';
                break;
            case (options.tPoint.KIL):                              // ранил
                elClass = 'kill';
                break;
            case (options.tPoint.KIL + '_death'):                   // убил
                elClass = 'kill';
                break;
            default:
                return null;
        }

        if (!auto) this.printLog(point, fKey, tPoint);

        var coll = this.fieldHtml.querySelector('table.field#' + fKey)
            .rows[X].cells[Y];
        coll.querySelector('.box').className += ' ' + elClass;

        if (!auto) {
            var shotBox = document.createElement('div');
            shotBox.setAttribute('class', 'shot');
            coll.appendChild(shotBox);

            h.animateOpacity(shotBox, 2000);
        }
    };

    /**
     * Ставит точки подсказки по углам от подбитого корабля
     *
     * @param point             - точка в формате [x, y]
     * @param fKey              - строковый ключ игрока
     * @param callback          - фукция запускается после установки точки
     * @returns {boolean}
     */
    GameUI.prototype.setHelpMarker = function (point, fKey, callback) {
        if (!options.printHelp)
            return false;

        var sP = [[-1, -1], [1, -1], [1, 1], [-1, 1]],
            X = point[0], Y = point[1];

        for (var i = 0; i < sP.length; i++) {
            var nX = X + sP[i][0],
                nY = Y + sP[i][1];

            if (nX >= 0 && nX < options.fSize.v && nY >= 0 && nY < options.fSize.h) {
                this.setMarker([nX, nY], fKey, options.tPoint.NUL, true);
                if (typeof callback == 'function')
                    callback([nX, nY], fKey);
            }
        }
    };

    /**
     * Информирует пользователя об оставшихся кораблях на игровом поле
     *
     * @param ctnCell           - массив точек убитого корабля
     * @param fKey              - строковый ключ игрока
     */
    GameUI.prototype.shipInfoMap = function (ctnCell, fKey) {
        var count = ctnCell.length;

        var letBox = this.fieldHtml
            .querySelector('.list-let#' + fKey)
            .querySelector('#cell_' + count);

        var span = letBox.querySelector('span'),
            dCtn = parseInt(span.getAttribute('data-ctn')) - 1;

        span.setAttribute('data-ctn', dCtn);
        span.innerHTML = 'x' + dCtn;

        var shot = document.createElement('div');
        shot.setAttribute('class', 'shot');
        span.appendChild(shot);

        h.animateOpacity(shot, 3000);

        // если кораблей такова типа больше нет
        if (dCtn == 0) {
            letBox.querySelectorAll('div').forEach(function (box) {
                box.className += ' kill';                           // ставим метку убит
            });
        }

        // если корабль убит, делаем его крассным
        var table = this.fieldHtml.querySelector('.field#' + fKey);
        ctnCell.forEach(function (ship) {
            var X = ship[0],
                Y = ship[1];

            table.rows[X].cells[Y]
                .querySelector('.box')
                .className += ' death';
        });
    };

    /**
     * Ведет журнал боя,
     * так же запускает фильтр журнала и подсветку точек на игром поле при наведении на запись
     *
     * @param point             - точка выстрела в формате [x, y]
     * @param fKey              - строковый ключ игрока
     * @param tPoint            - тип попадания
     * @returns {boolean}
     */
    GameUI.prototype.printLog = function (point, fKey, tPoint) {
        if (!options.printLog)
            return false;

        var self = this;

        var html = '',
            X = point[0], Y = point[1];

        var tPoint_class = '',
            tPoint_name = '';

        var player = fKey == options.player.kUser
                ? h.getPlayerName(options.player.kBrain) : h.getPlayerName(options.player.kUser),
            __date = new Date(),
            time = __date.toLocaleTimeString(),
            marker = '';

        switch (tPoint) {
            case (options.tPoint.KIL):
                tPoint_class = 'war';
                tPoint_name = 'log_kill';
                break;
            case (options.tPoint.KIL + '_death'):
                tPoint_class = 'kil';
                tPoint_name = 'log_death';
                break;
            case (options.tPoint.NUL):
                tPoint_class = 'nul';
                tPoint_name = 'log_past';
                break;
        }

        marker += options.fMarker.v == 'char' ? h.getLetter(X) : (X + 1);
        marker += "x";
        marker += options.fMarker.h == 'char' ? h.getLetter(Y) : (Y + 1);

        html +=
            '<span class="point">' + marker + '</span>' +
            '<span class="type ' + tPoint_class + '">' + h.getMessage(tPoint_name) + '</span>' +
            '<span class="name">' + player + '</span>' +
            '<span class="time">' + time + '</span>';

        var li = document.createElement('li');
        li.setAttribute('id', fKey);
        li.setAttribute('data-x', X);
        li.setAttribute('data-y', Y);

        if (this.actFilter == fKey)
            li.setAttribute('class', 'no-active');

        li.innerHTML = html;

        this.logHtml.querySelector('ul').insertBefore(li, this.logHtml.querySelector('ul').firstChild);

        // при наведении на лог, подсветка точки игрового поля
        li.onmouseover = function (event) {
            if (event.target.nodeName != 'LI')
                return false;

            var fKey = event.target.getAttribute('id'),         // event.target.dataset.fkey,
                X = event.target.getAttribute('data-x'),        // event.target.dataset.x,
                Y = event.target.getAttribute('data-y');        // event.target.dataset.y;

            var td = self.fieldHtml.querySelector('.field#' + fKey).rows[X].cells[Y],
                shot = document.createElement('div');

            shot.setAttribute('class', 'shot');
            td.appendChild(shot);

            li.onmouseout = function () {
                h.animateOpacity(shot, 1000);
            };
        };

        // фильт журнала
        if (this.logFilter == null) {
            this.logFilter = this.logHtml.querySelector('.bf-filter');
            this.logFilter.classList = 'bf-filter';

            var activeFilter = this.logFilter.querySelector('#full');
            this.logFilter.querySelectorAll('span').forEach(function (span) {
                span.onclick = function (event) {
                    if (activeFilter == event.target)
                        return false;

                    if (activeFilter)
                        activeFilter.classList.remove('active');

                    self.actFilter = event.target.getAttribute('id');

                    activeFilter = event.target;
                    activeFilter.classList.add('active');

                    self.logHtml.querySelectorAll('li').forEach(function (li) {
                        li.classList = self.actFilter == li.getAttribute('id') ? 'no-active' : '';
                    });
                }
            })
        }
    };

    /**
     * Показывает корабли на игровом поле
     *
     * @param fKey              - строковый ключ игрока
     */
    GameUI.prototype.showShip = function (fKey) {
        var field = this.fields[fKey],
            table = this.fieldHtml.querySelector('table#' + fKey);

        for (var X = 0; X < field.length; X++) {
            for (var Y = 0; Y < field[X].length; Y++)
                if (field[X][Y] == options.tPoint.BAR) {
                    table
                        .rows[X].cells[Y]
                        .querySelector('.box')
                        .className += ' let';
                }
        }
    };

    /**
     * Оповещает пользователя об окончании игры,
     * выводит модальное окно
     *
     * @param winner            - строковый ключ игрока, победителя
     */
    GameUI.prototype.gameOver = function (winner) {
        var self = this,
            kWinner = options.player.kUser == winner ? 'kUser' : 'kBrain';
        var title = '',
            elClass = '',
            message = '';

        // счетчик побед...
        options.winner[kWinner]++;

        if (options.player.kUser == winner) {
            elClass = 'winner';
            title = h.getMessage('you_winner');
            message = h.getMessage('info_winner');
        } else {
            this.showShip(winner);

            elClass = 'lose';
            title = h.getMessage('you_lose');
            message = h.getMessage('info_loser');
        }

        var contentHtml =
            '<div class="bf-go-smile ' + elClass + '"></div>' +
            '<div class="bf-go-text">' +
            '   <h2>' + title + '</h2>' +
            '   <h3>' + message + '</h3>' +
            '</div>';

        // выводит модальное окно с опциями
        h.modalWindow(h.getMessage('game_over'), contentHtml, [{
            elValue: h.getMessage('new_game'),
            onClick: function (modal) {
                modal.close();
                self.battlefield.run();
            }
        }, {
            elValue: h.getMessage('update_options'),
            elClass: 'btn-warning',
            onClick: function (modal) {
                modal.close();
                self.showProgress(false);
                self.battlefield.updateConfig();
            }
        }, {
            elValue: h.getMessage('close'),
            elClass: 'btn-danger',
            onClick: function (modal) {
                modal.close();
                self.showProgress(false);
            }
        }]);
    };

    // глобальный класс модуля
    var h = {
        /**
         * имена играков по умолчанию
         */
        playerName: {
            def: {
                kUser: 'Игрок', kBrain: 'Компьютер'
            }
        },

        /**
         * Вернет случайное число в интервале
         *
         * @param min           - по умолчанию: 0
         * @param max           - по умолчанию: 100
         * @returns {Number}
         */
        rand: function (min, max) {
            min = min || 0;
            max = max || 100;

            return parseInt(Math.random() * (max - min + 1) + min);
        },

        /**
         * Вернет буквку англ.алфавита по номеру.
         * Если номер больше кол-ва букв, к результату будет прибавлена цифра
         *
         * @param key
         * @param operand
         * @returns {*}
         */
        getLetter: function (key, operand) {
            var operand = operand || '',
                alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (key > alphabet.length)
                return this.getLetter(key - alphabet.length, (operand == '' ? 1 : operand + 1));

            return alphabet[key] + operand;
        },

        /**
         * Перемешает массив случайным образом
         *
         * @param arr           - массив
         * @returns {*}
         */
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

        /**
         * Интернализация
         *
         * @param type
         * @returns {*}
         */
        getMessage: function (type) {
            var mess = {
                start_game: 'Начать игру',
                new_game: 'Новая игра',
                game_over: 'Игра закончена',
                you_lose: 'Ты проиграл',
                you_winner: 'Ты выиграл',
                options: 'Настройки',
                update_options: 'Изменить настройки',
                close: 'Закрыть',
                update_page: 'Обновить страницу',
                set_default_params: 'Настройки по умолчанию',
                save: 'Сохранить',
                filter: 'Фильтр',
                full: 'Все',

                log_kill: 'ранил',
                log_death: 'убил',
                log_past: 'мимо',

                // error
                err_invalid_selector: 'Указанный HTML блок на странице не найден',
                err_max_iteration: 'Не получилось установить корабли на игровое поле, измените настройки',
                err_invalid_player: 'Неизвестный игрок',
                err_invalid_field: 'Некорректное игровое поле',
                err_player_name: 'Переданны не корректные ключи играков',
                err_size_field: 'Игровое поле не должно быть меньше 10х10 или больше 25х25, измените настройки',
                err_barrier: 'Не корректный список кораблей',
                err_invalid_level: 'Указан несуществующий уровень сложности',

                // info
                info_log_title: 'Состояние игрового поля',
                info_title_error: 'Критическая ошибка',
                info_title_range_error: 'Некорректные настройки',
                info_winner: 'Замечательная победа,<br>попробуешь еще?',
                info_loser: 'В следующий раз повезет больше,<br>попробуешь еще?'
            };

            return typeof mess[type] == 'string' && mess[type].length > 0 ? mess[type] : type;
        },

        /**
         * Вернет строковое имя игрока
         *
         * @param fKey          - строковый ключ игрока
         * @returns {*}
         */
        getPlayerName: function (fKey) {
            var key = fKey == options.player.kUser ? 'kUser' : 'kBrain';
            return this.playerName.def[key];
        },

        /**
         * Ловит сообщение об ошибке
         *
         * @param err
         */
        showExceptions: function (err) {
            var title = '',
                content = '',
                button = [];

            switch (err.name) {
                case ('Error'):
                    title = h.getMessage('info_title_error');
                    content = err.message;
                    button = [{
                        elValue: h.getMessage('set_default_params'),
                        onClick: function (modal) {
                            modal.close();
                            var b = new Battlefield(options.htmlSelector, options);
                            b.setLevel('middle').run();
                        }
                    }];
                    break;
                case ('RangeError'):
                    title = h.getMessage('info_title_range_error');
                    content = err.message;
                    button = [{
                        elValue: h.getMessage('update_options'),
                        onClick: function (modal) {
                            modal.close();
                            var b = new Battlefield(options.htmlSelector, options);
                            b.updateConfig();
                        }
                    },{
                        elValue: h.getMessage('set_default_params'),
                        elClass: 'btn-warning',
                        onClick: function (modal) {
                            modal.close();
                            var b = new Battlefield(options.htmlSelector, options);
                            b.setLevel('middle').run();
                        }
                    }];
                    break;
                default:
                    title = err.name;
                    content = err.message;
            }

            this.modalWindow(title, content, button);
        },

        /**
         * Выводит модальное окно, автоматически установит по середине страницы
         *
         * ~~~~
         * h.modalWindow(
         *  'title modal window',
         *  '<b>Content</b> modal',
         *  [{
         *      elClass: 'btn-success',                 // css класс будет добавлен к кнопке
         *      elValue: 'Button close',                // значение кнопки
         *      onClick: function (modal, event) {}     // событие клика по кнопке
         *  }]
         * )
         * ~~~~
         *
         * @param title         - заголовок
         * @param contentHTML   - html содержимое
         * @param button        - массив обьектов кнопок модального окна
         */
        modalWindow: function (title, contentHTML, button) {
            var modal = {
                font: false,
                window: false,

                construct: function () {
                    this.createHTML().autoPosition();

                    if (!(button instanceof Array) || button.length == 0) {
                        this.window.querySelector('.footer').style.display = 'none';
                        return false;
                    }

                    var footer = this.window.querySelector('.footer'),
                        on = [];

                    for (var i = 0; i < button.length; i++) {
                        var btn = button[i],
                            dopClass = typeof button[i].elClass == 'string' ? ' ' + btn.elClass : '';

                        on[i] = document.createElement('button');
                        on[i].setAttribute('class', 'btn' + dopClass);
                        on[i].setAttribute('id', 'btn_' + i);
                        on[i].innerHTML = btn.elValue;
                        on[i].addEventListener('click', eventListener(i, button), false);

                        footer.appendChild(on[i]);
                    }
                },
                createHTML: function () {
                    var _font = document.querySelector('.bf-modal-font'),
                        _window = document.querySelector('.bf-modal-window');
                    if (_font != null) document.body.removeChild(_font);
                    if (_window != null) document.body.removeChild(_window);


                    this.font = document.createElement('div');
                    this.font.setAttribute('class', 'bf-modal-font');

                    this.window = document.createElement('div');
                    this.window.setAttribute('class', 'bf-modal-window');
                    this.window.innerHTML =
                        '<div class="content">' +
                        '   <div class="header">' + title + '</div>' +
                        '   <div class="cont">' + contentHTML + '</div>' +
                        '   <div class="footer"></div>' +
                        '</div>';

                    document.body.appendChild(this.font);
                    document.body.appendChild(this.window);

                    return this;
                },
                autoPosition: function () {
                    var wid2 = this.window.clientWidth / 2,
                        hei2 = this.window.clientHeight / 2;

                    this.window.style.marginTop = hei2 * (-1) + 'px';
                    this.window.style.marginLeft = wid2 * (-1) + 'px';
                },
                close: function () {
                    document.body.removeChild(this.font);
                    document.body.removeChild(this.window);
                }
            };

            modal.construct();


            // private method....................
            // ..................................

            // вешает событие на кнопку в модальном окне
            function eventListener(i, obj) {
                return function (event) {
                    if (typeof obj[i].onClick == 'function')
                        obj[i].onClick(modal, event);
                };
            }
        },

        /**
         * Запускает анимацию плавного исчезновения со страницы
         *
         * @param element       - document элемент
         * @param time          - кол-во сек.через которое элемент исчезнет со страницы
         */
        animateOpacity: function (element, time) {
            element.style.opacity = 1;
            var t = setInterval(function () {
                element.style.opacity = element.style.opacity - (100 / (time / 0.1));
                if (element.style.opacity <= 0) {
                    clearInterval(t);
                    try {
                        element.parentNode.removeChild(element);
                    } catch (e) { }
                }
            }, 1);
        }
    };
   
   window.Battlefield = Battlefield;   
})(window);

(function (d, w, c) {
    (w[c] = w[c] || []).push(function () {
        try {
            w.yaCounter42568409 = new Ya.Metrika({
                id: 42568409,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true
            });
        } catch (e) {
        }
    });

    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () {
            n.parentNode.insertBefore(s, n);
        };
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else {
        f();
    }
})(document, window, "yandex_metrika_callbacks");
