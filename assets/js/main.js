var myState = {
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;
        background.events.onInputDown.add(this.teleport, this);
        this.people = game.add.group();
        this.people.enableBody = true;
        var man = this.people.create(10,10,'man');
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

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', myState);