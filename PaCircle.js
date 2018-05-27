// JavaScript source code
var game = new Phaser.Game(405, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var btn_change, btn_option, btn_setting, btn_question, btn_cancel;
var background;
var backgroundMusic;
var bombSound;
var nameText, scoreText;
var ballNum = 0;
var balls;
var result = 'begin';
var selectedBall = [];
var selectedBall2 = [];
var dis = 'dis';
var score = 0;
var BALL_SIZE = 27;
var ballPosition;
var canClick = false;
var needTime = 13000;
var map;
var isKill = false;
var statusBar;
var status_sum = 0;
var skill = false;

function preload() {

    game.load.spritesheet('rball', 'assets/rball.png', BALL_SIZE, BALL_SIZE);//red
    game.load.spritesheet('oball', 'assets/oball.png', BALL_SIZE, BALL_SIZE);//orange
    game.load.spritesheet('yball', 'assets/yball.png', BALL_SIZE, BALL_SIZE);//yellow
    game.load.spritesheet('gball', 'assets/gball.png', BALL_SIZE, BALL_SIZE);//green
    game.load.spritesheet('bball', 'assets/bball.png', BALL_SIZE, BALL_SIZE);//blue
    game.load.spritesheet('pball', 'assets/pball.png', BALL_SIZE, BALL_SIZE);//purple

    game.load.spritesheet('btn_setting', 'assets/buttons/setting.png', 200, 200);
    game.load.spritesheet('btn_option', 'assets/buttons/sound.png', 200, 200);
    game.load.spritesheet('btn_question', 'assets/buttons/info.png', 200, 200);
    game.load.spritesheet('btn_cancel', 'assets/buttons/cancel.png', 200, 200);
    game.load.spritesheet('btn_change', 'assets/buttons/button_sprite_sheet.png', 193, 71);

    game.load.image('statBar', 'assets/statusbar.png');

    game.load.image('background', 'assets/misc/starfield.jpg');
    game.load.audio('backgroundMusic', ['assets/audio/music.mp3', 'assets/audio/music.ogg']);
    game.load.audio('bombSound', ['assets/audio/BlowBubble.mp3', 'assets/audio/BlowBubble.ogg']);
    game.load.bitmapFont('desyrel', 'assets/fonts/bitmapFonts/desyrel.png', 'assets/fonts/bitmapFonts/desyrel.xml');

}

function create() {

    //general settings
    //@background color, picture
    //@buttons
    //@Score texts
    //@music
    game.stage.backgroundColor = '#182d3b';
    game.stage.disableVisibilityChange = true;
    background = game.add.tileSprite(0, 0, 405, 600, 'background');
    btn_option = game.add.button(0, 0, 'btn_option', onclickSound, this, 0);
    btn_change = game.add.button(game.world.centerX - 95, 405, 'btn_change', actionOnClick, this, 0);
    nameText = game.add.bitmapText(30, 150, 'desyrel', 'Pacircle', 100);
    scoreText = game.add.bitmapText(10, 10, 'desyrel', 'Score: ', 24);
    backgroundMusic = game.add.audio('backgroundMusic', 1, true);
    bombSound = game.add.audio('bombSound', 1, true);
    statusBar = new StatusBar();//status bar
    statusBar.scale.setTo(0.4, 0.4);
    statusBar.setPercent(status_sum);

    if (game.sound.usingWebAudio && game.sound.context.state === 'suspended') {//why???
        game.input.onTap.addOnce(game.sound.context.resume, game.sound.context);
    }
    else
        backgroundMusic.play();
    //physics system
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 1500;
    game.physics.p2.restitution = 0.1;

    ballPosition = createArray((game.height / BALL_SIZE) + 1, (game.width / BALL_SIZE) + 1);
    balls = game.add.physicsGroup(Phaser.Physics.P2JS);
    game.physics.p2.enable(balls, true);
    game.input.onDown.add(click, this);
}

function update() {

    scoreText.text = 'Score: ' + score;
}

function actionOnClick() {

    background.visible = !background.visible;
    btn_change.destroy();
    nameText.destroy();
    game.time.events.repeat(Phaser.Timer.SECOND / 10, 100, createBall, this);
    setTimeout(function () {
        canClick = true;
        initPositionArray();
    }, needTime);
}

function ballKilled() {

    if (selectedBall.length > 1) {
        setScore();
        
        for (var i = 0; i < selectedBall.length ; i++) {
            selectedBall[i].sprite.destroy();
            bombSound.play();
            // Not sure if we need this : balls.remove(selectedBall[i]);
        }
        if (skill) {
            status_sum = 0;
            skill = !skill;
        }
        else {
            status_sum += selectedBall.length*2;
        }
            statusBar.setPercent(status_sum);
        if (status_sum >= 20) {
            console.log(statusBar.bar);
            statusBar.bar.tint = 0x00ff8e;
            skill = true;
        }
        else
            statusBar.bar.tint = 0xffffff;

        selectedBall.splice(0, selectedBall.length);
        ballPosition.splice(0, ballPosition.length);
        ballPosition = createArray((game.height / BALL_SIZE) + 1, (game.width / BALL_SIZE) + 1);
    }
    isKill = true;
}

function ballName(n) {

    switch (n)
    {
        case 0:
            return 'rball';
        case 1:
            return 'oball';
        case 2:
            return 'yball';
        case 3:
            return 'gball';
        case 4:
            return 'bball';
        case 5:
            return 'pball';
        default:
            return 'rball';
    }
}

function ballSelected(b) {

    if (selectedBall[0] !== b)
    {
        for (var i = 0; i < selectedBall.length; i++)
            selectedBall[i].sprite.tint = 0xffffff;
        selectedBall.splice(0, selectedBall.length);
        if (selectedBall[0] === undefined) { cleanBall(); }
        if (!skill)
            findColor(b);
        else
            releaseSkill(b);
    }
    else
        ballKilled();
}

function cleanBall() {

    for (var i = 0; i < ballPosition.length; i++)
    {
        for (var j = 0; j < ballPosition[i].length; j++) {
            if (ballPosition[i][j]!==undefined)
                ballPosition[i][j].sprite.body.dirty = false;
        }
    }
}

function click(pointer) {

    var bodie = game.physics.p2.hitTest(pointer.position);
    if (canClick && bodie.length !== 0) {
        if (isKill)
        {
            canClick = false;
            initPositionArray();
            canClick = true;
            isKill = false;
        }
        ballSelected(bodie[0].parent);
    }
    else
        console.log("CANNOT CLICK");
}

function createArray(col, row) {

    var arr = new Array(Math.floor(row));
    for (var i = 0; i < Math.floor(row) ;i++) {
        arr[i] = new Array(Math.floor(col));
    }
    return arr;
}

function createBall() {

    var x = game.rnd.between(BALL_SIZE, 400 - BALL_SIZE);
    var n = game.rnd.between(0, 5);
    var b = balls.create(x, 100, ballName(n), null, true, ballNum);
    b.body.setCircle(BALL_SIZE / 2);
    b.body.dirty = false;
    ballNum++;
}

function findColor(b)
{
    selectedBall.push(b);
    b.sprite.body.dirty = true;
    b.sprite.tint = 0x000000;

    var brow = Math.round(b.sprite.world.x / BALL_SIZE);
    var bcol = Math.round((game.height - b.sprite.world.y) / BALL_SIZE);
    
    if (isInside(brow - 1, bcol - 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow - 1][bcol - 1].sprite.world.x, ballPosition[brow - 1][bcol - 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow - 1][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol - 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow - 1][bcol - 1]);
        }
        ballPosition[brow - 1][bcol - 1].sprite.body.dirty = true;
    }
    if (isInside(brow - 1, bcol) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow - 1][bcol].sprite.world.x, ballPosition[brow - 1][bcol].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if(ballPosition[brow - 1][bcol].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol].sprite.body.dirty === false) {
            findColor(ballPosition[brow - 1][bcol]);
        }
        ballPosition[brow - 1][bcol].sprite.body.dirty = true;
    }
    if (isInside(brow - 1, bcol + 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow - 1][bcol + 1].sprite.world.x, ballPosition[brow - 1][bcol + 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow - 1][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol + 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow - 1][bcol + 1]);
        }
        ballPosition[brow - 1][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow, bcol + 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow][bcol + 1].sprite.world.x, ballPosition[brow][bcol + 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow][bcol + 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow][bcol + 1]);
        }
        ballPosition[brow][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol + 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow + 1][bcol + 1].sprite.world.x, ballPosition[brow + 1][bcol + 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow + 1][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol + 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow + 1][bcol + 1]);
        }
        ballPosition[brow + 1][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow + 1][bcol].sprite.world.x, ballPosition[brow + 1][bcol].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow + 1][bcol].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol].sprite.body.dirty === false) {
            findColor(ballPosition[brow + 1][bcol]);
        }
        ballPosition[brow + 1][bcol].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol - 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow + 1][bcol - 1].sprite.world.x, ballPosition[brow + 1][bcol - 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow + 1][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol - 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow + 1][bcol - 1]);
        }
        ballPosition[brow + 1][bcol - 1].sprite.body.dirty = true;
    }
    if (isInside(brow, bcol - 1) && Phaser.Math.distance(b.sprite.world.x, b.sprite.world.y, ballPosition[brow][bcol - 1].sprite.world.x, ballPosition[brow][bcol - 1].sprite.world.y) < 3 / 2 * BALL_SIZE) {
        if (ballPosition[brow][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow][bcol - 1].sprite.body.dirty === false) {
            findColor(ballPosition[brow][bcol - 1]);
        }
        ballPosition[brow][bcol - 1].sprite.body.dirty = true;
    }
}

function initPositionArray() {

    canClick = false;
    console.log("start init!");
    //set the position of each ball in balls in array
    balls.forEach(function (ball) {
        var row = Math.floor(ball.world.x / BALL_SIZE);
        var col = Math.floor((game.height - ball.world.y) / BALL_SIZE);
        ball.body.sprite.dirty = false;
        ballPosition[Math.round(ball.world.x / BALL_SIZE)][Math.round((game.height - ball.world.y) / BALL_SIZE)] = ball.body;
    }, this);
    console.log("init over!");

    canClick = true;
}

function isInside(row, col) {

    if (row >= 0 && col >= 0 && row < Math.floor((game.width / BALL_SIZE) + 1) && col < Math.floor((game.height / BALL_SIZE) + 1) && ballPosition[row][col] !== undefined && ballPosition[row][col] !== null) {
        return true;
    }
    return false;
}

function onclickSound() {

    backgroundMusic.mute = !backgroundMusic.mute;
}

function releaseSkill(b){
    
    selectedBall.push(b)

    b.sprite.body.dirty = true;
    b.sprite.tint = 0x000000;

    var bx=b.sprite.world.x;
    var by=b.sprite.world.y;

    var brow = Math.round(b.sprite.world.x / BALL_SIZE);
    var bcol = Math.round((game.height - b.sprite.world.y) / BALL_SIZE);

    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++)
        {
            if (isInside(brow + i, bcol + j) && Phaser.Math.distance(bx, by, ballPosition[brow + i][bcol + j].sprite.world.x, ballPosition[brow + i][bcol + j].sprite.world.y) < 5 / 2 * BALL_SIZE&&(i!==0||j!==0)) {

                ballPosition[brow + i][bcol + j].sprite.tint = 0x000000;
                ballPosition[brow + i][bcol + j].sprite.body.dirty = true;
                selectedBall.push(ballPosition[brow + i][bcol + j]);
            }
        }
    }
}

function setScore() {

    if (selectedBall.length < 3)
    {
        if (skill) {
            score = (score + 10) * 2;
        }
        else
            score = score + 10;
    }
    else
    {
        if (skill) {
            score = (score + selectedBall.length*5)*2;
        }
        else
            score = score + selectedBall.length * 5;
    }
}

function sleep(milliseconds) {

    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds)
            break;
    }
}