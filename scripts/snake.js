const tilesize = Math.trunc(window.innerWidth / 50);
const size = 15;

const canvas = document.querySelector(".snakeCanvas");
const width = (canvas.width = tilesize * size);
const height = (canvas.height = tilesize * size);

const ctx = canvas.getContext("2d");


class Snake {
    constructor(x, y, dir) {
        this.pos = [x, y];
        this.dir = dir;  // a vector representing the next location
    }

    draw(index) {
        ctx.fillStyle = `rgb(${80 - Math.trunc(40 * Math.cos(index / 10))}, ${80 + Math.trunc(70 * Math.sin(index / 10))}, ${175 + index})`;
        ctx.fillRect(this.pos[0] * tilesize, this.pos[1] * tilesize, tilesize, tilesize);
    }

    update() {
        this.pos[0] += this.dir[0];
        this.pos[1] += this.dir[1];
    }

    checkDead(parts) {
        for (var i=1;i < parts.length;i++) {
            if ((this.pos[0] == parts[i].pos[0]) && (this.pos[1] == parts[i].pos[1])) {
                return true;
            }
        }

        if (!(0 <= this.pos[0] && this.pos[0] < size)) {
            return true;
        } else if (!(0 <= this.pos[1] && this.pos[1] < size)){
            return true;
        }
        
        return false;
    }
}


class Apple {
    constructor(x, y) {
        this.pos = [x, y];
    }

    isEaten(snakeHead) {
        return ((snakeHead.pos[0] == this.pos[0]) && (snakeHead.pos[1] == this.pos[1]));
    }

    draw() {
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(this.pos[0] * tilesize, this.pos[1] * tilesize, tilesize, tilesize);
    }
}


function placeApple(snake) {
    var emptySpots = [];
    var flag;

    for (y = 0;y < size;y++) {
        for (x = 0;x < size;x++) {
            flag = false;
            for (i = 0;i < snake.length;i++) {
                if ((snake[i].pos[0] == x) && (snake[i].pos[1] == y)) {
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                emptySpots.push([x, y]);
            }
        }
    }

    // return a random index from the empty spots array
    return emptySpots[Math.trunc(Math.random() * emptySpots.length)]
}


function drawGrid() {
    var colour;

    for (i=0;i < size;i++) {
        for (j=0;j < size;j++) {
            ((i + j) % 2 === 0) ? colour = "rgb(80, 200, 120)" : colour = "rgb(175, 225, 175)";

            ctx.fillStyle = colour;
            ctx.fillRect(j * tilesize, i * tilesize, tilesize, tilesize);
        }
    }
}


//https://www.w3schools.com/js/js_cookies.asp
function setHighScore(name, value, expDays) {
    const date = new Date();
    date.setTime(date.getTime() + expDays*24*60*60*1000);
    let expires = "expires="+ date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getHighScore(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function initialize(snake) {

    snake.push(new Snake(5, 7, [1, 0]));  // adds head of snake
    snake.push(new Snake(4, 7, snake[0].dir));
    snake.push(new Snake(3, 7, snake[1].dir));

    //add apple
    var applePos = placeApple(snake);
    apple = new Apple(applePos[0], applePos[1]);

    drawGrid();
    snake[0].draw(0);
    apple.draw();

    let cookie = getHighScore("highScore");
    if (cookie != "") {
        document.getElementById("highScoreBox").innerHTML = `High Score: ${cookie}`;
    } else {
        document.getElementById("highScoreBox").innerHTML = "High Score: 0";
    }
    
    document.getElementById("scoreBox").innerHTML = `Score: ${score}`;

}


function mainLoop(snake) {
    var applePos, tailPos, posDiff;

    canMove = true;

    if (go) {

        tailPos = snake[snake.length - 1].pos;

        snake[0].update();
        for (i = snake.length - 1;i > 0;i--) {  // loops backwards excluding 0
            snake[i].update();
            snake[i].dir = snake[i - 1].dir;
        }

        if (dead = snake[0].checkDead(snake)) {  // runs if player has lost

            clearInterval(mainInterval);

            let cookie = getHighScore("highScore");
            if (cookie == "" || score > parseInt(cookie)) {
                document.cookie = setHighScore("highScore", score, 365);
                console.log(getHighScore("highScore"));
            }

        } else if (apple.isEaten(snake[0])) {
            score++;
            posDiff = [
                snake[snake.length - 1].pos[0] - tailPos[0], 
                snake[snake.length - 1].pos[1] - tailPos[1]
            ];
            snake.push(new Snake(tailPos[0], tailPos[1], posDiff));

            //add new apple
            applePos = placeApple(snake);
            apple = new Apple(applePos[0], applePos[1]);
            
            document.getElementById("scoreBox").innerHTML = `Score: ${score}`;
            
        }

    }

    drawGrid();

    for (i = 0;i < snake.length;i++) {
        snake[i].draw(i);
    }
    apple.draw();

}


canvas.addEventListener("keydown", function(event) {
    if (canMove) {
        canMove = false;

        switch(event.keyCode) {  // add buffers
            case 87:  // w
                if (snakeParts[0].dir[1] == 0) {
                    snakeParts[0].dir = [0, -1];
                    go = true;
                }
                break;
            case 65: // a
                if (snakeParts[0].dir[0] == 0) {
                    snakeParts[0].dir = [-1, 0];
                }
                break;
            case 83: // s
                if (snakeParts[0].dir[1] == 0) {
                    snakeParts[0].dir = [0, 1];
                    go = true;
                }
                break;
            case 68: // d
                if (snakeParts[0].dir[0] == 0 || !go) {
                    snakeParts[0].dir = [1, 0];
                    go = true;
                }
                break;
            default:  // if no movement keys are pressed
                canMove = true;
        }
    }

    if (dead && event.keyCode == 32) {  // 32 is spacebar
        snakeParts = [];
        canMove = true;
        go = false;
        dead = false;
        score = 0;

        initialize(snakeParts);

        mainInterval = setInterval(mainLoop, 100, snakeParts);
    }
    
}, false);


var snakeParts = [];
var apple;

var canMove = true;
var go = false;
var dead = false;

var score = 0;

initialize(snakeParts);
document.cookie = "username=John Doe; expires=Thu, 18 Dec 2023 12:00:00 UTC";

mainInterval = setInterval(mainLoop, 100, snakeParts); // 100 is a good fast speed

