var myState = {
    aimAngularVelocity : (90 / 3),
    teleportMaxRange : 200,
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;     

        // Player definieren
        this.player = game.add.sprite(10,10,'man');
        this.player.enableBody = true;
        game.physics.arcade.enable(this.player);
        this.player.body.bounce.y = 0.2;
        this.player.body.gravity.y = 300;
        this.player.body.collideWorldBounds = true;

        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            this.teleport(x, y);
        }, this);

        // Plattformen erstellen
        platform = game.add.group();
        platform.enableBody = true;

        var startplatform = platform.create(10,500,'platform');
        startplatform.body.immovable = true;

        var secondplatform = platform.create(400,300,'platform');
        secondplatform.body.immovable = true;

    },
    update : function () {
        var hitPlatform = game.physics.arcade.collide(this.player, platform);
    },
    teleport : function(x, y) {
        this.player.x = x;
        this.player.y = y;
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
