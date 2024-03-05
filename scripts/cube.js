
const canvas = document.querySelector(".cubeCanvas");
const width = (canvas.width = window.innerWidth / 2);
const height = (canvas.height = window.innerWidth / 2);

const ctx = canvas.getContext("2d");


function matMult(a, b) {  // multiplies matrices A*B
    if (a[0].length != b.length) {  // if not possible
        console.log("invalid matrix dimensions")
        return -1;
    }

    let c = Array.from(Array(a.length), () => new Array(b[0].length));

    for (let j=0;j < a.length;j++) {
        for (let i=0;i < b[0].length;i++) {
            let total = 0;
            for (let n=0;n < b.length;n++) {
                total += a[j][n] * b[n][i];
            }
            c[j][i] = total;
        }
    }

    return c;

}


function proj4(a) {  // literally just drops the w
    let c = [];
    for (let i=0;i < a.length;i++) {
        c.push([
            [a[i][0]], [a[i][1]], [a[i][2]]
        ]);
    }

    return c;
}


function proj(a) {  // uses orthographic projection
    let b = [];
    for (let i=0;i < a.length;i++) {
        let c = [];
        for (let j=0;j < a[0].length - 1;j++) {
            c.push([a[i][j]]);
        }
        b.push(c);
    }

    return b;
}


function perspProj(a) {  // uses weak perspective projection
    let b = [];

    for (let i=0;i < a.length;i++) {
        let c = [];
        for (let j=0;j < a[0].length - 1;j++) {
            c.push([a[i][j] / (a[i][a[0].length - 1] - 1)]);
        }
        b.push(c);
    }

    return b;
}


function rotX(a, angle) {
    let x = [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ];

    return matMult(x, a)
}


function rotY(a, angle) {
    let y = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ];

    return matMult(y, a)
}


function rotZ(a, angle) {
    let z = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ];

    return matMult(z, a)
}

function rotXY(a, angle) {
    let z = [
        [Math.cos(angle), Math.sin(angle), 0, 0],
        [-Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    return matMult(z, a);
}

function rotXZ(a, angle) {
    let z = [
        [Math.cos(angle), 0, -Math.sin(angle), 0],
        [0, 1, 0, 0],
        [Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];

    return matMult(z, a);
}

function rotXW(a, angle) {
    let z = [
        [Math.cos(angle), 0, 0, Math.sin(angle)],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [-Math.sin(angle), 0, 0, Math.cos(angle)]
    ];

    return matMult(z, a);
}

function rotYZ(a, angle) {
    let z = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), Math.sin(angle), 0],
        [0, -Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];

    return matMult(z, a);
}

function rotYW(a, angle) {
    let z = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), 0, -Math.sin(angle)],
        [0, 0, 1, 0],
        [0, Math.sin(angle), 0, Math.cos(angle)]
    ];

    return matMult(z, a);
}

function rotZW(a, angle) {
    let z = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, Math.cos(angle), -Math.sin(angle)],
        [0, 0, Math.sin(angle), Math.cos(angle)]
    ];

    return matMult(z, a);
}


function rotate(mat, axis1, axis2, angle) {  // Rotates any dimension cube about any plane
    let b = [];
    for (let i=0;i < mat.length;i++) {  // creates a unit matrix
        b.push((new Array(mat.length).fill(0)));
        b[i][i] = 1;
    }

    b[axis1][axis1] = Math.cos(angle);
    b[axis1][axis2] = -Math.sin(angle);  // the negative should really change places but it doesn't matter much
    b[axis2][axis2] = Math.cos(angle);
    b[axis2][axis1] = Math.sin(angle);

    return matMult(b, mat);
}


function rotTesseract(mat, a, b, c, d, t) {  // a special combination of rotations to get the tesseract effect
    let z = [
        [Math.cos(a*t+b), Math.sin(a*t+b), 0, 0],
        [-Math.sin(a*t+b), Math.cos(a*t+b), 0, 0],
        [0, 0, Math.cos(c*t+d), -Math.sin(c*t+d)],
        [0, 0, Math.sin(c*t+d), Math.cos(c*t+d)]
    ];

    return matMult(z, mat);
}


function drawPoints(projCube, offset, rad) {  // draws the vertices as points
    ctx.fillStyle = "rgb(255, 255, 255)";

    for (let i=0;i < projCube.length;i++) {
        ctx.beginPath();
        ctx.arc(projCube[i][0][0] + offset, projCube[i][1][0] + offset, rad, 0, 2*Math.PI, true);
        ctx.fill();
    }
}


function slowConnectPoints(c, offset) {  // connects the points. Probably not as efficient as another possible method but it's not that bad
    ctx.strokeStyle = "rgb(255, 255, 255)";

    newC = [];
    for (let i=0;i < c.length;i++) {
        newC.push(addScalar(c[i], offset));
    }

    for (let i=1;i <= dim;i++) {
        drawLine(newC[0], newC[i]);
        drawLine(newC[newC.length-dim+i-2], newC[newC.length-1]);
    }

    // console.log(determineIndex(cube, 2));

    for (let i=1;i < determineIndex(cube, dim-1);i++) {
        for (let j=determineIndex(cube, determineLayer(cube, i)+1);determineLayer(cube, j) === determineLayer(cube, i)+1;j++) {
            if (compareOnes(cube[i], cube[j])) {
                drawLine(newC[i], newC[j]);
            }
        }
    }
}


function compareOnes(a, b) {  // checks if vector b has ones in all the same indices as a. Does not care about extra ones
    let good = true;
    for (let n=0;n < a.length;n++) {
        if ((a[n][0] === 0.5) && (b[n][0] != 0.5)) {
            good = false;
            break;
        }
    }

    return good;
}


function determineLayer(a, index) {  // a layer is defined by me as the number of unit vectors needed to get to a vertex
    let n = 0;
    for (let i=0;i < a[index].length;i++) {
        if (a[index][i][0] === 0.5) {
            n++;
        }
    }

    return n;
}


function determineIndex(a, targetLayer) {  // finds the first index of a point in the desired layer
    for (let i=0;i < a.length;i++) {
        if (determineLayer(a, i) == targetLayer) {
            return i;
        }
    }
    console.log("no index found (from determineIndex)");
    return -1;
}


function drawLine(start, end, width) {
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
}


function addVectors(a, b) {  // only if a and b are same length and 1d
    let c = [];
    for (let i=0;i < a.length;i++) {
        c.push(a[i] + b[i]);
    }

    return c;
}


function addArrays(a) {  // sums the vectors in an array of vectors
    let c = [];
    for (let i=0;i < a.length - 1;i++) {
        c.push(addVectors(a[i], a[i+1]));
    }

    return c;
}


function addScalar(v, k) {
    u = [];
    for (let i=0;i < v.length;i++) {
        u.push(v[i][0] + k);
    }
    return u;
}


function makeIncrArray(size) {  // creates an array to given size that counts from 1 to size
    a = [];
    for (let i=0;i < size;i++) {
        a.push(i + 1);
    }
    return a
}


function createCube(dim) {  // creates the array that represents a cube of almost any given dimension
    c = [new Array(dim).fill(0)];

    for (let i=0;i < dim;i++) {  // adds all unit vectors in dim
        c.push((new Array(dim).fill(0)));
        c[i+1][i] = 1;
    }

    for (let l=2;l <= dim;l++) {  // counts "layers" of the cube(number of vectors being added together)

        let indices = makeIncrArray(l);

        while (indices[0] != dim-l+2) {
            let temp = c[0];  // the zero vector

            for (let index=0;index < l;index++) {  // accumulates the total of all vectors given by the current indices
                temp = addVectors(temp, c[indices[index]]);
            }
            c.push(temp);

            indices[l-1]++;

            //checks if the rightmost index is out of the dimension. If so, shifts index to the left by 1
            //the index to the right is then pulled back to 1 more than the newly shifted index
            //this check and shift repeats down the array from right to left until it can no longer shift
            for (let i=l-1;i > 0;i--) {
                if (indices[i] > dim - (l-1-i)) {
                    indices[i-1]++;
                    for (let j=i;j < l;j++) {
                        indices[j] = indices[j-1] + 1;
                    }
                }
            }
        }
    }

    return c;
}


function transposeVect(v) {  // just turns an array into a "column vector"
    u = [];
    for (let i=0;i < v.length;i++) {
        u.push([v[i]]);
    }
    return u;
}

function transposeArray(a) {  // just makes vectors like column vectors
    b = [];
    for (let i=0;i < a.length;i++) {
        b.push(transposeVect(a[i]));
    }
    return b;
}


function main() {

    let cube3;

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, width, height);

    let tempCube = JSON.parse(JSON.stringify(cube));  // copies the array
    for (let i=dim;i > 4;i--) {
        for (let j=0;j < tempCube.length;j++) {
            tempCube[j] = rotate(tempCube[j], 3, 4, theta/2);
            // tempCube[j] = rotate(tempCube[j], 0, 2, theta);
            // tempCube[j] = rotate(tempCube[j], 1, 3, theta);
            // tempCube[j] = rotate(tempCube[j], 2, 4, -theta/10+1);
            // tempCube[j] = rotate(tempCube[j], 1, 3, theta/10);
        }
        tempCube = perspProj(tempCube);
    }

    if (dim >= 4) {
        let rotCube4 = [];
        for (let i=0;i < tempCube.length;i++) {
            rotCube4.push(rotTesseract(tempCube[i], -2, 3, 2, 1, theta/2));
            // rotCube4[i] = rotate(rotCube4[i], 0, 2, 1);  // XZ
            // rotCube4[i] = rotXW(rotCube4[i], theta/2+1);
            // rotCube4[i] = rotYZ(rotCube4[i], theta*2);
            // rotCube4[i] = rotYW(rotCube4[i], theta);
            // rotCube4[i] = rotZW(rotCube4[i], -theta+1);
        }

        cube3 = perspProj(rotCube4);
    } else {
        cube3 = cube;
    }

    let rotCube = [];
    for (let i=0;i < cube3.length;i++) {
        rotCube.push(rotX(cube3[i], theta/5));
        // rotCube[i] = rotY(rotCube[i], 1/2);
        // rotCube[i] = rotZ(rotCube[i], 1/2);
    }

    let projCube = [];
    for (let i=0;i < rotCube.length;i++) {
        projCube.push(matMult(scale, rotCube[i]));
    }

    drawPoints(projCube, width / 2, 5);
    slowConnectPoints(projCube, width / 2);

    theta += Math.PI / 360;

}


var scale = [  // the two values can be changed from one to scale dimensions
    [width / 4, 0, 0],
    [0, width / 4, 0]
];

var theta = 0;
var dim = 5;

var cube = transposeArray(createCube(dim));
for (let i=0;i < cube.length;i++) {
    for (let j=0;j < cube[i].length;j++) {
        cube[i][j][0] -= 0.5;
    }
}

mainInterval = setInterval(main, 100/6);