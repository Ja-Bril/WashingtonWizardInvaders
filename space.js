//board 
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; 
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize*2;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2

let ship = {
    x: shipX,
    y: shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX =tileSize; //ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize *2;
let alienHeight = tileSize*2.5;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets 
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed;

let score = 0;
let gameOver = false;


window.onload = function() {
    board = document.getElementById('board')
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext('2d')


//draw initial ship 
//     context.fillStyle="green";
//     context.fillRect(ship.x, ship.y, ship.width, ship.height)

//load images
  

    shipImg = new Image();
    shipImg.src = './wizards.png'
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)
    }

    alienImg = new Image();
    alienImg.src = './trophy.png'
    createAliens();

    requestAnimationFrame(update)
    document.addEventListener('keydown', moveShip)
    document.addEventListener('keyup', shoot)
}


function drawGameOver() {
    context.fillText(`Game Over!`, boardWidth/2 - tileSize*2, boardHeight/2+tileSize)
    context.fillStyle='red';
    context.fillText(`Days Since Championchip: ${score}`, boardWidth/2 - tileSize*2 -125, boardHeight/2+tileSize*2)
    context.fillStyle='white'
}


function update() {
    requestAnimationFrame(update)
 
    if(gameOver) {
        drawGameOver()
        return;
    }

    context.clearRect(0, 0, board.width, board.height)

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX
            //if alien touches boarders
            if(alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;
                //move aliens up a row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height)
          
            if(alien.y >= ship.y) {
                gameOver = true;
                
            }
        }
    }

    //bullets
    for (let i=0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY
        context.fillStyle = 'white';
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        //bullet collision with aliens
        for (let j = 0; j< alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount --;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift() // removes first element of array
    }

    //next level
    if(alienCount == 0) {
        //increase number of aliens in column and rows by one
        alienColumns= Math.min(alienColumns + 1, columns/2 -2) // cap at 16/2 -2 =6 (at most 6 columns of aliens) to not pass canvas width, divide by 2 cuz each alien width = 2 tile sizes, -2 to guarantee space for alient move left and right
        alienRows = Math.min(alienRows +1, rows-4); //aliens do not exceed up to 4 rows above bottom of canvas, cap at 16-4=12
        alienVelocityX += 0.4; //increase movement speed
        alienArray = [];
        bulletArray=[];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.fillStyle='bold'
    context.font="24px courier";
    context.fillText(score, 5, 20)
}

function moveShip(e) {
    if (gameOver) {
        return;
    }
    if (e.code == 'ArrowLeft' && ship.x - shipVelocityX >= 0){
        ship.x -= shipVelocityX; //move left one tile
    } else if (e.code == 'ArrowRight' && ship.x + shipVelocityX +ship.width <= board.width) {
        ship.x += shipVelocityX //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg, 
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth, 
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length
}

function shoot(e) {
    if (gameOver) {
        return;
    }
    if (e.code =='Space') {
        //shoot
        let bullet = {
            x: ship.x + shipWidth*15/32,
            y: ship.y,
            width: tileSize/8,
            height: tileSize/2,
            used: false
        }
        bulletArray.push(bullet)
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&    //a's top left corner not reach b's top right corner
        a.x + a.width > b.x &&       // a's top right corner passes b's tp left corner
        a.y < b.y + b.height &&      //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y      //a's bottom left corner passes b's top left corner
        }

