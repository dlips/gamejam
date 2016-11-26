var myState = {
    aimAngularVelocity : (90 / 3),
    teleportMaxRange : 200,
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.spritesheet('testanimation', 'assets/img/testanimation.png', 32, 32, 10);
        game.load.spritesheet('crosshair', 'assets/img/circle.png', 50, 50, 6);
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            this.teleport(x, y);
        }, this);
        
        this.player = game.add.sprite(10,10,'man');
        this.player.enableBody = true;
       
        //plattformen erstellen
        platform = game.add.group();
        platform.enableBody = true;
        var startplatform = platform.create(10,100,'platform');
        startplatform.body.immovable = true;

        var testanimation2 = game.add.sprite(150, 150, 'crosshair');
        testanimation2.animations.add('move');
        testanimation2.animations.play('move', 2, true);
    },
    update : function () {

    },
    teleport : function(x, y) {
        this.player.x = x;
        this.player.y = y;
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
