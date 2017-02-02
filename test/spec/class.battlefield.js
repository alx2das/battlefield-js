describe('Публичный класс Battlefield()', function() {
    var BF;

    beforeEach(function () {
        options = {};
        _instances = false;
    });
    afterEach(function () {
        BF = undefined;
    });

    it("Применение публичных опций", function() {
        BF = new Battlefield('htmlSelector', {
            fSize: { h: 22, v: 23 },
            fBarrier: [
                [6, 1], [5, 2], [4, 3], [3, 3], [2, 4], [1, 6]
            ]
        });

        expect(options.fSize.h).toEqual(22);
        expect(options.fSize.v).toEqual(23);
        expect(options.fBarrier.length).toEqual(6);
        expect(options.fBarrier[0]).toEqual([6, 1]);
    });

    it("Игнорирование изменения приватных опций", function() {
        BF = new Battlefield('htmlSelector', {
            player: {
                kUser: 'BlaBlaUser', kBrain: 'BlaBlaBrain'
            },
            tPoint: {
                DEF: '12', BAR: '13', KIL: '14', NUL: '15'
            }
        });

        expect(options.player.kUser).not.toBe('BlaBlaUser');
        expect(options.player.kBrain).not.toBe('BlaBlaBrain');

        expect(options.tPoint.DEF).not.toBe('12');
        expect(options.tPoint.DEF).not.toBe('13');
        expect(options.tPoint.DEF).not.toBe('14');
        expect(options.tPoint.DEF).not.toBe('15');
    });

    it('Установка уровня сложности', function () {
        BF = new Battlefield('htmlSelector');

        expect(options.fSize.h).not.toBe(10);
        expect(options.fSize.v).not.toBe(10);
        expect(options.fBarrier.length).not.toBe(4);

        BF.setLevel('easy');

        expect(options.fSize.h).toBe(10);
        expect(options.fSize.v).toBe(10);
        expect(options.fBarrier.length).toBe(4);

        BF.setLevel('middle');

        expect(options.fSize.h).toBe(15);
        expect(options.fSize.v).toBe(15);
        expect(options.fBarrier.length).toBe(5);

        BF.setLevel('hard');

        expect(options.fSize.h).toBe(15);
        expect(options.fSize.v).toBe(20);
        expect(options.fBarrier.length).toBe(6);
    });
});

describe('Приватный класс Field()', function () {
    var BF;
    var F;

    beforeEach(function () {
        options = {};
        _instances = false;

        BF = new Battlefield('htmlSelector');
    });
    afterEach(function () {
        BF = undefined;
    });

    it('Создание игровых полей', function () {
        BF.setLevel('easy');
        F = new Field();
        expect(F.fields[options.player.kUser].length).toBe(10);
        expect(F.fields[options.player.kUser][0].length).toBe(10);

        delete F;

        BF.setLevel('middle');
        F = new Field();
        expect(F.fields[options.player.kUser].length).toBe(15);
        expect(F.fields[options.player.kUser][0].length).toBe(15);

        delete F;

        BF.setLevel('hard');
        F = new Field();
        expect(F.fields[options.player.kUser].length).toBe(20);
        expect(F.fields[options.player.kUser][0].length).toBe(15);
    })
});