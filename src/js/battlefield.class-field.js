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

                if (posHorizontal) pX = x + i;
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