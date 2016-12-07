;(function (global) {
    'use strict';

    var __instances = {};

    var opt = {},
        __default = {
            fieldSize: {
                h: 10, v: 10
            },
            fieldBarrier: [
                [4, 1], [3, 2], [2, 3], [1, 4]
            ],
            marker: {
                h: 'string',
                v: 'number'
            },
            helpPoint: true
        },
        __config = {
            fieldName: ['FUser', 'FBrain'],
            typePoint: {
                DEF: 0,
                BAR: 1,
                KIL: 2,
                NUL: 3
            }
        };

    var Battlefield = function (config) {

        if (__instances instanceof Battlefield)
            return __instances;
        __instances = this;
    };

    Battlefield.prototype = {
        constructor: Battlefield,
        run: function () {
            try {

                // start game

            } catch (e) {
                console.log('Error!');
                console.log(e);
            }
        }
    };


    global.Battlefield = Battlefield;
})(this);