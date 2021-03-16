const canvas = document.querySelector<HTMLCanvasElement>("#js-canvas");
const relativeUnitSize = 20;
const enableGrid = true;
const gridColor = "#C0C0C0";

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
        let unitWidth = canvas.width / relativeUnitSize;
        let unitHeight = canvas.height / relativeUnitSize;
        return new Point((this.x - (canvas.width / 2)) / unitWidth, (this.y - (canvas.height / 2)) / unitHeight)
    }

    toAbsolute = (): Point => {
        let unitWidth = canvas.width / relativeUnitSize;
        let unitHeight = canvas.height / relativeUnitSize;
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

    rotate(fi: number, p?: Point) {
        let result: Point = this;
        if (p) {
            result = result.multiplyByMatrix(new Matrix3([
                1, 0, -p.x,
                0, 1, -p.y,
                0, 0, 1
            ]))
        }
        result = result.multiplyByMatrix(new Matrix3([
            Math.cos(fi), -Math.sin(fi), 0,
            Math.sin(fi),  Math.cos(fi), 0,
                        0,            0, 1
        ]))
        if (p) {
            result = result.multiplyByMatrix(new Matrix3([
                1, 0, p.x,
                0, 1, p.y,
                0, 0, 1
            ]))
        }
        return result;
    }

    reflOx() {
        return this.multiplyByMatrix(new Matrix3([
            1,  0, 0,
            0, -1, 0,
            0,  0, 1
        ]))
    }

    reflOy() {
        return this.multiplyByMatrix(new Matrix3([
            -1, 0, 0,
             0, 1, 0,
             0, 0, 1
        ]))
    }

    draw = () => {
        drawCircle(this, .2, true);
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

class Line {
    p1: Point;
    p2: Point;

    constructor(p1: Point, p2: Point) {
        this.p1 = p1;
        this.p2 = p2;
    }

    bresenham(): Point[] {
        let result: Point[] = [];
        let reflOxFlag = false;
        let reflOyFlag = false;
        let rotateFi: number = undefined;

        let p1 = this.p1;
        let p2 = this.p2;
        let p: Point;

        if (Math.abs(p2.x - p1.x) < Math.abs(p2.y - p1.y)){
            let sign = Math.sign(p2.y - p1.y)
            rotateFi = - Math.PI / 2 * sign;
            p2 = p2.rotate(rotateFi, p1);
        }

        // if (p1.y < p2.y){
        //     p1 = p1.reflOx();
        //     p2 = p2.reflOx();
        //     reflOxFlag = true;
        // }

        if (p1.x > p2.x){
            p1 = p1.reflOy();
            p2 = p2.reflOy();
            reflOyFlag = true;
        }

        // line = new Line(p1, p2);

        let x1 = Math.round(p1.x);
        let y1 = Math.round(p1.y);
        let x2 = Math.round(p2.x);
        let y2 = Math.round(p2.y);

        // p = new Point(x1, y1)
        // if (reflOyFlag) p = p.reflOy();
        // if (reflOxFlag) p = p.reflOx();
        // if (rotateFi) p = p.rotate(-rotateFi, p1);
        // result.push(p);

        let deltax = Math.abs(x2 - x1);
        let deltay = Math.abs(y2 - y1);
        let error = 0;
        let deltaerr = deltay;
        let y = y1;
        let diry = Math.sign(y2 - y1);
        for (let x = x1; x < x2; x++){
            console.log(`x = ${x}`);
            console.log(`error raw = ${error}`);
            console.log(`error = ${error / (deltax)}`);
            p = new Point(x, y)
            if (reflOyFlag) p = p.reflOy();
            if (reflOxFlag) p = p.reflOx();
            if (rotateFi) p = p.rotate(-rotateFi, p1);
            result.push(p);
            error += deltaerr;
            if (error * 2 > deltax){
                y += diry;
                error -= deltax;
            }
        }

        // p = new Point(x2, y2)
        // if (reflOyFlag) p = p.reflOy();
        // if (reflOxFlag) p = p.reflOx();
        // if (rotateFi) p = p.rotate(-rotateFi, p1);
        // result.push(p);

        return result;
    }

    draw() {
        this.p1.draw();
        this.p2.draw();
        drawLine(this.p1, this.p2);
    }
}

class Circle {
    p: Point;
    r: number;

    constructor(p: Point, r: number) {
        this.p = p;
        this.r = r;
    }

    bresenham(): Point[] {
        let result: Point[] = [];
        
        let x = 0;
        let y = this.r;
        let delta = 1 - 2 * this.r;
        let error = 0;
        while (y >= 0) {
            result.push(new Point(x, y));
            error = 2 * (delta + y) - 1;
            if ((delta < 0) && (error <= 0)){
                delta += 2 * ++x + 1
                continue
            }
            if ((delta > 0) && (error > 0)){
                delta -= 2 * --y + 1
                continue
            }
            delta += 2 * (++x - --y)
        }
        return result;
    }

    draw() {
        drawCircle(this.p, this.r, false, "#000000");
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

function drawCircle(p: Point, r: number, filled: boolean = false, color: string = "#000000") {
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    // ctx.moveTo(p.toAbsolute().x, p.toAbsolute().y);
    // ctx.stroke();
    let unitHeight = canvas.height / relativeUnitSize;
    ctx.arc(p.toAbsolute().x, p.toAbsolute().y, r*unitHeight, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (filled) ctx.fill()
    else ctx.stroke();
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
    drawLine(new Point(-relativeUnitSize/2, 0), new Point(relativeUnitSize/2, 0))
    //Y
    drawLine(new Point(0, relativeUnitSize/2), new Point(0, -relativeUnitSize/2))
    
    // X mark
    drawLine(new Point(relativeUnitSize/2, 0), new Point(relativeUnitSize/2 - relativeUnitSize/100, relativeUnitSize/100))
    drawLine(new Point(relativeUnitSize/2, 0), new Point(relativeUnitSize/2 - relativeUnitSize/100, -relativeUnitSize/100))
    drawText(new Point(relativeUnitSize/2 - relativeUnitSize/50, relativeUnitSize/50), "X");

    // Y mark
    drawLine(new Point(0, relativeUnitSize/2), new Point(relativeUnitSize/100, relativeUnitSize/2 - relativeUnitSize/100))
    drawLine(new Point(0, relativeUnitSize/2), new Point(-relativeUnitSize/100, relativeUnitSize/2 - relativeUnitSize/100))
    drawText(new Point(relativeUnitSize/50, relativeUnitSize/2 - relativeUnitSize/50), "Y");

    let unitWidth = canvas.width / relativeUnitSize;
    let unitCountX = ((canvas.width / 2) / unitWidth);
    for (let i = 1; i < unitCountX; i++){
        drawLine(new Point(-i, -relativeUnitSize/200), new Point(-i, relativeUnitSize/200));
        drawLine(new Point(i, -relativeUnitSize/200), new Point(i, relativeUnitSize/200));

        if (enableGrid) {
            drawLine(new Point(-i, relativeUnitSize/2), new Point(-i, -relativeUnitSize/2), gridColor)
            drawLine(new Point(i, relativeUnitSize/2), new Point(i, -relativeUnitSize/2), gridColor)
        }

        if (relativeUnitSize >= 50 && i % 5 === 0 || relativeUnitSize < 50) {
            drawText(new Point(-i, -1.5 * relativeUnitSize/100), (-i).toString(), "10px")
            drawText(new Point(i, -1.5 * relativeUnitSize/100), (i).toString(), "10px")
        }
    }

    let unitHeight = canvas.height / relativeUnitSize;
    let unitCountY = ((canvas.height / 2) / unitHeight);
    for (let i = 1; i < unitCountY; i++){
        drawLine(new Point(-relativeUnitSize/200, -i), new Point(relativeUnitSize/200, -i));
        drawLine(new Point(-relativeUnitSize/200, i), new Point(relativeUnitSize/200, i));

        if (enableGrid) {
            drawLine(new Point(-relativeUnitSize/2, -i), new Point(relativeUnitSize/2, -i), gridColor)
            drawLine(new Point(-relativeUnitSize/2, i), new Point(relativeUnitSize/2, i), gridColor)
        }

        if (relativeUnitSize >= 50 && i % 5 === 0 || relativeUnitSize < 50) {
            drawText(new Point(-1.5 * relativeUnitSize/100, -i), (-i).toString(), "10px")
            drawText(new Point(-1.5 * relativeUnitSize/100, i), (i).toString(), "10px")
        }
    }
}

function onVarsUpdate() {
    if (lineAlgorithmTimer) clearInterval(lineAlgorithmTimer);
    if (circleAlgorithmTimer) clearInterval(circleAlgorithmTimer);
    lineUpdate();
    circleUpdate();
}

function lineUpdate() {
    let x1 = parseFloat(document.querySelector<HTMLInputElement>('#js-x1').value)
    let y1 = parseFloat(document.querySelector<HTMLInputElement>('#js-y1').value)
    let x2 = parseFloat(document.querySelector<HTMLInputElement>('#js-x2').value)
    let y2 = parseFloat(document.querySelector<HTMLInputElement>('#js-y2').value)

    if (!(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2))){
        line = new Line(new Point(x1, y1), new Point(x2, y2));
        linePoints = [];
    } else {
        line = undefined;
        linePoints = [];
    }
}

function circleUpdate() {
    let x = parseFloat(document.querySelector<HTMLInputElement>('#js-x').value)
    let y = parseFloat(document.querySelector<HTMLInputElement>('#js-y').value)
    let r = parseFloat(document.querySelector<HTMLInputElement>('#js-r').value)

    if (!(isNaN(x) || isNaN(y) || isNaN(r))){
        circle = new Circle(new Point(x, y), r);
        circlePoints = [];
    } else {
        circle = undefined;
        circlePoints = [];
    }
}

function clearCanvas() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    clearCanvas();
    drawCoordinatePlane();
    if (line) {
        line.draw();
        linePoints.forEach(p => p.draw())
    }
    if (circle) {
        circle.draw();
        circlePoints.forEach(p => p.draw())
    }
}

var line: Line;
var circle: Circle;

var linePoints: Point[] = [];
var circlePoints: Point[] = [];

var lineAlgorithmTimer: NodeJS.Timeout;
var circleAlgorithmTimer: NodeJS.Timeout;

function main() {
    update();
    setInterval(update, 100)

    document.querySelector('#js-clear').addEventListener('click', () => {
        document.querySelector<HTMLInputElement>('#js-x1').value = "";
        document.querySelector<HTMLInputElement>('#js-y1').value = "";
        document.querySelector<HTMLInputElement>('#js-x2').value = "";
        document.querySelector<HTMLInputElement>('#js-y2').value = "";
        document.querySelector<HTMLInputElement>('#js-x').value = "";
        document.querySelector<HTMLInputElement>('#js-y').value = "";
        document.querySelector<HTMLInputElement>('#js-r').value = "";
        onVarsUpdate();
    })

    document.querySelector('#js-start').addEventListener('click', () => {
        if (line) {
            let a = line.bresenham();
            let i = 0;
            if (lineAlgorithmTimer) clearInterval(lineAlgorithmTimer);
            lineAlgorithmTimer = setInterval(() => {
                linePoints.push(a[i]);
                i++;
                if (a.length <= i) clearInterval(lineAlgorithmTimer)
            }, 500)
        }

        if (circle) {
            let a = circle.bresenham();
            let i = 0;
            if (circleAlgorithmTimer) clearInterval(circleAlgorithmTimer);
            circleAlgorithmTimer = setInterval(() => {
                circlePoints.push(new Point(circle.p.x + a[i].x, circle.p.y + a[i].y));
                circlePoints.push(new Point(circle.p.x + a[i].x, circle.p.y - a[i].y));
                circlePoints.push(new Point(circle.p.x - a[i].x, circle.p.y + a[i].y));
                circlePoints.push(new Point(circle.p.x - a[i].x, circle.p.y - a[i].y));
                i++;
                if (a.length <= i) clearInterval(circleAlgorithmTimer)
            }, 500)
        }
    })

    document.querySelectorAll('input').forEach(e => {
        e.addEventListener('input', onVarsUpdate);
    });
}

document.addEventListener("DOMContentLoaded", main)