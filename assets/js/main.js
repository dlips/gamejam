var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'background');

        people = game.add.group();
        people.enableBody = true;
        var man = people.create(10,10,'man');
        man.scale.setTo(8,8);
    },
    update : function () {

    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', myState);