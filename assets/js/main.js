var myState = {
    aimAngularVelocity : (90 / 3),
    aimRangeSpeed : (200 / 3),
    preload :  function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.image('man', 'assets/img/man.png');
        game.load.image('platform', 'assets/img/simpleplatform.png');
        game.load.image('moon', 'assets/img/moon.png');
        game.load.image('mountains', 'assets/img/mountain1.png');
        game.load.spritesheet('crosshair', '/assets/img/circle.png', 50, 50, 6);
        game.load.spritesheet('player-idle', '/assets/img/man_stand.png', 68, 72, 5);
        game.load.spritesheet('player-beam-in', '/assets/img/man_tele_hin.png', 68, 72, 13);
        game.load.spritesheet('player-beam-out', '/assets/img/man_tele_rück.png', 68, 72, 13);
        game.load.spritesheet('player-fall', '/assets/img/man_fall.png', 44, 100, 2);

        game.load.physics('physicsData', 'assets/physics/sprites.json');
    },
    create : function () {
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 0.8;
        game.physics.p2.gravity.y = 300;

        var playerCollisionGroup = game.physics.p2.createCollisionGroup();
        var platformCollisionGroup = game.physics.p2.createCollisionGroup();

        game.physics.p2.updateBoundsCollisionGroup();

        var background = game.add.sprite(0, 0, 'background');
        background.inputEnabled = true;     

        this.moonBack = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('moon').height+75, 
            this.game.width, 
            this.game.cache.getImage('moon').height, 
            'moon'
        );
        
        this.mountainsBack = this.game.add.tileSprite(0, 
            this.game.height - this.game.cache.getImage('mountains').height-75, 
            this.game.width, 
            this.game.cache.getImage('mountains').height, 
            'mountains'
        );

        // Player definieren
        this.player = game.add.sprite(20, 400, 'player-idle');
        game.physics.p2.enable(this.player, true);
        this.player.body.setRectangle(20,68);
        //this.player.body.loadPolygon('physicsData','idle-man');
        this.player.body.setCollisionGroup(playerCollisionGroup);
        this.player.body.gravity.y = 300;

        this.player.animations.add('player-idle');
        this.player.animations.play('player-idle', 24, true);
        
        this.player.body.bounce.y = 0.0;
        this.player.body.collideWorldBounds = true;
        this.inputMode = 'idle'; // angel, radius
        this.crosshair = game.make.sprite('crosshair');
        game.world.add(this.crosshair);
        background.events.onInputDown.add(function() {
            var x = game.input.x;
            var y = game.input.y;
            this.player.loadTexture('player-beam-in', 0);
            var animationOut = this.player.animations.add('beam');
            this.player.animations.play('beam', 50, false);
            animationOut.onComplete.add(function () {
                this.teleport(x, y);
                this.player.loadTexture('player-beam-out');
                var animationIn = this.player.animations.add('beam2');
                this.player.animations.play('beam2', 50, false);
                animationIn.onComplete.add(function () {
                    this.player.loadTexture('player-idle');
                    this.player.animations.play('player-idle', 24, true);
                }, this);
            }, this);
            
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
        var platform = game.add.group();
        platform.enableBody = true;
        platform.physicsBodyType = Phaser.Physics.P2JS;

        var startplatform = platform.create(75,560,'platform');
        startplatform.body.setRectangle(135,31);
        startplatform.body.static = true;
        startplatform.body.setCollisionGroup(platformCollisionGroup);
        startplatform.body.collides(playerCollisionGroup);

        var secondplatform = platform.create(400,300,'platform');
        secondplatform.body.setRectangle(135,31);
        secondplatform.body.static = true;
        secondplatform.body.setCollisionGroup(platformCollisionGroup);
        secondplatform.body.collides(playerCollisionGroup);
        
        this.player.body.collides(platformCollisionGroup);

        this.jumped = false;
    },
    update : function () {
        this.moonBack.tilePosition.x -= 0.05;
        this.mountainsBack.tilePosition.x -= 0.3;
        
        if (!this.jumped && this.player.body.velocity.y > 0.0) {
            this.player.loadTexture('player-fall', 0);
            this.player.animations.add('fall', 2, true);
            this.jumped = true;
        } else if (this.jumped && this.player.body.velocity.y <= 0.1) {
            this.player.loadTexture('player-idle', 0);
            this.player.animations.play('player-idle', 24, true);
            this.jumped = false;
        }
    },
    
    teleport : function(x, y) {
        this.player.x = x;
        this.player.y = y;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
    }
};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', myState);
