var myState = {
    aimAngularVelocity : (90 / 3),
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.spritesheet('crosshair', '/assets/img/circle.png', 50, 50, 6);
        game.load.spritesheet('player-idle', '/assets/img/man_stand.png', 68, 72, 5);
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;     

        // Player definieren
        this.player = game.add.sprite(10, 400, 'player-idle');
        this.player.enableBody = true;
        this.player.animations.add('player-idle');
        this.player.animations.play('player-idle', 24, true);
        game.physics.arcade.enable(this.player);
        this.player.body.bounce.y = 0.2;
        this.player.body.gravity.y = 300;
        this.player.body.collideWorldBounds = true;
        this.inputMode = 'idle'; // angel, radius
        this.crosshair = game.make.sprite('crosshair');
        game.world.add(this.crosshair);
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            //this.teleport(x, y);
            if (this.inputMode == 'idle') {
                this.inputMode = 'angel';
                this.crosshair = game.add.sprite(this.player.x+60, this.player.y-20, 'crosshair');
                this.crosshair.scale.setTo(2, 2);
                var animation = this.crosshair.animations.add('aim');
                this.crosshair.animations.play('aim', 2, true);
                console.log("hello");
            } else if (this.inputMode == 'angel') {
                this.inputMode = 'idle';
                this.crosshair.destroy();
            }
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
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
