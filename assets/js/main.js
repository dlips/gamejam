
var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png')
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'background');

        people = game.add.group();
        people.enableBody = true;

        platform = game.add.group();
        platform.enableBody = true;
        var startplatform = platform.create(10,10,'platform');
        startplatform.body.immovable = true;

        var man = people.create(10, game.world.height - 250, 'man');
        man.scale.setTo(8,8);

    },
    update : function () {

    }
};
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', myState);
