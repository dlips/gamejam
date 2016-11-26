var fullchargtime = 3;

var Player = {
    init : function (x, y) {
        this.sprite = game.add.sprite(x, y, 'player-idle');
        this.sprite.enableBody = true;
        game.physics.p2.enable(this.sprite, true);
        this.sprite.body.setRectangle(20,68);
        this.sprite.animations.add('player-idle');
        this.sprite.animations.play('player-idle', 24, true);
        this.sprite.body.collideWorldBounds = true;
	    this.sprite.body.fixedRotation = true;
	    this.sprite.body.setZeroDamping();
        this.state = 'falling';
        this.fallingAnimation();
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
                this.state = 'falling';
                this.fallingAnimation();
            }, this);
        }, this);
    },
    move : function(x, y) {
        this.sprite.body.reset(x, y);
        this.sprite.body.setZeroVelocity();
    },
    fallingAnimation : function() {
        this.sprite.loadTexture('player-fall', 0);
        this.sprite.animations.add('player-fall');
        this.sprite.animations.play('player-fall', 15, true);
    },
    chargingAnimation : function () {
        this.sprite.loadTexture('player-idle', 0);
        this.sprite.animations.add('player-idle');
        this.sprite.animations.play('player-idle', 24, true);
    },
    isFalling : function () {
        return this.sprite.body.velocity.y > 0.1;
    },
    landedOnStartPlatform : function() {
        if(this.state == 'falling') {
            this.state = 'standing';
            this.chargingAnimation();
            this.sprite.body.setZeroVelocity();
        }
    },
    landedOnSecondPlatform : function() {
        if(this.state == 'falling') {
            this.state = 'standing';
            this.chargingAnimation();
            this.sprite.body.setZeroVelocity();
        }
    }
};

var Start = {
    aimAngularVelocity : (90 / 3),
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.image('moon', 'assets/img/moon.png');
        game.load.image('mountains1', 'assets/img/mountain1.png');
        game.load.image('mountains2', 'assets/img/mountain2.png');
        game.load.image('cloud', 'assets/img/simplecloud.png');
        game.load.spritesheet('crosshair', '/assets/img/circle.png', 50, 50, 6);
        game.load.spritesheet('player-idle', '/assets/img/man_stand.png', 68, 72, 5);
        game.load.spritesheet('player-beam-in', '/assets/img/man_tele_hin.png', 68, 72, 13);
        game.load.spritesheet('player-beam-out', '/assets/img/man_tele_rück.png', 68, 72, 13);
        game.load.spritesheet('player-fall', '/assets/img/man_fall.png', 44, 100, 2);

        game.load.physics('physicsData', 'assets/physics/sprites.json');
    },
    create : function () {

        //Physics & Collision
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0;
        game.physics.p2.gravity.y = 300;
        var playerCollisionGroup = game.physics.p2.createCollisionGroup();
        var startPlatformCollisionGroup = game.physics.p2.createCollisionGroup();
        var secondPlatformCollisionGroup = game.physics.p2.createCollisionGroup();
        
        // Background
        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;    
        this.moonBack = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('moon').height, 
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
            this.game.height - this.game.cache.getImage('mountains1').height+20, 
            this.game.width, 
            this.game.cache.getImage('mountains1').height, 
            'mountains1'
        );

        // Player definieren
        this.player = Player;
        this.player.init(50, 400);
        this.player.sprite.body.setCollisionGroup(playerCollisionGroup);
        this.player.sprite.body.collides(startPlatformCollisionGroup, this.player.landedOnStartPlatform, this.player);
        this.player.sprite.body.collides(secondPlatformCollisionGroup, this.player.landedOnSecondPlatform, this.player);

        // Plattformen erstellen
        var platform = game.add.group();
        platform.enableBody = true;
        platform.physicsBodyType = Phaser.Physics.P2JS;
        var startplatform = platform.create(75,560,'cloud');
        startplatform.body.setRectangle(135,31);
        startplatform.body.static = true;
        startplatform.body.setCollisionGroup(startPlatformCollisionGroup);
        startplatform.body.collides(playerCollisionGroup);
        var secondplatform = platform.create(400,300,'cloud');
        secondplatform.body.setRectangle(135,31);
        secondplatform.body.static = true;
        secondplatform.body.setCollisionGroup(secondPlatformCollisionGroup);
        secondplatform.body.collides(playerCollisionGroup);

       
        
        // Zielen
        this.inputMode = 'idle'; // angel, radius
        this.crosshair = game.make.sprite('crosshair');
        game.world.add(this.crosshair);
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            if (this.player.state == 'standing') {
                this.player.teleport(x, y);
            }
            
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
        this.moonBack.tilePosition.x -= 0.05;
        this.mountainsFore.tilePosition.x -= 0.3;
        this.mountainsBack.tilePosition.x -= 0.1;
    }
    
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', Start);
