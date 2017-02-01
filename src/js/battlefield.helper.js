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