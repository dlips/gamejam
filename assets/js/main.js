var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.spritesheet('testanimation', 'assets/img/testanimation.png', 51, 51, 30);
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;
        background.events.onInputDown.add(this.teleport, this);
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(10,10,'man');
       // man.scale.setTo(3,3);

        //plattformen erstellen
        platform = game.add.group();
        platform.enableBody = true;
        var startplatform = platform.create(10,100,'platform');
        startplatform.body.immovable = true;

        var testanimation = game.add.sprite(150, 150, 'testanimation');
        testanimation.animations.add('walk');
        testanimation.animations.play('walk', 2, true);
    },
    update : function () {

    },
    teleport : function() {
        var x = game.input.x;
        var y = game.input.y;
        this.people.destroy();
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(x, y, 'man');
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
