(function (window) {
    'use strict';

    /**
     * Игровой клас
     * @constructor
     */
    function Battlefield() {

        this.startGame();
    }

    Battlefield.prototype = {
        startGame: function () {
            try {

                var F = new Field();
                F.setLet();

            } catch (e) {
                this.showError(e);
            }
        },

        showError: function (error) {
            console.log(error)
        }
    };


    function Field() {
        var keys = opt.fName;

        if (keys instanceof Array) {
            keys.forEach(function (key) {                       // создаю игровые поля
                field[key] = new Array(opt.fSize.h);

                for (var h = 1; h <= opt.fSize.h; h++) {        // по горизонтали
                    field[key][h] = new Array(opt.fSize.v);

                    for (var v = 1; v <= opt.fSize.v; v++) {    // по вертикали
                        field[key][h][v] = opt.tPoint.DEF;
                    }
                }
            });

        }
        else throw new SyntaxError('Получен не корректный список названий игровых полей');
    }

    Field.prototype = {
        setLet: function () {
            var maxIteration = field.length * 100,
                point = opt.let;

            if (point instanceof Array) {
                
            }
            else throw SyntaxError('Получен не корректный список кораблей');
        }
    };

    // игровые поля
    var field = {};

    // опции игры
    var opt = {
        // игровые контейнеры
        fields: false,
        players: false,
        status: false,

        // названия игровых полей
        fName: ['FUser', 'FEnemy'],

        // размер игрового поля
        fSize: {
            h: 10,          // кол-во клеток по горизонтали
            v: 10           // кол-во клеток по вертикали
        },

        // маркеры полей (string|number)
        marker: {
            h: 'string',  // ряд
            v: 'number'   // столбец
        },

        // значение игровой клетки
        tPoint: {
            DEF: 0,         // пустое поле
            LET: 1,         // часть корабля
            KIL: 2,         // подбитая часть корабля
            NUL: 3          // выстрел мимо
        },

        // корабли [<кол.клеток>, <кол.штук>]
        let: [              // [<кол.клеток>, <кол.штук>]
            [4, 1], [3, 2], [2, 3], [1, 4]
        ],

        // выводить подсказки
        helpPoint: true
    };

    // для быстрого доступа
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

            return alphabet[key - 1] + operand;
        }
    };

    window.Battlefield = Battlefield;
})(window);