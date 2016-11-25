var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png')
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Hier die Gruppe für die Plattformen
        platform = game.add.group();
        platform.enableBody = true;

        // Füge startplatform hinzu
        var startplatform = platform.create(Math.ceil(game.world.width*0.05),game.world.height - Math.ceil(game.world.height*0.05),'platform');
        startplatform.body.immovable = true;
        console.log(game.world.height - Math.ceil(game.world.height*0.05));
        console.log(Math.ceil(game.world.width*0.05));

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;
        background.events.onInputDown.add(this.teleport, this);
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(10,10,'man');
        man.scale.setTo(3,3);

    },
    update : function () {

    },
    teleport : function() {
        var x = game.input.x;
        var y = game.input.y;
        this.people.destroy();
        this.people = game.add.group();
        this.people.enableBody = true;
        this.people.create(x, y, 'man');
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
