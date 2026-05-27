const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const rows = 16;
const cols = 16;
const cellSize = 50;
const bombsCount = 32;
const uiHeight = 50;
let flagsPlaced = 0;

let grid = [];
let gameOver = false;
let gameWon = false;

// create grid
for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
        grid[y][x] = {
            bomb: false,
            revealed: false,
            number: 0,
            flagged: false
        };
    }
}

// place bombs
let placed = 0;
while (placed < bombsCount) {
    let x = Math.floor(Math.random() * cols);
    let y = Math.floor(Math.random() * rows);

    if (!grid[y][x].bomb) {
        grid[y][x].bomb = true;
        placed++;
    }
}

// calculate numbers
for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {

        if (grid[y][x].bomb) {

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {

                    let ny = y + dy;
                    let nx = x + dx;

                    if (
                        ny >= 0 && ny < rows &&
                        nx >= 0 && nx < cols &&
                        !grid[ny][nx].bomb
                    ) {
                        grid[ny][nx].number++;
                    }
                }
            }
        }
    }
}

// draw grid
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, uiHeight);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let minesLeft = Math.max(0, bombsCount - flagsPlaced);

    ctx.fillText(`Mines: ${minesLeft}`, 10, uiHeight / 2);

    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const colors = [
    "blue", "green", "red", "purple",
    "maroon", "turquoise", "black", "gray"
    ];
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let cell = grid[y][x];

            // background color
            if (cell.revealed) {
                ctx.fillStyle = "#ccc"; // revealed
            } else {
                ctx.fillStyle = "#888"; // hidden
            }

            ctx.fillRect(
            x * cellSize,
            y * cellSize + uiHeight,
            cellSize,
            cellSize
            );
            ctx.strokeRect(x * cellSize, y * cellSize + uiHeight, cellSize, cellSize);
            
            if (cell.revealed) {
                if (cell.bomb) {
                    ctx.fillStyle = "black";
                    ctx.fillText(
                    "💣", x * cellSize + cellSize / 2, 
                    y * cellSize + uiHeight + cellSize / 2
                    );
                } else if (cell.number > 0) {
                    ctx.fillStyle = colors[cell.number - 1];
                    ctx.fillText(
                        cell.number,
                        x * cellSize + cellSize / 2,
                        y * cellSize + uiHeight + cellSize / 2
                    );
                }
            }

            // draw flag
            if (cell.flagged) {
                ctx.fillStyle = "black";
                ctx.fillText(
                    "🚩",
                    x * cellSize + cellSize / 2,
                    y * cellSize + uiHeight + cellSize / 2
                );
            }
        }
    }
    if (gameOver) {

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";

    if (gameWon) {
        ctx.fillText("You Win!", 400, 400);
    } else {
        ctx.fillText("Game Over", 400, 400);
    }
}
}

// reveal cells (recursive)
function reveal(x, y) {
    let cell = grid[y][x];

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;

    if (cell.number === 0 && !cell.bomb) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                let ny = y + dy;
                let nx = x + dx;

                if (
                    ny >= 0 && ny < rows &&
                    nx >= 0 && nx < cols
                ) {
                    reveal(nx, ny);
                }
            }
        }
    }
}

function checkWin() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            let cell = grid[y][x];

            // if it's NOT a bomb and NOT revealed → not finished
            if (!cell.bomb && !cell.revealed) {
                return;
            }
        }
    }

    gameWon = true;
    gameOver = true;
}

// click handling
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const x = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize);
const y = Math.floor(((e.clientY - rect.top) * scaleY - uiHeight) / cellSize);

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}
    if (y < 0) return;
    if (gameOver) return;
    if (grid[y][x].flagged) return;
    if (grid[y][x].revealed) return;

    if (grid[y][x].bomb) {
        gameOver = true;

        for (let row of grid) {
            for (let cell of row) {
                if (cell.bomb) cell.revealed = true;
            }
        }
    } else {
        reveal(x, y);
        checkWin();
    }

    draw();
});

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const x = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize);
const y = Math.floor(((e.clientY - rect.top) * scaleY - uiHeight) / cellSize);

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}
    if (y < 0) return;

    let cell = grid[y][x];

    if (!cell.revealed) {
        cell.flagged = !cell.flagged;
        if (cell.flagged) {
        flagsPlaced++;
    } else {
        flagsPlaced--;
    }
    }

    draw();
});

function startGame() {

    gameOver = false;
    gameWon = false;

    grid = [];

    // create grid
    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
            grid[y][x] = {
                bomb: false,
                revealed: false,
                number: 0,
                flagged: false
            };
        }
    }

    // place bombs
    let placed = 0;
    while (placed < bombsCount) {
        let x = Math.floor(Math.random() * cols);
        let y = Math.floor(Math.random() * rows);

        if (!grid[y][x].bomb) {
            grid[y][x].bomb = true;
            placed++;
        }
    }

    // calculate numbers
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (grid[y][x].bomb) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        let ny = y + dy;
                        let nx = x + dx;

                        if (
                            ny >= 0 && ny < rows &&
                            nx >= 0 && nx < cols &&
                            !grid[ny][nx].bomb
                        ) {
                            grid[ny][nx].number++;
                        }
                    }
                }
            }
        }
    }

    draw();
}

const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        themeBtn.textContent = "☀️";
    } else {
        themeBtn.textContent = "🌙";
    }
});
