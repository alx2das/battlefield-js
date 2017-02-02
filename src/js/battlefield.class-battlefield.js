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