# Battlefield 1.0.1
Игра была разработанна шутки ради, практики для, в свободное от основной работы время и помере желания выседания перед компьютером. Алгоритмы игры стараются максимально соответствовать правилам классической игры "Морской бой". Присутствует подобие искуственного интелекта (не обучается), старается сделать минимальное количество выстрелов для победы.

> Игра может не запуститься в браузерах Internet Explorer, при чем даже в 11 верии,
> все за за `Object.assign()` и многих других мелочей которые не поддерживаются в IE.


## Примеры
[Основной пример можно мосмотреть GitHub Pages](https://alx2das.github.io/battlefield-js/examples/).


## Сборка
Для сборки у вас уже должен быть установлен [Node.js с NPM](https://nodejs.org/). Все необходимые зависимости приписаны в файле `package.json`.
Я использовал [Gulp](http://gulpjs.com/), поэтому у Вас он должен быть установлен глобально.

```sh
npm i gulp -g
```

Для запуска используйте команду по умолчанию:

```sh
gulp
```


## Тестирование
Для тестирования я использовал [Jasmine](https://jasmine.github.io/2.0/introduction.html). Пока что реализованно только браузерное тестирование, пожже добавлю серверное при сборке.

Для запуска тестов должен быть глобально установлен `bower` и все необходимые зависимости которые описаны в файле `bower.json`:

```sh
npm i bower -g
bower i
```

Максимальную информацию по опциям Вы можите увидеть в [исходном коде](https://github.com/alx2das/battlefield-js/tree/master/src).


#### [Лицензия ISC](https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F_ISC)