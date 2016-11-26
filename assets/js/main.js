var fullchargtime = 3;
var ctime = 0.0;
var cloudRef = {x: 75, y: 560};
var points = 0.0;
var playeroffset = 68;

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
        this.powerbar = game.add.graphics(0,0);
        this.powerbarborder = game.add.graphics(0,0);
    },
    teleport : function (x, y) {
        //this.angleCounter.destroy();
        this.anglebar.destroy();
        this.powerbar.clear();
        this.powerbarborder.clear();
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
        this.sprite.body.setZeroVelocity();
        this.sprite.body.motionState = Phaser.Physics.P2.Body.STATIC;
        this.sprite.loadTexture('player-idle', 0);
        this.sprite.animations.add('player-idle');
        this.sprite.animations.play('player-idle', 24, true);

        var frame1 = [];
        for (var i = 0; i < 31; i++) {
            frame1.push(i);
        }
        for (var i = 1; i < 30; i++) {
            frame1.push(30-i);
        }
        this.anglebar = game.add.sprite(this.sprite.body.x, this.sprite.body.y-playeroffset, 'charging1');
        this.anglebar.animations.add('charging1',frame1);
        this.anglebar.animations.play('charging1', 10, true);
        
        ctime = game.time.totalElapsedSeconds();
        
        /*this.angleCounter = game.add.text(game.world.centerX, game.world.centerY, this.aimAngle, { 
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
        }, this);*/
    },
    chargingAnimation2 : function () {
        this.anglebar.animations.paused = true;
        
        this.powerbarborder.lineStyle(2, 0x0099FF, 1);
        this.powerbarborder.drawRect(125, 550, 100, 20);
        
        ctime = game.time.totalElapsedSeconds();
        game.time.events.remove(this.angleTimer);
        this.powerTimer = game.time.events.loop(Phaser.Timer.SECOND / 50, function() {
            var t = game.time.totalElapsedSeconds();
            var power = (100* (t-ctime)/fullchargtime) % 200;
            if (power > 100) {
                power = 200 - power;
            }
            this.powerbar.clear();
            this.powerbar.lineStyle(2, 0x0099FF, 1);
            this.powerbar.drawRect(125, 550, power, 20);
            this.powerbar.beginFill(0x0099FF);
        }, this);
    },
    isFalling : function () {
        return this.sprite.body.velocity.y > 0.1;
    },
    landedOnStartPlatform : function() {
        if(this.player.state == 'falling') {
            this.player.state = 'standing';
            this.player.chargingAnimation();
            this.player.sprite.body.setZeroVelocity();
        }
    },
    landedOnSecondPlatform : function() {
        if(this.player.state == 'falling') {
            this.moveToReferencePosition();
            this.player.state = 'standing';
            this.player.sprite.body.setZeroVelocity();
            points = points + 1.0;
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
        game.load.spritesheet('player-idle', '/assets/img/man_stand.png', 68, 100, 5);
        game.load.spritesheet('player-beam-in', '/assets/img/man_tele_hin.png', 68, 72, 13);
        game.load.spritesheet('player-beam-out', '/assets/img/man_tele_rück.png', 68, 72, 13);
        game.load.spritesheet('player-fall', '/assets/img/man_fall.png', 68, 100, 2);
        game.load.spritesheet('charging1', '/assets/img/circle.png', 90, 90, 31);
        game.load.spritesheet('arrowman', 'assets/img/man_arrowman.png', 36, 60, 2);

        game.load.physics('physicsData', 'assets/physics/sprites.json');
    },
    create : function () {
        this.moveCloud = false;
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
        this.player.sprite.body.collides(startPlatformCollisionGroup, this.player.landedOnStartPlatform, this);
        this.player.sprite.body.collides(this.secondPlatformCollisionGroup, this.player.landedOnSecondPlatform, this);

        // Plattformen erstellen
        var platform = game.add.group();
        platform.enableBody = true;
        platform.physicsBodyType = Phaser.Physics.P2JS;
        this.startplatform = platform.create(cloudRef.x, cloudRef.y, 'cloud');
        this.startplatform.body.setRectangle(135,31);
        this.startplatform.body.static = true;
        this.startplatform.body.setCollisionGroup(startPlatformCollisionGroup);
        this.startplatform.body.collides(this.playerCollisionGroup);
        this.spawnsecondcloud(platform);
        this.arrowsprite = null;
           
        // Points
        points = 0.0;
        this.pointtext = game.add.bitmapText(0, -20, 'desyrel', points+'', 64);
        this.pointtext.anchor.x = 0;
        this.pointtext.anchor.y = 0;

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
        if (this.moveCloud) {
            var inc = 1;
            if (this.secondplatform.body.x > cloudRef.x) {
                inc = -1;
            } else {
                inc = 1;
            }
            this.secondplatform.body.x += inc;
            this.player.sprite.body.x  += inc;
            this.startplatform.body.x  += inc;
            var dy = this.referenceMovement({
                secondCloud: this.secondplatform.body.x,
                firstCloud: this.startplatform.body.x,
                player: this.player.sprite.body.x
            });
            this.secondplatform.body.y = dy.secondCloud;
            this.player.sprite.body.y  = dy.player;
            this.startplatform.body.y  = dy.firstCloud;
            if (Math.round(this.secondplatform.body.x) == cloudRef.x) {
                this.moveCloud = false;
                this.player.chargingAnimation();
            } 
        }
        if(this.player.sprite.body.y<0 && this.arrowsprite == null){
            this.arrowsprite = game.add.sprite(this.arrowspawnx, this.arrowspawny, 'arrowman');
            this.arrowsprite.visible = false;
            this.arrowspawnx = this.player.sprite.body.x;
            this.arrowspawny = 0;
            this.arrowsprite.x = this.arrowspawnx;
            this.arrowsprite.y = this.arrowspawny;
            this.arrowsprite.animations.add('arrowman');
            this.arrowsprite.animations.play('arrowman', 12, true);
            this.arrowsprite.visible = true;
        }

        if(this.player.sprite.body.y>0 && this.arrowsprite != null){
            this.arrowsprite.destroy();
            this.arrowsprite = null;
        }
        this.pointtext.text = points + '';
    },
    spawnsecondcloud : function (platform) {
        this.cloudspawnx = game.rnd.integerInRange(this.player.sprite.body.x, this.game.width);
        this.cloudspawny = game.rnd.integerInRange(this.game.height-this.player.sprite.body.y, this.game.height);
        var secondplatform = platform.create(this.cloudspawnx,this.game.height-this.cloudspawny,'cloud');
        secondplatform.body.setRectangle(135,31);
        secondplatform.body.static = true;
        secondplatform.body.setCollisionGroup(this.secondPlatformCollisionGroup);
        secondplatform.body.collides(this.playerCollisionGroup);
        this.secondplatform = secondplatform;
    },
    moveToReferencePosition : function () {
        var spSecondCloud = {x: this.secondplatform.body.x, y: this.secondplatform.body.y};
        var spPlayer = {x: this.player.sprite.body.x, y: this.player.sprite.body.y};
        var spFirstCloud = {x: this.startplatform.body.x, y: this.startplatform.body.y};
        var m = (spSecondCloud.y - cloudRef.y) / (spSecondCloud.x - cloudRef.x);
        this.referenceMovement = function (xp) {
            return {
                secondCloud : (Math.round(m*(xp.secondCloud - spSecondCloud.x)) + spSecondCloud.y),
                firstCloud :  (Math.round(m*(xp.firstCloud - spFirstCloud.x)) + spFirstCloud.y),
                player : (Math.round(m*(xp.player - spPlayer.x)) + spPlayer.y)
            };
        }
        this.moveCloud = true;
    }
};

var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', Start);
