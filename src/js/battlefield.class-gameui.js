/**
 * Класс управления пользовательским интерфейсом
 *
 * Требуется:
 *      options = {}    - глобальный объект с опциями игры
 *      h = {}          - глобальный обьект функций помошников
 * @param htmlSelector  - document.querySelector
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

    // ставим метку кому перешел ход
    this.nameHtml.querySelectorAll('.name').forEach(function (span) {
        span.classList.remove('act');
    });
    this.nameHtml.querySelector('.name#' + fKey).classList.add('act');
};

GameUI.prototype.clickToField = function (fKey, callback) {
    this.fieldHtml.querySelector('table.field#' + fKey).onclick = callback;
};

GameUI.prototype.setMarker = function (point, fKey, tPoint, auto) {
    var X = point[0],
        Y = point[1],
        elClass = '';
    auto = auto || false;

    switch (tPoint) {
        case (options.tPoint.NUL):                          // мимо
            elClass = auto ? 'auto-null' : 'null';
            break;
        case (options.tPoint.KIL):                          // ранил
            elClass = 'kill';
            break;
        case (options.tPoint.KIL + '_death'):               // убил
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

    if (dCtn == 0) {
        var lsBox = letBox.querySelectorAll('div');
        lsBox.forEach(function (box) {
            box.className += ' kill';
        });
    }

    var table = this.fieldHtml.querySelector('.field#' + fKey);
    ctnCell.forEach(function (ship) {
        var X = ship[0],
            Y = ship[1];

        table
            .rows[X].cells[Y]
            .querySelector('.box')
            .className += ' death';
    });
};

GameUI.prototype.printLog = function (point, fKey, tPoint) {
    if (!options.printLog)
        return false;

    var self = this;

    var html = '',
        X = point[0], Y = point[1];

    var tPoint_class = '',
        tPoint_name = '';

    var nAttrID = '',
        dAttrID = '';

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

    // при наведении на логи, подсветка точки игрового поля
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

GameUI.prototype.gameOver = function (winner) {
    var self = this,
        kWinner = options.player.kUser == winner ? 'kUser' : 'kBrain';
    var title = '',
        elClass = '',
        message = '';

    // прибавляем победу...
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