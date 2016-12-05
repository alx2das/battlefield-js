var Battlefield = (function () {
    var public = {
        startGame: function () {
            // инициализирует запуск игры
        },
        setLevel: function (lvl) {
            // устанавливает уровень сложности
        },
        setOptions: function (newOptions) {
            // устанавливает игровые параметры
        },
        showError: function (error) {
            // показывает игровые ошибки
        },
        printLog: function (str) {
            // печатает строку в игровой журнал
        }
    };
    
    return public;

    
    var opt = {
        fName: ['FUser', 'FEnemy'],
        tPoint: {
            DEF: 0,         // пустое поле
            LET: 1,         // часть корабля
            KIL: 2,         // подбитая часть корабля
            NUL: 3          // выстрел мимо
        },
        fSize: {
            h: 10,          // кол-во клеток по горизонтали
            v: 10           // кол-во клеток по вертикали
        },
        let: [              // [<кол.клеток>, <кол.штук>]
            [4, 1], [3, 2], [2, 3], [1, 4]
        ],
        marker: {
            h: 'string',  // ряд
            v: 'number'   // столбец
        },
        helpPoint: true
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
        }
    };
    
})();