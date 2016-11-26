var Player = {
    init : function (x, y) {
        this.sprite = game.add.sprite(x, y, 'player-idle');
        game.physics.arcade.enable(this.sprite);
        this.sprite.enableBody = true;
        this.sprite.animations.add('player-idle');
        this.sprite.animations.play('player-idle', 24, true);
        this.sprite.body.bounce.y = 0.0;
        this.sprite.body.gravity.y = 300;
        this.sprite.body.collideWorldBounds = true;
        this.state = 'standing';
    },
    teleport : function (x, y) {
        this.state = 'beaming';
        this.sprite.loadTexture('player-beam-in', 0);
        var animationOut = this.sprite.animations.add('beam');
        this.sprite.animations.play('beam', 50, false);
        animationOut.onComplete.add(function () {
            this.move(x, y);
            this.sprite.loadTexture('player-beam-out');
            var animationIn = this.sprite.animations.add('beam2');
            this.sprite.animations.play('beam2', 50, false);
            animationIn.onComplete.add(function () {
                this.sprite.loadTexture('player-idle');
                this.sprite.animations.play('player-idle', 24, true);
                this.state = 'standing';
            }, this);
        }, this);
    },
    move : function(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.body.velocity.x = 0;
        this.sprite.body.velocity.y = 0;
    },
    setState : function(currentState) {
        if (currentState != this.state) {
            if (this.state == 'standing' && currentState == 'falling') {
                this.sprite.loadTexture('player-fall', 0);
                this.sprite.animations.add('player-fall');
                this.sprite.animations.play('player-fall', 15, true);
            }
            if (this.state == 'falling' && currentState == 'standing') {
                this.sprite.loadTexture('player-idle', 0);
                this.sprite.animations.play('player-idle', 24, true);
            }
            this.state = currentState;
        }
    },
    isFalling : function () {
        return this.sprite.body.velocity.y > 0.0;
    }
};

var myState = {
    aimAngularVelocity : (90 / 3),
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.image('moon', 'assets/img/moon.png');
        game.load.image('mountains1', 'assets/img/mountain1.png');
        game.load.image('mountains2', 'assets/img/mountain2.png');
        game.load.spritesheet('crosshair', '/assets/img/circle.png', 50, 50, 6);
        game.load.spritesheet('player-idle', '/assets/img/man_stand.png', 68, 72, 5);
        game.load.spritesheet('player-beam-in', '/assets/img/man_tele_hin.png', 68, 72, 13);
        game.load.spritesheet('player-beam-out', '/assets/img/man_tele_rück.png', 68, 72, 13);
        game.load.spritesheet('player-fall', '/assets/img/man_fall.png', 44, 100, 2);
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;     

        this.moonBack = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('moon').height+75, 
            this.game.width, 
            this.game.cache.getImage('moon').height, 
            'moon'
        );
        this.mountainsBack = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('mountains2').height-50, 
            this.game.width, 
            this.game.cache.getImage('mountains2').height, 
            'mountains2'
        );
        this.mountainsFore = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('mountains1').height, 
            this.game.width, 
            this.game.cache.getImage('mountains1').height, 
            'mountains1'
        );

        // Player definieren
        this.player = Player;
        this.player.init(10, 400);

        this.inputMode = 'idle'; // angel, radius
        this.crosshair = game.make.sprite('crosshair');
        game.world.add(this.crosshair);
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            this.player.teleport(x, y);
            
            // if (this.inputMode == 'idle') {
            //     this.inputMode = 'angel';
            //     this.crosshair = game.add.sprite(this.player.x+60, this.player.y-20, 'crosshair');
            //     this.crosshair.scale.setTo(2, 2);
            //     var animation = this.crosshair.animations.add('aim');
            //     this.crosshair.animations.play('aim', 2, true);
            //     console.log("hello");
            // } else if (this.inputMode == 'angel') {
            //     this.inputMode = 'idle';
            //     this.crosshair.destroy();
            // }
        }, this);

        // Plattformen erstellen
        platform = game.add.group();
        platform.enableBody = true;

        var startplatform = platform.create(10,560,'platform');
        startplatform.body.immovable = true;

        var secondplatform = platform.create(400,300,'platform');
        secondplatform.body.immovable = true;

        this.aimAnglePeriod = game.math.PI2 / this.aimAngularVelocity;
        this.aimAngle = 0;
        this.angleCounter = game.add.text(game.world.centerX, game.world.centerY, this.aimAngle, { 
            font: "64px Arial", 
            fill: "#ffffff", 
            align: "center" 
        });
        this.aimAngleDirection = 1;
        game.time.events.loop(this.aimAnglePeriod * Phaser.Timer.SECOND, function() {
            this.aimAngle += this.aimAngleDirection * this.aimAngularVelocity * this.aimAnglePeriod;
            if (this.aimAngle > 90) {
                this.aimAngleDirection = -1;
                this.aimAngle = 90;
            } else if (this.aimAngle < 0) {
                this.aimAngleDirection = 1;
                this.aimAngle = 0;
            }
            this.angleCounter.setText(this.aimAngle);
        }, this);
    },
    update : function () {
        var hitPlatform = game.physics.arcade.collide(this.player, platform);
        this.moonBack.tilePosition.x -= 0.05;
        this.mountainsFore.tilePosition.x -= 0.3;
        this.mountainsBack.tilePosition.x -= 0.1;
        
        if (this.player.isFalling()) {
            this.player.setState('falling');
        } else {
            this.player.setState('standing');
        }
    }
    
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
