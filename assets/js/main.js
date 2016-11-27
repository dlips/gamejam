var fullchargtime = 1;
var ctime = 0.0;
var cloudRef = {x: 50, y: 560};
var points = 0.0;
var gravity = 900;
var movetime = 1000;
var chargeanimationFPS = 40;
var menutimeportal = 3;
var introportal = false;
var teleportoffset = 100;

var showCollisionBoxes = false;

WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, function(){}, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Chewy']
    }

};

var Player = {
    init : function (x, y) {
        this.sprite = game.add.sprite(x, y, 'player-idle');
        this.sprite.enableBody = true;
        game.physics.p2.enable(this.sprite, showCollisionBoxes);
        this.sprite.body.motionState = Phaser.Physics.P2.Body.DYNAMIC;
        this.sprite.body.setRectangle(45,110);
        this.sprite.animations.add('player-idle');
        this.sprite.scale.setTo(0.25, 0.25);
        this.sprite.smoothed = true;
        this.sprite.animations.play('player-idle', chargeanimationFPS, true);
        this.sprite.body.collideWorldBounds = true;
	    this.sprite.body.fixedRotation = true;
	    this.sprite.body.setZeroDamping();
        this.state = 'falling';
        this.fallingAnimation();
        this.powerbar       = game.add.graphics(0,0);
        this.powerbarborder = game.add.graphics(0,0);
        this.anglebarborder = game.add.graphics(0,0);
        this.anglebar       = game.add.graphics(0,0);
    },
    teleport : function (x, y) {
        this.anglebarborder.clear();
        this.anglebar.clear();
        this.powerbar.clear();
        this.powerbarborder.clear();
        game.time.events.remove(this.powerTimer);
        this.state = 'beaming';
        this.sprite.loadTexture('player-beam-in', 0);
        var animationOut = this.sprite.animations.add('beam');
        this.sprite.scale.setTo(0.25, 0.25);
        this.sprite.animations.play('beam', 20, false);
        animationOut.onComplete.add(function () {
            this.move(x, y+teleportoffset);
            this.sprite.loadTexture('player-beam-out');
            var animationIn = this.sprite.animations.add('beam2');
            this.sprite.animations.play('beam2', 50, false);
            animationIn.onComplete.add(function () {
                this.sprite.loadTexture('player-idle');
                this.sprite.animations.play('player-idle', chargeanimationFPS, true);
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
        this.sprite.animations.play('player-idle', chargeanimationFPS, true);
        
        this.anglebarborder.lineStyle(10,0x9033FF);
        this.anglebarborder.arc(50, 550, 100, 0, 3*Math.PI/2, true);

        ctime = game.time.totalElapsedSeconds();
        this.angleTimer = game.time.events.loop(Phaser.Timer.SECOND / 100, function() {
            var t = game.time.totalElapsedSeconds();
            var angle = ((Math.PI/2) * (t-ctime)/fullchargtime) % Math.PI;
            if (angle > (Math.PI/2)) {
                angle = Math.PI - angle;
            }
            angle = Math.PI/2 - angle;
            this.anglebar.clear();
            this.anglebar.lineStyle(10,0xf76969);
            this.anglebar.arc(50, 550, 100, 0, 3*Math.PI/2+angle, true);
        }, this);
    },
    chargingAnimation2 : function () {        
        this.powerbarborder.lineStyle(2, 0x0099FF);
        this.powerbarborder.drawRect(125, 550, 100, 20);
        
        ctime = game.time.totalElapsedSeconds();
        game.time.events.remove(this.angleTimer);
        this.powerTimer = game.time.events.loop(Phaser.Timer.SECOND / 100, function() {
            var t = game.time.totalElapsedSeconds();
            var power = (100* (t-ctime)/fullchargtime) % 200;
            if (power > 100) {
                power = 200 - power;
            }
            this.powerbar.clear();
            this.powerbar.lineStyle(2, 0x0099FF);
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
    landedOnSecondPlatform : function(player, platform) {
        var y1 = player.sprite.bottom;
        var y2 = platform.y;
        if (y1 <= y2) {
            if(this.player.state == 'falling') {
            this.moveToReferencePosition();
            this.player.state = 'standing';
            this.player.sprite.body.setZeroVelocity();
            points = points + 1.0;
            }
        } else {
            this.playerIsDead();
        }
        
    }
};


var Play = {
    aimAngularVelocity : (90 / 3),
    aimRangeSpeed : (200 / 3),
    create : function () {
        //Physics & Collision
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0;
        game.physics.p2.gravity.y = gravity;
        this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
        this.startPlatformCollisionGroup = game.physics.p2.createCollisionGroup();
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
        this.player.sprite.body.collides(this.startPlatformCollisionGroup, this.player.landedOnStartPlatform, this);
        this.player.sprite.body.collides(this.secondPlatformCollisionGroup, this.player.landedOnSecondPlatform, this);

        // Plattformen erstellen
        // Setze randombereiche fuer position und laenge der platformen
        this.randomRange = {
            x : {
                min : 250,
                max : game.width - 100
            },
            y : {
                min : 50,
                max : cloudRef.y
            },
            length : {
                min : 120,
                max : 150
            }
        };
        this.platformGroup = game.add.group();
        this.platformGroup.enableBody = true;
        this.platformGroup.physicsBodyType = Phaser.Physics.P2JS;
        this.startplatform = this.generatePlatform(cloudRef.x, cloudRef.y, 60);
        this.startplatform.body.setCollisionGroup(this.startPlatformCollisionGroup);
        this.startplatform.body.collides(this.playerCollisionGroup);
        this.spawnsecondcloud();
        this.arrowsprite = null;
           
        // Points
        points = 0.0;
        this.pointtext = game.add.text(10, 0, points+'');
        this.pointtext.anchor.x = 0;
        this.pointtext.anchor.y = 0;
        this.pointtext.font = 'Chewy';
        this.pointtext.fontSize = 64;
        this.pointtext.fill = '#FFFFFF';
        this.pointtext.stroke = '#000000';
        this.pointtext.strokeThickness = 5;

        this.rectDelete();

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
        if(this.player.state == 'falling' && ((this.player.sprite.body.y > this.game.height) || (this.player.sprite.body.x > this.game.width))){
            this.playerIsDead();
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
    generatePlatform : function(x, y, length) {
        var newPlatform = game.add.sprite(x, y, 'platform');
        game.physics.p2.enable(newPlatform, showCollisionBoxes);
        newPlatform.scale.setTo(length/3, 1);
        newPlatform.body.setRectangle(length, 21);
        newPlatform.body.static = true;
        newPlatform.smoothed = false;
        return newPlatform;
    },
    swapClouds : function () {
        this.startplatform.destroy();
        this.startplatform = this.secondplatform;
        this.startplatform.body.removeCollisionGroup(this.secondPlatformCollisionGroup);
        this.startplatform.body.setCollisionGroup(this.startPlatformCollisionGroup);
        this.spawnsecondcloud();
    },
    spawnsecondcloud : function () {
        var cloudspawnx = game.rnd.integerInRange(
            this.player.sprite.body.x + this.randomRange.x.min, 
            this.randomRange.x.max
        );
        var cloudspawny = game.rnd.integerInRange(
            this.randomRange.y.min, 
            this.randomRange.y.max
        );
        var length = game.rnd.integerInRange(
            this.randomRange.length.min, 
            this.randomRange.length.max
        );
        var secondplatform = this.generatePlatform(cloudspawnx, cloudspawny,length);
        secondplatform.body.setCollisionGroup(this.secondPlatformCollisionGroup);
        secondplatform.body.collides(this.playerCollisionGroup);
        this.secondplatform = secondplatform;
    },
    moveToReferencePosition : function () {
        var time = movetime;
        var tweenSecondPlatform = game.add.tween(this.secondplatform.body);
        tweenSecondPlatform.to({x: cloudRef.x, y: cloudRef.y}, time);

        var dx = this.secondplatform.x - cloudRef.x;
        var dy = this.secondplatform.y - cloudRef.y;
        var tweenFirstPlatform = game.add.tween(this.startplatform.body);
        tweenFirstPlatform.to({x: this.startplatform.x-dx, y: this.startplatform.y-dy}, time);
        var tweenPlayer = game.add.tween(this.player.sprite.body);
        tweenPlayer.to({x: this.player.sprite.body.x-dx, y: this.player.sprite.body.y-dy}, time);
        tweenPlayer.onComplete.add(function () {
            this.swapClouds();
            this.player.chargingAnimation();
        }, this);
        tweenSecondPlatform.start();
        tweenFirstPlatform.start();
        tweenPlayer.start();
    },
    playerIsDead : function () {
        this.player.state = 'dead';
        var text = game.add.bitmapText(400, 300, 'desyrel', 'Scrub Try Again', 64);
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        text.inputEnabled = true;
        text.events.onInputDown.add(function() {
            game.state.restart();
        }, this);
    },
    rectDelete : function () {
        if (introportal == false){
        var startrect = game.add.graphics(0,0);
        var ct = game.time.totalElapsedSeconds();
        var alpha = 1;
        var radius = 1000;
        startrect.beginFill(0x40FF7E,alpha);
        startrect.drawCircle(400,300,radius);
        var scaleloop = game.time.events.loop(Phaser.Timer.SECOND / 100, function() {
            var t = game.time.totalElapsedSeconds() - ct;
            alpha = alpha - 0.005*t*menutimeportal;
            radius = radius - 10*t*menutimeportal;
            if(radius<60){
                alpha = 0;
                game.time.events.remove(scaleloop);
            }
            startrect.clear();
            startrect.beginFill(0x40FF7E,alpha);
            startrect.drawCircle(400,300,radius);
        }, this);
        introportal = true;
        }
    }
};

var Boot = {
    create : function(){   
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.state.start('Load');
    }
}

var Load = {
    preload : function(){
        
        game.stage.backgroundColor = 0xffffff;
        var loadingLabel = game.add.text(400,300,'loading ...',{font: '20px Courier', fill: '#fffff'});

        game.load.image('menuscreen','assets/img/menu.png');    
        game.load.image('menumoon','assets/img/menumoon.png');
        game.load.image('menumountain1','assets/img/menumountain1.png');
        game.load.image('menumountain2','assets/img/menumountain2.png');
        game.load.image('background','assets/img/background.png');
        game.load.image('platform', 'assets/img/platform.png');
        game.load.bitmapFont('desyrel', 'assets/fonts/desyrel.png', 'assets/fonts/desyrel.xml');
        game.load.image('moon', 'assets/img/moon.png');
        game.load.image('mountains1', 'assets/img/mountain1.png');
        game.load.image('mountains2', 'assets/img/mountain2.png');
        game.load.spritesheet('player-idle', '/assets/img/alienstanding.png', 192, 477, 20);
        game.load.spritesheet('player-beam-in', '/assets/img/alienbeam.png', 751, 609, 36);
        game.load.spritesheet('player-beam-out', '/assets/img/man_tele_rück.png', 731, 559, 36);
        game.load.spritesheet('player-fall', '/assets/img/man_fall.png', 68, 100, 2);
        game.load.spritesheet('arrowman', 'assets/img/man_arrowman.png', 36, 60, 2);
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },
    create : function(){
        game.state.start('Menu');
    }
}

var Menu = {
    create : function(){


        game.stage.backgroundColor = 0xffffff;
        
        this.menumoon = this.game.add.tileSprite(0,0,800,600,'menumoon');
        this.menumount1 = this.game.add.tileSprite(0,0,800,600,'menumountain1');
        this.menumount2 = this.game.add.tileSprite(0,0,800,600,'menumountain2');
        
        var menutext = game.add.bitmapText(275, 175, 'desyrel', 'Portalien', 64);

        var startrect = game.add.graphics(0,0);
        startrect.inputEnabled = true;
        startrect.lineStyle(2,0x4669a0);
        startrect.beginFill(0x4669a0,1);
        var radius = 50;
        var alpha = 1;
        startrect.drawCircle(400,300,radius);
        startrect.events.onInputDown.add(function(){
            startrect.clear();
            alpha = 0.5;
            startrect.beginFill(0x40FF7E,alpha);
            startrect.drawCircle(400,300,radius);     
        }, this);
        startrect.events.onInputUp.add(function(){
            var ct = game.time.totalElapsedSeconds();
            var scaleloop = game.time.events.loop(Phaser.Timer.SECOND / 100, function() {
                var t = game.time.totalElapsedSeconds() - ct;
                alpha = alpha + 0.005*t*menutimeportal;
                radius = radius + 10*t*menutimeportal;
                if(radius>1000){
                    alpha = 1;
                    this.startGame();
                    game.time.events.remove(scaleloop);
                }
                startrect.clear();
                startrect.beginFill(0x40FF7E,alpha);
                startrect.drawCircle(400,300,radius);
            }, this);  
        },this);
        var spacekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spacekey.onDown.addOnce(this.startGame,this);
    },
    startGame : function(){
        game.state.start('Play');
    },
    update : function() {
        this.menumoon.tilePosition.x -= 0.05;
        this.menumount1.tilePosition.x -= 0.1;
        this.menumount2.tilePosition.x -= 0.3;
    }
}

var game = new Phaser.Game(800, 600, Phaser.CANVAS, '');

game.state.add('Boot',Boot);
game.state.add('Load',Load);
game.state.add('Menu',Menu);
game.state.add('Play',Play);

game.state.start('Boot');