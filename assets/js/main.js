var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;
        background.events.onInputDown.add(this.teleport, this);
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(10,10,'man');
        game.physics.arcade.enable(man);
        man.body.bounce.y = 0.2;
        man.body.gravity.y = 300;
        man.body.collideWorldBounds = true;

        //plattformen erstellen
        platform = game.add.group();
        platform.enableBody = true;

        var startplatform = platform.create(10,500,'platform');
        startplatform.body.immovable = true;

        var secondplatform = platform.create(400,300,'platform');
        secondplatform.body.immovable = true;

    },
    update : function () {
        var hitPlatform = game.physics.arcade.collide(man, platform);
    },
    teleport : function() {
        var x = game.input.x;
        var y = game.input.y;
        this.people.destroy();
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(x, y, 'man');
        game.physics.arcade.enable(man);
        man.body.bounce.y = 0.2;
        man.body.gravity.y = 300;
        man.body.collideWorldBounds = true;
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
