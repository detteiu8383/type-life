class Cell {
    public isAlive: boolean;

    constructor(alive = false) {
        this.isAlive = alive;
    }

    kill() {
        this.isAlive = false;
    }

    revive() {
        this.isAlive = true;
    }
}

class World {
    public width: number;
    public height: number;
    public cells: Cell[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = [];
        for (let y = 0; y < width; y++) {
            this.cells[y] = [];
            for (let x = 0; x < height; x++) {
                this.cells[y][x] = new Cell();
            }
        }
    }

    public getCell(x: number, y: number): Cell {
        return this.cells[(y + this.height) % this.height][(x + this.width) % this.width];
    }

    public getNeighborsCount(x: number, y: number): number {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }
                let neighbor = this.getCell(x + dx, y + dy);
                if (neighbor.isAlive) {
                    count++;
                }
            }
        }
        return count;
    }

    public update(): Cell[][] {
        let nextCells = [] as Cell[][];
        for (let y = 0; y < this.height; y++) {
            nextCells[y] = [];
            for (let x = 0; x < this.width; x++) {
                let neighborsCount = this.getNeighborsCount(x, y);
                let cell = this.getCell(x, y);
                if (cell.isAlive) {
                    if (neighborsCount === 2 || neighborsCount === 3) {
                        nextCells[y][x] = new Cell(true);
                    } else {
                        nextCells[y][x] = new Cell(false);
                    }
                } else {
                    if (neighborsCount === 3) {
                        nextCells[y][x] = new Cell(true);
                    } else {
                        nextCells[y][x] = new Cell(false);
                    }
                }
            }
        }
        this.cells = nextCells;
        return this.cells;
    }

    public randomize() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() > 0.5) {
                    this.getCell(x, y).revive();
                } else {
                    this.getCell(x, y).kill();
                }
            }
        }
    }
}

class GameCanvas {
    public borderColor: string = "#fafafa";
    public liveColor: string = "#e5eef7";
    public deadColor: string = "#fff";
    public cellSize: number = 10;
    public cellGap: number = 1;

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    constructor(id: string) {
        this._canvas = document.getElementById(id) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    public draw(cells: Cell[][]) {
        const worldWidth = cells[0].length * (this.cellSize + this.cellGap);
        const worldHeight = cells.length * (this.cellSize + this.cellGap);

        const drawX = Math.ceil(this._canvas.width / worldWidth);
        const drawY = Math.ceil(this._canvas.height / worldHeight);

        this._ctx.fillStyle = this.borderColor;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        for (let y = 0; y < drawY; y++) {
            for (let x = 0; x < drawX; x++) {
                this.drawWorld(cells, x * worldWidth, y * worldHeight);
            }
        }
    }

    private drawWorld(cells: Cell[][], offsetX: number, offsetY: number) {
        for (let y = 0; y < cells.length; y++) {
            for (let x = 0; x < cells[y].length; x++) {
                let cell = cells[y][x];
                let xPos = y * (this.cellSize + this.cellGap) + this.cellGap + offsetX;
                let yPos = x * (this.cellSize + this.cellGap) + this.cellGap + offsetY;
                if (cell.isAlive) {
                    this._ctx.fillStyle = this.liveColor;
                } else {
                    this._ctx.fillStyle = this.deadColor;
                }
                this._ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);
            }
        }
    }
}

class LifeGame {
    private _world: World;
    private _canvas: GameCanvas;

    constructor(width: number, height: number, id: string) {
        this._world = new World(width, height);
        this._canvas = new GameCanvas(id);
    }

    public update() {
        let cells = this._world.update();
        this._canvas.draw(cells);
    }

    public randomize() {
        this._world.randomize();
    }
}

function main() {
    const canvas = document.createElement("canvas");
    canvas.id = "background";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";

    resizeCanvas();
    document.body.insertBefore(canvas, document.body.firstChild);

    // create game
    const game = new LifeGame(24, 24, "background");
    game.randomize();

    // update game
    setInterval(() => {
        game.update();
    }, 500);

    // resize canvas
    window.addEventListener("resize", resizeCanvas);

    function resizeCanvas() {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
    }
}

main();
