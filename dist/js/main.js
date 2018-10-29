'use strict'

document.onload = init();

function init() {
    const game = new Game(window.innerWidth, window.innerHeight);
    console.log(game);

    document.body.appendChild(game.canvas);
    window.onkeypress = game.controls;
    window.onmousemove = game.controls;
    game.antialiasing(game.ctx);
    game.render();

    function Game(width, height) {
        // --- properties
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.level = new Level(1);
        this.players = [new Player({
            nickname: 'loydle',
            skin: new Ship(1),
        })];
        this.score = 0;
        this.ennemy = [];
        this.ennemy.push(new Ennemy(1));
        this.explosion = [];
        this.config = {
            game: {
                title: 'Invader',
                version: '0.0.1',
                width: width,
                height: height,
                cheat: {
                    on: false,
                    hitbox: {
                        lineWidth: 4,
                    }
                }
            },
        };

        // --- methods
        this.getLevel = () => {
            return this.level;
        }

        this.setLevel = (int) => {
            this.level = new Level(int);
        }

        this.setScore = (scoreToAdd) => {
            this.score += scoreToAdd;
        };

        this.getScore = () => {
            return this.score;
        };

        this.move = (position) => {
            if (typeof position === 'object') {
                this.players[0].skin.position.x = position.x;
            }
        }

        this.antialiasing =
            (ctx) => {
                // turn off image aliasing
                ctx.msImageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.imageSmoothingEnabled = false;
            };

        this.render =
            () => {
                requestAnimationFrame(this.render);

                this.drawBackgroundImage(
                    this.ctx,
                    this.level,
                );

                this.drawBulletImage(
                    this.ctx,
                    this.players[0],
                );

                this.drawPlayerImage(
                    this.ctx,
                    this.players,
                );

                if (this.getScore() > 0) {
                    this.fillGameInfosText(
                        this.ctx,
                        this.getScore(),
                        50, 130, "bold 30px ING Me", '#00FF00',
                    );
                } else {
                    this.score = 0;
                    this.fillGameInfosText(
                        this.ctx,
                        this.getScore(),
                        50, 130, "bold 30px ING Me", '#FFF');
                }

                this.fillGameInfosText(
                    this.ctx,
                    this.config.game.title + " " + this.config.game.version,
                    50,
                    50,
                    "20px ING Me", '#FFF',
                );

                this.fillGameInfosText(
                    this.ctx,
                    'Level ' + this.getLevel().level,
                    50,
                    80,
                    "20px ING Me", '#FFF',
                );

                this.fillGameInfosSquare(this.ctx, '2', '#ccc', 40, 25, 140, 70);

                // Add Ennemy
                if (
                    (this.ennemy.length <= 0) ||
                    (this.ennemy[this.ennemy.length - 1].position.y > 100)
                ) {
                    this.ennemy.push(new Ennemy(1));
                }

                this.drawEnnemyImage(
                    this.ctx,
                    this.ennemy,
                );

                this.drawExplosionImage(
                    this.ctx,
                    this.explosion,
                );
            };

        this.fillGameInfosSquare =
            (ctx, lineWidth, color, x, y, width, height) => {
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = color;
                ctx.rect(x, y, width, height);
                ctx.stroke();
            }

        this.controls =
            (e) => {
                if (e.type === 'mousemove') {
                    this.move({ x: e.clientX, y: e.clientY });
                }
                switch (e.keyCode || e) {
                    case 32:
                        new Fireball(
                            this.players[0],
                            './img/spritesheets/laser-bolts.png',
                            0, -1000,
                            30,
                            30,
                            10,
                            4,
                        );
                        this.setScore(-10);
                        break;
                    default:
                        break;
                }
            }

        this.drawExplosionImage =
            (ctx, explosion) => {
                if (explosion.length) {
                    explosion.map((ex) => {
                        ex.position.steps[0].x += 16;
                        if (ex.position.steps[0].x >= 200) {
                            explosion.splice(explosion.indexOf(ex), 1);
                        }
                        const img = new Image();
                        img.src = ex.src;
                        img.onload =
                            () => {
                                ctx.drawImage(
                                    img,
                                    ex.position.steps[0].x,
                                    ex.position.steps[0].y,
                                    16,
                                    16,
                                    ex.position.x,
                                    ex.position.y,
                                    80,
                                    80,
                                );
                            }
                    })
                }
            }

        this.fillGameInfosText = (ctx, text, x, y, font, color) => {
            ctx.font = font;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        }

        this.playersHitbox = (ctx, p, config) => {
            if (config.game.cheat.on) {
                ctx.beginPath();
                ctx.lineWidth = config.game.cheat.hitbox.lineWidth;
                ctx.strokeStyle = "#00FF00";
                ctx.rect(
                    p[0].skin.position.x - p[0].skin.position.steps[0].width / 2,
                    p[0].skin.position.y, (p[0].skin.position.steps[0].width * p[0].skin.scale),
                    p[0].skin.position.steps[0].height * p[0].skin.scale
                );
                ctx.stroke();
            }
        }

        this.killEnnemy = (ctx, ennemyArray, en, fireballArray, f, explosion) => {
            var ex = new Explosion(1);
            ex.position.x = en.position.x;
            ex.position.y = en.position.y;
            explosion.push(ex);
            if (en.life <= 0 || en.position.y > window.innerHeight) {
                ennemyArray.splice(ennemyArray.indexOf(en), 1);
                this.setScore(150)
            }
            fireballArray.splice(fireballArray.indexOf(f), 1);
        }

        this.ennemyHitbox = (ctx, ennemy, p, config, ennemyArray, explosion) => {
            var playerTouchedEnnemy = (
                (p[0].skin.position.y <=
                    ennemy.position.y + ennemy.position.steps[0].height &&
                    p[0].skin.position.y >=
                    ennemy.position.y - ennemy.position.steps[0].height) &&
                (p[0].skin.position.x >= ennemy.position.x - ennemy.position.steps[0].width / 2 &&
                    p[0].skin.position.x <= ennemy.position.x + ennemy.position.steps[0].width)
            );

            var fireballHasTouch = p[0].fireballs.filter((f) => {
                return (f.y <= ennemy.position.y + ennemy.position.steps[0].height &&
                        f.y >= ennemy.position.y - ennemy.position.steps[0].height) &&
                    (f.x >= ennemy.position.x - ennemy.position.steps[0].width / 2 &&
                        f.x <= ennemy.position.x + ennemy.position.steps[0].width)
            });

            if (playerTouchedEnnemy || fireballHasTouch[0]) {
                if (fireballHasTouch[0]) {
                    ennemy.life -= 1;
                    this.setScore(50)
                }

                this.killEnnemy(ctx, ennemyArray, ennemy, p[0].fireballs, fireballHasTouch[0], explosion);

                if (playerTouchedEnnemy) {
                    ennemy.life = 0;
                    this.setScore(-500)
                }

                if (config.game.cheat.on) {
                    // hitbox
                    ctx.strokeStyle = "#FF0000";
                }
            } else {
                if (config.game.cheat.on) {
                    // hitbox
                    ctx.strokeStyle = "#00FF00";
                }
            }
            if (config.game.cheat.on) {
                ctx.beginPath();
                ctx.lineWidth = config.game.cheat.hitbox.lineWidth;
                ctx.rect(
                    ennemy.position.x,
                    ennemy.position.y,
                    ennemy.position.steps[0].width,
                    ennemy.position.steps[0].height
                );
                ctx.stroke();
            }
        }

        this.drawPlayerImage =
            (ctx, playersArray) => {
                const img = new Image();
                img.src = playersArray[0].skin.src;
                this.hitbox = this.playersHitbox(ctx, playersArray, this.config)
                img.onload = () => {
                    ctx.drawImage(
                        img,
                        playersArray[0].skin.position.steps[0].x,
                        playersArray[0].skin.position.steps[0].y,
                        playersArray[0].skin.position.steps[0].width,
                        playersArray[0].skin.position.steps[0].height,
                        playersArray[0].skin.position.x - playersArray[0].skin.position.steps[0].width / 2,
                        playersArray[0].skin.position.y,
                        playersArray[0].skin.position.steps[0].width * playersArray[0].skin.scale,
                        playersArray[0].skin.position.steps[0].height * playersArray[0].skin.scale,
                    );
                };
            };

        this.drawEnnemyImage =
            (ctx, ennemy) => {
                ennemy.map((en) => {
                    // Hitbox rectangle
                    this.hitbox = this.ennemyHitbox(
                        ctx,
                        en,
                        this.players,
                        this.config,
                        this.ennemy,
                        this.explosion
                    );


                    if (en.position.y > window.innerHeight) {
                        // remove ennemy if oob
                        ennemy.splice(
                            ennemy.indexOf(en), 1
                        );

                    } else {
                        const img = new Image();
                        img.src = en.src;
                        img.onload = () => {
                            // move sprite
                            en.position.y += en.speed;
                            ctx.drawImage(
                                img,
                                en.position.x,
                                en.position.y,
                                en.position.steps[0].width, en.position.steps[0].height
                            );
                        };
                    }
                });
            };

        this.drawBulletImage =
            (ctx, player) => {
                if (player.fireballs.length) {
                    player.fireballs.map(function(f) {
                        // console.log(f.id)
                        if (f.y < -f.height) {
                            // remove fireball
                            player.fireballs.splice(player.fireballs.indexOf(f), 1);


                        } else {
                            f.y -= f.speed;
                            const img = new Image();
                            img.src = f.src;
                            img.onload = () => {
                                ctx.drawImage(
                                    img,
                                    4,
                                    15,
                                    f.width,
                                    f.height,
                                    f.x - player.skin.position.steps[0].width / 2,
                                    f.y,
                                    f.width * f.scale,
                                    f.height * f.scale
                                );
                            }
                        }
                    })
                }
            }

        this.drawBackgroundImage =
            (ctx, level) => {
                level.background.position.y[0] += level.background.speed;
                // loop
                if (level.background.position.y[0] > 0) {
                    setDefaultBackgroundPosition();
                };
                const img = new Image();
                img.src = level.background.src;
                img.onload = function drawImage() {
                    ctx.drawImage(
                        img,
                        level.background.position.x[0],
                        level.background.position.y[0],
                        level.background.width[0] * level.background.scale,
                        level.background.height[0] * level.background.scale
                    );
                };

                function setDefaultBackgroundPosition() {
                    level.background.position.y[0] = level.background.position.default.y[0];
                };
            };
        console.log(this.players);
    };

    function Player(object) {
        this.nickname = object.nickname;
        this.skin = object.skin;
        this.fireballs = [];
        return this;
    }

    function Fireball(player, src, x, y, width, height, speed, scale) {
        var obj = {
            src: src,
            x: player.skin.position.x - 8,
            y: player.skin.position.y,
            width: 30,
            height: 30,
            speed: 10,
            scale: scale,
            id: getGUID(),
        }
        player.fireballs.push(obj);
        // console.log(player)
    }

    function Ship(int) {
        var ship = {};
        switch (int) {
            case 1:
                ship = new ShipConfig('./img/spritesheets/ship.png',
                    window.innerWidth / 2 - 23, window.innerHeight - 200, [{
                        x: 90,
                        y: 0,
                        width: 46,
                        height: 67,
                    }, {
                        x: 90,
                        y: 0,
                        width: 46,
                        height: 67,
                    }], 1.7)
                break;
            default:
        }

        function ShipConfig(src, startX, startY, steps, scale) {
            return {
                src: src,
                scale: scale,
                position: {
                    x: startX,
                    y: startY,
                    steps: [{
                            x: steps[0].x,
                            y: steps[0].y,
                            width: steps[0].width,
                            height: steps[0].height,
                        },
                        {
                            x: steps[1].x,
                            y: steps[1].y,
                            width: steps[1].width,
                            height: steps[1].height,
                        }
                    ]
                }
            }
        }
        return ship;
    }

    function Level(int) {
        switch (int) {
            case 1:
                return new levelConfig(int, './img/backgrounds/desert-backgorund-looped.png', 256, 608, 6, 2, './img/title-screen-level-1.png');
                break;

            default:
        }
    }

    function levelConfig(level, background, width, height, scale, speed, titleScreen) {
        return {
            level: level,
            background: {
                src: background,
                position: {
                    x: [0, ],
                    y: [0],
                    default: {
                        x: [0, ],
                        y: [-(height) * scale / 2],
                    },
                },
                speed: speed,
                width: [width],
                height: [height],
                scale: scale,
            },
            titleScreen: {
                src: titleScreen
            }
        }
    }

    function Ennemy(int) {
        var ennemy = {};
        switch (int) {
            case 1:
                ennemy = new ennemyConfig('./img/spritesheets/ennemy-1.png',
                    Number((Math.random() * 1000).toFixed(0)), -100, [{
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 100,
                    }], Number(((Math.random() + 1) * 2.2).toFixed(0)), 2, 2);
                break;
            default:
        }

        function ennemyConfig(src, startX, startY, steps, speed, scale, life) {
            return {
                src: src,
                scale: scale,
                speed: speed,
                life: life,
                position: {
                    x: startX,
                    y: startY,
                    steps: [{
                        x: steps[0].x,
                        y: steps[0].y,
                        width: steps[0].width,
                        height: steps[0].height,
                    }]
                }
            }
        }
        return ennemy;
    }

    function Explosion(int) {
        var explosion = {};
        switch (int) {
            case 1:
                explosion = new explosionConfig('./img/spritesheets/explosion.png', 2);
                break;
            default:

        }

        function explosionConfig(src, scale) {
            return {
                src: src,
                scale: scale,
                position: {
                    x: 0,
                    y: 0,
                    steps: [{
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 16,
                    }]
                }
            }
        }
        return explosion;
    }
};

function getGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}