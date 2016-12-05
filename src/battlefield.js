(function (window) {
    'use strict';

    function Battlefield(options) {
        this.startGame();
    }

    Battlefield.prototype = {
        startGame: function () {
            try {
                var F = new Field();
                F.setBarriers();

            } catch (e) {
                console.log(e);
            }
        }
    };

    function Field() {
        if (!opt.fName instanceof Array)
            throw new SyntaxError('Не корректное название игрового поля');

        opt.fName.forEach(function (key) {
            fields[key] = new Array(opt.fSize.h);

            for (var h = 0; h < opt.fSize.h; h++) {
                fields[key][h] = new Array(opt.fSize.v);

                for (var v = 0; v < opt.fSize.v; v++) {
                    fields[key][h][v] = opt.tPoint.DEF;
                }
            }
        });
    }

    Field.prototype = {
        setBarriers: function () {
            var maxIteration = opt.fName.length * 100;

            console.log(maxIteration);

            if (!opt.barriers instanceof Array)
                throw new SyntaxError('Не корректный список караблей');

            for (var key in fields) {
                opt.barriers.forEach(function (barrier) {
                    var cel = barrier[0],
                        ctn = barrier[1];

                    for (var c = 0; c < ctn; c++) {
                        fields[key] = pointInField(cel, fields[key]);
                    }
                })
            }

            // private method....................
            // ..................................

            function pointInField(cel, field) {

                if (maxIteration > 0) maxIteration--;
                else throw new RangeError('Чего то я залип в рекурсии, может стоит изменить параметры??');

                var sPoint = [],
                    x = h.rand(0, opt.fSize.h),
                    y = h.rand(0, opt.fSize.v);
                var posHorizont = h.rand(1, 2) % 2 ? true : false;
                
                for (var i = 0; i < cel; i++) {
                    var pX = x, pY = y;
                    
                    if (posHorizont) pY = y + i;
                    else pX = x + i;
                    
                    if (checkPoint(pX, pY, field))
                    {
                        sPoint.push([pX, pY]);
                    }
                    else 
                        return pointInField(cel, field);
                }
                
                sPoint.forEach(function (point) {
                    var x = point[0],
                        y = point[1];

                    console.log(point);

                    // размещаем препидствие (корабль) на игровое поле
                    field[x][y] = opt.tPoint.LET;
                });

                return field;
            }
            
            function checkPoint(x, y, field) {
                var cP = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]],
                    pX = 0, pY = 0;

                if (x >= 0 && x <= opt.fSize.h && y >= 0 && y <= opt.fSize.v && field[x][y] == opt.tPoint.DEF) {

                    cP.forEach(function (check) {
                        pX = x + check[0];
                        pY = y + check[1];

                        console.log(pX+'x'+pY+' == ' + typeof field[pX][pY] + ' :: ' + field[pX][pY]);

                        if (
                            pX >= -1 && pX <= opt.fSize.h + 1 &&
                            pY >= -1 && pY <= opt.fSize.v + 1 &&
                            (field[pX][pY] == opt.tPoint.DEF || field[pX][pY] == 'undefined')
                        ) {
                            // ..
                        } else return false;
                    });
                    return true;

                }
                return false;
            }
        }
    };

    var fields = {},
        opt = {
            fName: ['FUser', 'FEnemy'],
            fSize: {
                h: 10,          // кол-во клеток по горизонтали
                v: 10           // кол-во клеток по вертикали
            },
            helpPoint: true,    // устанавливать подсказки
            marker: {
                h: 'string',  // ряд
                v: 'number'   // столбец
            },
            tPoint: {
                DEF: 0,         // пустое поле
                LET: 1,         // часть корабля
                KIL: 2,         // подбитая часть корабля
                NUL: 3          // выстрел мимо
            },
            barriers: [              // [<кол.клеток>, <кол.штук>]
                [4, 1], [3, 2], [2, 3], [1, 4]
            ]
        };
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
        },

        printField: function(field) {
            var str = '';

            for (var i = 0; i < opt.fSize.h; i++) {

                for (var key in field) {
                    var hField = field[key][i];

                    hField.forEach(function (item) {
                        str += item + ' ';
                    });

                    str += "\t\t";
                }

                str += "\n";
            }

            console.log(str);
        }
    };

    window.Battlefield = Battlefield;
})(window);