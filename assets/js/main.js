var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'background');
    },
    update : function () {

    }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', myState);