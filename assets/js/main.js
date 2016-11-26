var fullchargtime = 10;
var ctime = 0.0;

var Player = {
    init : function (x, y) {
        this.sprite = game.add.sprite(x, y, 'player-idle');
        this.sprite.enableBody = true;
        game.physics.p2.enable(this.sprite, true);
        this.sprite.body.motionState = Phaser.Physics.P2.Body.DYNAMIC;
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
        this.angleCounter.destroy();
        game.time.events.remove(this.powerTimer);
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
        this.sprite.body.motionState = Phaser.Physics.P2.Body.DYNAMIC;
        
        this.sprite.loadTexture('player-fall', 0);
        this.sprite.animations.add('player-fall');
        this.sprite.animations.play('player-fall', 15, true);
    },
    chargingAnimation : function () {
        this.sprite.body.motionState = Phaser.Physics.P2.Body.STATIC;
        
        this.sprite.loadTexture('player-idle', 0);
        this.sprite.animations.add('player-idle');
        this.sprite.animations.play('player-idle', 24, true);
        ctime = game.time.totalElapsedSeconds();
        
        this.angleCounter = game.add.text(game.world.centerX, game.world.centerY, this.aimAngle, { 
            font: "64px Arial", 
            fill: "#ffffff", 
            align: "center" 
        });
        this.angleTimer = game.time.events.loop(Phaser.Timer.SECOND / 10, function() {
            var t = game.time.totalElapsedSeconds();
            var angle = (90 * (t-ctime)/fullchargtime) % 180;
            if (angle > 90) {
                angle = 180 - angle;
            }
            this.angleCounter.setText(angle);
        }, this);
    },
    chargingAnimation2 : function () {
        ctime = game.time.totalElapsedSeconds();
        game.time.events.remove(this.angleTimer);
        this.powerTimer = game.time.events.loop(Phaser.Timer.SECOND / 5, function() {
            var t = game.time.totalElapsedSeconds();
            var power = (1000 * (t-ctime)/fullchargtime) % 2000;
            if (power > 1000) {
                power = 2000 - power;
            }
            this.angleCounter.setText(power);
        }, this);
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

        game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
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
        game.physics.p2.gravity.y = 600;
        this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
        var startPlatformCollisionGroup = game.physics.p2.createCollisionGroup();
        this.secondPlatformCollisionGroup = game.physics.p2.createCollisionGroup();
        
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
        this.player.sprite.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.sprite.body.collides(startPlatformCollisionGroup, this.player.landedOnStartPlatform, this.player);
        this.player.sprite.body.collides(this.secondPlatformCollisionGroup, this.player.landedOnSecondPlatform, this.player);

        // Plattformen erstellen
        var platform = game.add.group();
        platform.enableBody = true;
        platform.physicsBodyType = Phaser.Physics.P2JS;
        var startplatform = platform.create(75,560,'cloud');
        startplatform.body.setRectangle(135,31);
        startplatform.body.static = true;
        startplatform.body.setCollisionGroup(startPlatformCollisionGroup);
        startplatform.body.collides(this.playerCollisionGroup);

        this.spawnsecondcloud(platform);
        

       
        
        // Zielen
        this.inputMode = 'idle'; // angel, radius
        this.crosshair = game.make.sprite('crosshair');
        game.world.add(this.crosshair);
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            if (this.player.state == 'standing') {
                var t = game.time.totalElapsedSeconds();
                this.angle = (90 * (t-ctime)/fullchargtime) % 180;
                if (this.angle > 90) {
                    this.angle = 180 - this.angle;
                }
                this.player.chargingAnimation2();
            }
        }, this);
        
        background.events.onInputUp.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            if (this.player.state == 'standing') {
                var t = game.time.totalElapsedSeconds();
                this.power = (1000 * (t-ctime)/fullchargtime) % 2000;
                if (this.power > 1000) {
                    this.power = 2000 - this.power;
                }
                var x = this.player.sprite.body.x + this.power * Math.cos(this.angle*2*Math.PI/360);
                var y = this.player.sprite.body.y - this.power * Math.sin(this.angle*2*Math.PI/360);
                this.player.teleport(x, y);
                console.log("Power: " + this.power);
                console.log("Angle: " + this.angle);
                console.log("x: " + x);
                console.log("y: " + y);
            }
        }, this);
    },
    update : function () {
        this.moonBack.tilePosition.x -= 0.05;
        this.mountainsFore.tilePosition.x -= 0.3;
        this.mountainsBack.tilePosition.x -= 0.1;
        if(this.player.state == 'falling' && (this.player.sprite.body.y > this.game.height)){
            this.player.state = 'dead';
            var text = game.add.bitmapText(400, 300, 'desyrel', 'Scrub Try Again', 64);
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.inputEnabled = true;
            text.events.onInputDown.add(function() {
                game.state.restart();
            }, this);
        }
    },
    spawnsecondcloud : function (platform) {
        this.cloudspawnx = game.rnd.integerInRange(this.player.sprite.body.x, this.game.width);
        this.cloudspawny = game.rnd.integerInRange(this.game.height-this.player.sprite.body.y, this.game.height);
        var secondplatform = platform.create(this.cloudspawnx,this.game.height-this.cloudspawny,'cloud');
        secondplatform.body.setRectangle(135,31);
        secondplatform.body.static = true;
        secondplatform.body.setCollisionGroup(this.secondPlatformCollisionGroup);
        secondplatform.body.collides(this.playerCollisionGroup);


    }
};

var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', Start);
