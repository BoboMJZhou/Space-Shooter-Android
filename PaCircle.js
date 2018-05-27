// JavaScript source code
var game = new Phaser.Game(405, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var btn_change, btn_option;
var background;
var backgroundMusic;
var bombSound;
var nameText, scoreText;
var ballNum = 0;
var balls;
var result = 'begin';
var selectedBall = [];
var selectedBall2 = [];
var distanceArray = [];
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

function preload() {

    game.load.spritesheet('rball', 'assets/rball.png', BALL_SIZE, BALL_SIZE);//red
    game.load.spritesheet('oball', 'assets/oball.png', BALL_SIZE, BALL_SIZE);//orange
    game.load.spritesheet('yball', 'assets/yball.png', BALL_SIZE, BALL_SIZE);//yellow
    game.load.spritesheet('gball', 'assets/gball.png', BALL_SIZE, BALL_SIZE);//green
    game.load.spritesheet('bball', 'assets/bball.png', BALL_SIZE, BALL_SIZE);//blue
    game.load.spritesheet('pball', 'assets/pball.png', BALL_SIZE, BALL_SIZE);//purple

    game.load.image('statBar', 'assets/statusbar.png');

    game.load.spritesheet('btn_change', 'assets/buttons/button_sprite_sheet.png', 193, 71);
    game.load.spritesheet('btn_option', 'assets/buttons/plus.png', 200, 200);
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
        //console.log(canClick);
        initPositionArray();
    }, needTime);
}

function ballKilled() {

    if (selectedBall.length > 1) {
        setScore();
        for (var i = 0; i < selectedBall.length ; i++) {
            //console.log("delete : " + " " + selectedBall[i].sprite.position + "\n" + selectedBall[i].sprite.key);
            selectedBall[i].sprite.destroy();
            bombSound.play();
            // Not sure if we need this : balls.remove(selectedBall[i]);
        }
        status_sum += selectedBall.length;
        statusBar.setPercent(status_sum);
        //if (status_sum == 200) {
        //    
        //}

        selectedBall.splice(0, selectedBall.length);
        ballPosition.splice(0, ballPosition.length);
        ballPosition = createArray((game.height / BALL_SIZE) + 1, (game.width / BALL_SIZE) + 1);
        isKill = true;
    }
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
        selectedBall.splice(0, selectedBall.length);
        if(selectedBall[0]===null)
            cleanBall();
        findColor(b);
    }
    else
        ballKilled();
}

function cleanBall() {

    for (var i = 0; i < ballPosition.length; i++)
    {
        for (varj = 0; j < ballPosition[i].length; j++) {
            if (ballPosition[i][j].sprite.body.dirty === true)
                ballPosition[i][j].sprite.body.dirty = false;
        }
    }
}

function click(pointer) {

    var bodie = game.physics.p2.hitTest(pointer.position);
    if (canClick && bodie.length !== 0) {
        console.log(pointer.position + bodie[0].parent.sprite.key);
        ballSelected(bodie[0].parent);
    }
    else
        console.log("CANNOT CLICK NOW");
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

    if (isKill) {
        canClick = false;
        console.log("init in find color");
        initPositionArray();
        //sleep(1000);
        canClick = true;
        isKill = false;
    }
    selectedBall.push(b);
    b.sprite.body.dirty = true;

    var brow = Math.round(b.sprite.world.x / BALL_SIZE);
    var bcol = Math.round((game.height - b.sprite.world.y) / BALL_SIZE);
    console.log(b.sprite.world.x + " " + b.sprite.world.y + "\n" + brow + " " + bcol + " " + b.sprite.key);
    console.log(ballPosition[brow][bcol].sprite.key);
    
    if (isInside(brow - 1, bcol - 1)) {
        if (ballPosition[brow - 1][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol - 1].sprite.body.dirty === false) {
            console.log("--find around "  + brow - 1 + " " + bcol - 1 + " " + ballPosition[brow - 1][bcol - 1].sprite.key);
            findColor(ballPosition[brow - 1][bcol - 1]);
        }
        ballPosition[brow - 1][bcol - 1].sprite.body.dirty = true;
    }
    if (isInside(brow - 1, bcol)){
        if(ballPosition[brow - 1][bcol].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol].sprite.body.dirty === false) {
            console.log("- find around " + brow - 1 + " " + bcol + " " + ballPosition[brow - 1][bcol].sprite.key);
            findColor(ballPosition[brow - 1][bcol]);
        }
        ballPosition[brow - 1][bcol].sprite.body.dirty = true;
    }
    if (isInside(brow - 1, bcol + 1)) {
        if (ballPosition[brow - 1][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow - 1][bcol + 1].sprite.body.dirty === false) {
            console.log("-+find around " + brow - 1 + " " + bcol + 1 + " " + ballPosition[brow - 1][bcol + 1].sprite.key);
            findColor(ballPosition[brow - 1][bcol + 1]);
        }
        ballPosition[brow - 1][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow, bcol + 1)) {
        if (ballPosition[brow][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow][bcol + 1].sprite.body.dirty === false) {
            console.log(" +find around " + brow + " " + bcol + 1 + " " + ballPosition[brow][bcol + 1].sprite.key);
            findColor(ballPosition[brow][bcol + 1]);
        }
        ballPosition[brow][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol + 1)) {
        if (ballPosition[brow + 1][bcol + 1].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol + 1].sprite.body.dirty === false) {
            console.log("++find around " + brow + 1 + " " + bcol + 1 + " " + ballPosition[brow + 1][bcol + 1].sprite.key);
            findColor(ballPosition[brow + 1][bcol + 1]);
        }
        ballPosition[brow + 1][bcol + 1].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol)) {
        if (ballPosition[brow + 1][bcol].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol].sprite.body.dirty === false) {
            console.log("+ find around " + brow + 1 + " " + bcol + " " + ballPosition[brow + 1][bcol].sprite.key);
            findColor(ballPosition[brow + 1][bcol]);
        }
        ballPosition[brow + 1][bcol].sprite.body.dirty = true;
    }
    if (isInside(brow + 1, bcol - 1)) {
        if (ballPosition[brow + 1][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow + 1][bcol - 1].sprite.body.dirty === false) {
            console.log("+-find around " + brow + 1 + " " + bcol - 1 + " " + ballPosition[brow + 1][bcol - 1].sprite.key);
            findColor(ballPosition[brow + 1][bcol - 1]);
        }
        ballPosition[brow + 1][bcol - 1].sprite.body.dirty = true;
    }
    if (isInside(brow, bcol - 1)) {
        if (ballPosition[brow][bcol - 1].sprite.key === b.sprite.key && ballPosition[brow][bcol - 1].sprite.body.dirty === false) {
            console.log(" -find around " + brow + " " + bcol - 1 + " " + ballPosition[brow][bcol - 1].sprite.key);
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
        ballPosition[Math.round(ball.world.x / BALL_SIZE)][Math.round((game.height - ball.world.y) / BALL_SIZE)] = ball.body;
        ballPosition[Math.round(ball.world.x / BALL_SIZE)][Math.round((game.height - ball.world.y) / BALL_SIZE)].sprite.body.dirty = false;
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

function setScore() {

    if (selectedBall.length < 3)
    {
        score = score + 10;
    }
    else
    {
      score = score + selectedBall.length*5;
    }
}

function sleep(milliseconds) {

    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds)
            break;
    }
}