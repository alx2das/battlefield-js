;(function (global) {
    'use strict';

    var __instances = {};

    var options = {},
        _defaultPublik = {
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
                v: 'string'
            },
            helpPoint: true
        },
        _defaultPrivate = {
            fName: ['FUser', 'FBrain'],
            tPoint: {
                DEF: 0,
                BAR: 1,
                KIL: 2,
                NUL: 3
            }
        };

    var ui,
        fList = {};


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
            for (var key in _defaultPublik)
                options[key] = config.hasOwnProperty(key) ? config[key] : _defaultPublik[key];
            options = Object.assign(options, _defaultPrivate);
        }
        else options = Object.assign(_defaultPublik, _defaultPrivate);
    }

    /**
     * Инициализирует запуск игры.
     * @returns {?null}
     */
    Battlefield.prototype.run = function () {
        try {
            ui = new GameUI(options);
            document.querySelector(options.containerField).innerHTML = '';

            var F = new Field({
                fName: options.fName,
                fSize: options.fSize,
                fBarrier: options.fBarrier,
                tPoint: options.tPoint
            });

            var fields = F
                .createField()
                .setBarrier(function(field, fKey){
                    ui.createFieldHTML(field, fKey);
                });

            new Battle(fields, options);

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
    function Battle(fields, options) {
        console.log("\n>\tИгра создана! Начинаем бомбить!");
    }

    Battle.prototype.game = function (player) {

    };

    Battle.prototype.playerShot = function () {

    };

    Battle.prototype.AIShot = function (fKey) {

    };

    Battle.prototype.shot = function (point, fKey) {

    };


    // *****************************************************************************************************************
    function GameUI(conf) {
        for (var opt in conf)
            this[opt] = conf[opt];

        this.containerField = document.querySelector(this.containerField);
        this.containerLog = document.querySelector(this.containerLog);
        this.containerStatus = document.querySelector(this.containerStatus);

        this.posLeft = true;

        this.defaultHTML();
    }

    GameUI.prototype.defaultHTML = function () {

    };

    /**
     * Печатает таблицу игрового поля на страницу.
     * Поля должны передаваться по одному, с ключем. Устанавливает первым левый, потом правый.
     *
     * @param field {?array}
     * @param fKey {?string}
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

                    if (self.marker !== false && typeof self.marker == 'object') {
                        var txtMM = typeof self.marker.v != 'undefined' ? (self.marker.v != 'string' ? h.getLetter(y) : (y + 1)) : (y + 1),
                            txtLL = typeof self.marker.h != 'undefined' ? (self.marker.h != 'string' ? h.getLetter(x) : (x + 1)) : (x + 1);

                        mm = x == 0 ? '<div class="mm">' + txtMM + '</div>' : '';
                        ll = y == 0 ? '<div class="ll">' + txtLL + '</div>' : '';
                    }

                    var ship = _ship ? (field[x][y] == self.tPoint.BAR ? ' let' : '') : '';
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

            self.fBarrier.forEach(function (ship) {
                var box = '',
                    cell = ship[0],
                    ctn = ship[1];

                for (var c = 0; c < cell; c++)
                    box += '<div class="box"></div>';

                str += '<div class="let"><span>x' + ctn + '</span>' + box + '</div>';
            });

            return '<div class="list-let">' + str + '</div>';
        }
    };

    GameUI.prototype.setFullBarrier = function () {

    };

    GameUI.prototype.setMarker = function (points, type, fKey, auto) {

    };

    GameUI.prototype.setHelpMarker = function (point, fKey) {

    };

    GameUI.prototype.printLog = function () {

    };


    // *****************************************************************************************************************
    var h = {
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
                error_max_iterations: 'Чего то я залип в рекурсии, может стоит изменить параметры??'
            };

            return mess[type];
        },

        // dev
        printFieldsConsole: function (field) {
            var str = '';

            for (var i = 0; i < field.length; i++) {
                for (var j = 0; j < field[i].length; j++) {
                    str += field[i][j] + '\t';
                }
                str += '\n';
            }

            console.log(str);
        }
    };

    global.Battlefield = Battlefield;
})(this);