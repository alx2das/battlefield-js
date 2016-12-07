;(function (global) {
    'use strict';

    var __instances = {};

    var opt = {},
        __default = {
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
            helpPoint: true
        },
        __config = {
            fName: ['FUser', 'FBrain'],
            tPoint: {
                DEF: 0,
                BAR: 1,
                KIL: 2,
                NUL: 3
            }
        };

    var ui = {};
    var fields = {};

    var Battlefield = function (config) {

        if (__instances instanceof Battlefield)
            return __instances;
        __instances = this;


        if (typeof config == 'object') {
            for (var k in __default)
                opt[k] = config.hasOwnProperty(k) ? config[k] : __default[k];
            opt = Object.assign(opt, __config);
        }
        else opt = Object.assign(__default, __config);

        ui = new GameUI();

        this.run();
    };

    Battlefield.prototype = {
        constructor: Battlefield,
        run: function () {
            try {

                fields = {};

                var F = new Field();
                F.setBarrier(opt.fBarrier);

                h.printFields(fields);

            } catch (e) {
                ui.showError(e);
            }
        },
        setLevel: function (type) {
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
                    fieldSize: {h: 20, v: 15},
                    fBarrier: [[6, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]]
                }
            };

            if (typeof level[type] == 'object') {
                var nLevel = level[type];

                opt.fieldSize = nLevel.fieldSize;
                opt.fieldBarrier = nLevel.fieldBarrier;
            }
            else throw new Error('Указан несуществующий уровень сложности');
        }
    };

    var Field = function () {
        if (!opt.fName instanceof Array)
            throw new SyntaxError('передан не корректный список игровых полей');

        opt.fName.forEach(function (key) {
            fields[key] = new Array(opt.fSize.h);

            for (var x = 0; x < opt.fSize.h; x++) {
                fields[key][x] = new Array(opt.fSize.v);

                for (var y = 0; y < opt.fSize.v; y++) {
                    fields[key][x][y] = opt.tPoint.DEF;
                }
            }
        });
    };

    Field.prototype = {
        setBarrier: function (points) {
            if (!points instanceof Array)
                throw new SyntaxError('Не корректный список прерядствий');

            var maxIteration = Object.keys(fields).length * 100;

            for (var f in fields) {
                var field = fields[f];

                points.forEach(function (point) {
                    var cell = point[0],
                        ctn = point[1];

                    for (var c = 0; c < ctn; c++)
                        field = shipInField(cell, field);
                });

                fields[f] = field;
            }

            return this;

            // private method....................
            // ..................................

            function shipInField(cell, field) {
                if (maxIteration > 0) maxIteration--;
                else throw new RangeError('Чего то я залип в рекурсии, может стоит изменить параметры??');

                var ship = [],
                    x = h.rand(0, opt.fSize.h - 1),
                    y = h.rand(0, opt.fSize.v - 1);
                var posHorizontal = h.rand(1, 2) % 2
                    ? true : false;

                for (var i = 0; i < cell; i++) {
                    var pX = x, pY = y;

                    if (posHorizontal) pY = y + i;
                    else pX = x + i;

                    if (checkPoint(pX, pY, field)) {
                        ship.push([pX, pY]);
                    }
                    else return shipInField(cell, field);
                }

                ship.forEach(function (_cell) {
                    var x = _cell[0],
                        y = _cell[1];

                    field[x][y] = opt.tPoint.BAR;
                });

                return field;
            }

            function checkPoint(x, y, field) {
                var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
                    pX = 0, pY = 0;

                if (typeof field[x] == 'undefined' || typeof field[x][y] == 'undefined')
                    return false;

                if (field[x][y] != opt.tPoint.DEF)
                    return false;

                cP.forEach(function (point) {
                    pX = x + point[0];
                    pY = y + point[1];

                    // в рамках игрового поля
                    if (pX >= 0 && pX < opt.fSize.h && pY >= 0 && pY < opt.fSize.v) {
                        if (field[pX][pY] !== opt.tPoint.DEF) {
                            console.log('['+x+'x'+y+']'+pX+'x'+pY +': ' + field[pX][pY] +' - break');
                            return false;
                        } else {
                            console.log('['+x+'x'+y+']'+pX+'x'+pY +': ' + field[pX][pY]);
                        }

                    }
                });

                return true;
            }
        }
    };

    var GameUI = function (config) {
        this.field = document.querySelector(opt.containerField);
        this.log = document.querySelector(opt.containerLog);
        this.status = document.querySelector(opt.containerStatus);
    };

    GameUI.prototype = {
        showError: function (error) {
            console.log(error);
        },
        createFieldHTML: function (fields) {
            
        }
    };

    var h = {
        rand: function (min, max) {
            var min = min || 0,
                max = max || 100;
            return parseInt(Math.random() * (max - min + 1) + min);
        },

        printFields: function (fields) {
            var str = '';

            for (var i = 0; i < opt.fSize.h; i++) {
                str += i + "\t";

                for (var f in fields) {
                    var field = fields[f];

                    for (var j = 0; j < opt.fSize.v; j++) {
                        var v =
                            field[i][j] == opt.tPoint.DEF ? '.' :
                            field[i][j] == opt.tPoint.BAR ? '+' : field[i][j];

                        str += " " + field[i][j];
                    }
                    str += "\t\t";
                }
                str += "\n";
            }

            console.log("\n"+str);
        }
    };

    global.Battlefield = Battlefield;
})(this);