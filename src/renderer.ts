const canvas = document.querySelector<HTMLCanvasElement>("#js-canvas");
const relativeWidth = 100;
const relativeHeight = 100;

class Point {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getDist = (p: Point): number => {
        return Math.abs(Math.sqrt(
            Math.pow(p.x - this.x, 2) + 
            Math.pow(p.y - this.y, 2) + 
            Math.pow(p.z - this.z, 2)
        ))
    }

    toRelative = (): Point => {
        let unitWidth = canvas.width / relativeWidth;
        let unitHeight = canvas.height / relativeHeight;
        return new Point((this.x - (canvas.width / 2)) / unitWidth, (this.y - (canvas.height / 2)) / unitHeight)
    }

    toAbsolute = (): Point => {
        let unitWidth = canvas.width / relativeWidth;
        let unitHeight = canvas.height / relativeHeight;
        return new Point((canvas.width / 2) + (this.x * unitWidth), (canvas.height / 2) - (this.y * unitHeight))
    }

    multiplyByMatrix = (matrix: Matrix3): Point => {
        let c0r0 = matrix.array[0], c1r0 = matrix.array[1], c2r0 = matrix.array[2];
        let c0r1 = matrix.array[3], c1r1 = matrix.array[4], c2r1 = matrix.array[5];
        let c0r2 = matrix.array[6], c1r2 = matrix.array[7], c2r2 = matrix.array[8];
        // let resultX = (this.x * c0r0) + (this.y * c0r1) + (this.z * c0r2);
        // let resultY = (this.x * c1r0) + (this.y * c1r1) + (this.z * c1r2);
        // let resultZ = (this.x * c2r0) + (this.y * c2r1) + (this.z * c2r2);
        let resultX = (this.x * c0r0) + (this.y * c1r0) + (this.z * c2r0);
        let resultY = (this.x * c0r1) + (this.y * c1r1) + (this.z * c2r1);
        let resultZ = (this.x * c0r2) + (this.y * c1r2) + (this.z * c2r2);
        return new Point(resultX, resultY, resultZ);
    }
}

class Matrix3 {
    array: number[];
    constructor(array: number[]){
        if (array.length !== 9) throw 'Invalid array';
        this.array = array;
    }

    multiplyMatrices = (matrix: Matrix3) => {
        let col0 = new Point(matrix.array[0], matrix.array[3], matrix.array[6]);
        let col1 = new Point(matrix.array[1], matrix.array[4], matrix.array[7]);
        let col2 = new Point(matrix.array[2], matrix.array[5], matrix.array[8]);
        let result0 = col0.multiplyByMatrix(this);
        let result1 = col1.multiplyByMatrix(this);
        let result2 = col2.multiplyByMatrix(this);
        return new Matrix3([
            result0.x, result1.x, result2.x,
            result0.y, result1.y, result2.y,
            result0.z, result1.z, result2.z
        ]);
    }
}

function drawLine(p1: Point, p2: Point, color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.toAbsolute().x, p1.toAbsolute().y);
    ctx.lineTo(p2.toAbsolute().x, p2.toAbsolute().y);
    ctx.stroke();
}

function drawCircle(p: Point, r: number, color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(p.toAbsolute().x, p.toAbsolute().y);
    // ctx.stroke();
    ctx.arc(p.toAbsolute().x, p.toAbsolute().y, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill()
}

function drawText(p1: Point, text: string, fontSize: string = "20px", color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.font = fontSize + " Verdana";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, p1.toAbsolute().x, p1.toAbsolute().y);
}

function drawCoordinatePlane() {
    //X
    drawLine(new Point(-50, 0), new Point(50, 0))
    //Y
    drawLine(new Point(0, 50), new Point(0, -50))
    
    // X mark
    drawLine(new Point(50, 0), new Point(49, 1))
    drawLine(new Point(50, 0), new Point(49, -1))
    drawText(new Point(48, 2), "X");

    // Y mark
    drawLine(new Point(0, 50), new Point(1, 49))
    drawLine(new Point(0, 50), new Point(-1, 49))
    drawText(new Point(2, 48), "Y");

    let unitWidth = canvas.width / relativeWidth;
    let unitCountX = ((canvas.width / 2) / unitWidth);
    for (let i = 1; i < unitCountX; i++){
        drawLine(new Point(-i, -0.5), new Point(-i, 0.5));
        drawLine(new Point(i, -0.5), new Point(i, 0.5));

        if (i % 5 === 0) {
            drawText(new Point(-i, -1.5), (-i).toString(), "10px")
            drawText(new Point(i, -1.5), (i).toString(), "10px")
        }
    }

    let unitHeight = canvas.height / relativeHeight;
    let unitCountY = ((canvas.height / 2) / unitHeight);
    for (let i = 1; i < unitCountY; i++){
        drawLine(new Point(-0.5, -i), new Point(0.5, -i));
        drawLine(new Point(-0.5, i), new Point(0.5, i));

        if (i % 5 === 0) {
            drawText(new Point(-1.5, -i), (-i).toString(), "10px")
            drawText(new Point(-1.5, i), (i).toString(), "10px")
        }
    }
}

function clearCanvas() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    clearCanvas();
    drawCoordinatePlane();
}


function main() {
    update();
    setInterval(update, 100)

    document.querySelector('#js-clear').addEventListener('click', () => {
        
    })
}

document.addEventListener("DOMContentLoaded", main)