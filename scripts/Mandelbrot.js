const canvas = document.querySelector(".mandelCanvas");
const width = (canvas.width = window.innerWidth / 4);
const height = (canvas.height = window.innerWidth / 4);

const ctx = canvas.getContext("2d");

var canvasPos = canvas.getBoundingClientRect();
var res = 2;
var zoom = 4;
var offsetX = 0;
var offsetY = 0;
var mousePos = [0, 0];

// initial values for a and b
var ca = -0.675;
var cb = 0.315;

var iterations = 50;

var locked = false;
var up = false;
var down = false;
var left = false;
var right = false;
var incrIter = false;
var decrIter = false;
var mandelbrot = true;
var arr_up = false;
var arr_down = false;
var hsv = false;
var brightness = 20;


canvas.addEventListener("mousemove", function(event) {
    mousePos[0] = event.clientX - canvasPos.x;
    mousePos[1] = event.clientY - canvasPos.y;
    if (!locked) {
        ca = mousePos[0] / width;
        ca = ca*2 - 1;
        cb = mousePos[1] / height;
        cb = cb*2 - 1;
    }

    // add to html element here to display ca cb (or somewhere else)
}, false);

canvas.addEventListener("mousedown", function(event) {
    locked = !locked;

}, false);

canvas.addEventListener("wheel", function(event) {
    event.deltaY < 0 ? zoom *= 0.9 : zoom *= 1.1;

}, false);

canvas.addEventListener("keydown", function(event) {
    switch(event.keyCode) {
        case 87:  // w
            up = true;
            break;
        case 65: // a
            left = true;
            break;
        case 83: // s
            down = true;
            break;
        case 68: // d
            right = true;
            break;
        case 69: // e
            incrIter = true;
            break;
        case 81: // decrIter
            decrIter = true;
            break;
        case 32: // space
            iterations = 50;
            break;
        case 67: // c
            if (res > 1) {
                res--;
            }
            break;
        case 88: // x
            res++;
            break;
        case 77: // m
            mandelbrot = !mandelbrot;
            ca = -0.675;
            cb = 0.315;
            break;
        case 38:
            arr_up = true;
            break;
        case 40:
            arr_down = true;
            break;
    }

}, false);

canvas.addEventListener("keyup", function(event) {
    switch(event.keyCode) {
        case 87:  // w
            up = false;
            break;
        case 65: // a
            left = false;
            break;
        case 83: // s
            down = false;
            break;
        case 68: // d
            right = false;
            break;
        case 69: // e
            incrIter = false;
            break;
        case 81: // decrIter
            decrIter = false;
            break;
        case 38:
            arr_up = false;
            break;
        case 40:
            arr_down = false;
            break;
    }

}, false);


// does log base 2
function log2(n) {
    return Math.log(n) / Math.log(2);
}


function main() {
    let a;
    let b;
    let aa;
    let bb;

    let h;
    let s = 1;
    let v;

    let m;
    let c;
    let z;

    let red = 0;
    let green = 0;
    let blue = 0;
    let colour;

    if (up) {
        offsetY += 0.01 * zoom;
    }
    if (left) {
        offsetX += 0.01 * zoom;
    }
    if (down) {
        offsetY -= 0.01 * zoom;
    }
    if (right) {
        offsetX -= 0.01 * zoom;
    } 
    if (incrIter) {
        iterations++;
    }
    if (decrIter && iterations > 0) {
        iterations--;
    }
    if (arr_up) {
        zoom *= 0.9;
    } else if (arr_down) {
        zoom *= 1.1;
    }

    for (let x=0;x < width / res;x++) {
        for (let y=0;y < height / res;y++) {
            v = 1;

            a = zoom * (x * res / width - 0.5) - offsetX;
            b = zoom * (y * res / height - 0.5) - offsetY;

            if (mandelbrot) {
                ca = a;
                cb = b;
            }

            let n;
            for (n=0; n < iterations;n++) {
                aa = a*a - b*b;
                bb = 2*a*b;

                a = aa + ca;
                b = bb + cb;

                if (Math.abs(a + b) > 2) {
                    break;
                }
            }

            if (hsv) {
                if (n == iterations) {
                    v = 0;
                }

                h = n + 1 - Math.log(log2(n));
                if (h >= 360) {
                    h -= 360;
                }

                c = v*s;
                z = c * (1 - Math.abs((h / 60) % 2 - 1));
                m = Math.abs(v - c);

                if (0 <= h && h < 60) {
                    red = c;
                    green = z;
                    blue = 0;
                } else if (60 <= h && h < 120) {
                    red = z;
                    green = c;
                    blue = 0;
                } else if (120 <= h && h < 180) {
                    red = 0;
                    green = c;
                    blue = z;
                } else if (180 <= h && h < 240) {
                    red = 0;
                    green = z;
                    blue = c;
                } else if (240 <= h && h < 300) {
                    red = z;
                    green = 0;
                    blue = c;
                } else if (300 <= h && h < 360) {
                    red = c;
                    green = 0;
                    blue = z;
                }

                colour = `rgb(${(red + m) * 255}, ${(green + m) * 255}, ${(blue + m) * 255})`;

            } else {
                n += brightness;
                if (n >= iterations) {
                    n = 0;
                }
                colour = `rgb(${n / iterations * 255}, ${n / iterations * 255/2}, ${n / iterations * 255/3})`;
            }
            ctx.fillStyle = colour;
            ctx.fillRect(x * res, y * res, res, res);
        }
    }

}

mainInterval = setInterval(main, 100/12);