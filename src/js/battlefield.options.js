    var options = {},                                               // опции игры
        // публичные свойства, могут быть изменены через config
        _optionsPublic = {
            printName: true,                                        // печатать имена игроков
            printLog: true,                                         // ведения журнала боя
            printHelp: true,                                        // использовать подсказки

            fSize: {                                                // размерность игрового поля
                h: 15, v: 15                                        // h - горизонтально, v - вертикально
            },
            fBarrier: [                                             // список кораблей на игровом поле
                [5, 2], [4, 3], [3, 4], [2, 5]                      // по принципу: ["кол-во палуб", "кол-во штук"]
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