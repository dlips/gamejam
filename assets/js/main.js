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
        var man = people.create(10, game.world.height - 350, 'man');
        man.scale.setTo(4,4);

        // Hier die Gruppe für die Plattformen
        platform = game.add.group();
        platform.enableBody = true;

        // Füge startplatform hinzu
        var startplatform = platform.create(Math.ceil(game.world.width*0.05),game.world.height - Math.ceil(game.world.height*0.05),'platform');
        startplatform.body.immovable = true;
        console.log(game.world.height - Math.ceil(game.world.height*0.05));
        console.log(Math.ceil(game.world.width*0.05));

    },
    update : function () {

    }
};
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', myState);
