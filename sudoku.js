let cellSize = 50;
let sudokuGrid = [];
let userGrid = [];
let feedbackGrid = [];
let selectedCell = { row: -1, col: -1 };
let userMoves = [];
let colors = [];

function setup() {
  let cnv = createCanvas(2 * cellSize * 9 + 80, cellSize * 9 + 40);
  cnv.parent('canvas-holder');
  noLoop();
  generateColors();
  generateNewSudoku();
  userGrid = createUserGrid(sudokuGrid);
  feedbackGrid = createEmptyGrid();
}

function draw() {
  background(255);

  // Left: User's graph-theory visualization
  push();
  translate(20, 20);
  drawEmptyGrid();
  drawColoredCells();
  drawUserPath();
  pop();

  // Right: Playable Sudoku
  push();
  translate(cellSize * 9 + 60, 20);
  drawPlayableGrid(userGrid);
  drawFeedback(feedbackGrid);
  drawSelection();
  pop();
}

// --- Graph-theory visualization ---
function drawEmptyGrid() {
  strokeWeight(2);
  for (let i = 0; i <= 9; i++) {
    stroke(i % 3 === 0 ? 0 : 150);
    line(i * cellSize, 0, i * cellSize, 9 * cellSize);
    line(0, i * cellSize, 9 * cellSize, i * cellSize);
  }
}

function drawColoredCells() {
  for (let move of userMoves) {
    fill(colors[(userGrid[move.row][move.col] || 1)]);
    noStroke();
    rect(move.col * cellSize, move.row * cellSize, cellSize, cellSize);
  }
}

function drawUserPath() {
  stroke(0, 120, 255);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let move of userMoves) {
    vertex(
      move.col * cellSize + cellSize / 2,
      move.row * cellSize + cellSize / 2
    );
  }
  endShape();

  for (let move of userMoves) {
    fill(0, 120, 255);
    noStroke();
    ellipse(
      move.col * cellSize + cellSize / 2,
      move.row * cellSize + cellSize / 2,
      cellSize / 3
    );
  }
}

// --- Playable Sudoku ---
function createUserGrid(solution) {
  let arr = [];
  for (let i = 0; i < 9; i++) {
    arr[i] = [];
    for (let j = 0; j < 9; j++) {
      arr[i][j] = solution[i][j] !== 0 ? solution[i][j] : 0;
    }
  }
  return arr;
}

function createEmptyGrid() {
  let arr = [];
  for (let i = 0; i < 9; i++) arr[i] = Array(9).fill(0);
  return arr;
}

function drawPlayableGrid(gridData) {
  stroke(60, 80, 110);
  for (let i = 0; i < 10; i++) {
    let weight = (i % 3 === 0) ? 4 : 1;
    strokeWeight(weight);
    line(i * cellSize, 0, i * cellSize, 9 * cellSize);
    line(0, i * cellSize, 9 * cellSize, i * cellSize);
  }
  textSize(32);
  textAlign(CENTER, CENTER);
  textFont('Archivo Black, Roboto, Arial, sans-serif');

  // Highlight logic
  let highlightNum = null;
  if (selectedCell.row !== -1 && selectedCell.col !== -1) {
    highlightNum = userGrid[selectedCell.row][selectedCell.col];
  }

  // Draw highlights
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      let isSelected = selectedCell.row === row && selectedCell.col === col;
      let isSameRow = selectedCell.row === row;
      let isSameCol = selectedCell.col === col;
      let isSameNum = highlightNum !== 0 && userGrid[row][col] === highlightNum;

      if (isSelected) {
        fill(180, 210, 255, 180); // Selected cell
        noStroke();
        rect(col * cellSize, row * cellSize, cellSize, cellSize, 8);
      } else if (isSameRow || isSameCol) {
        fill(220, 230, 250, 50); // Row/Col highlight
        noStroke();
        rect(col * cellSize, row * cellSize, cellSize, cellSize, 8);
      } else if (isSameNum && highlightNum !== 0) {
        fill(120, 180, 255, 80); // Matching number highlight
        noStroke();
        rect(col * cellSize, row * cellSize, cellSize, cellSize, 8);
      }
    }
  }

  // Draw numbers
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      let num = gridData[row][col];
      if (num !== 0) {
        if (sudokuGrid[row][col] !== 0) {
          fill(60, 80, 110); // Given numbers
        } else {
          fill(40, 120, 180); // User input
        }
        text(num, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2 + 2);
      }
    }
  }
}

function drawFeedback(feedback) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (feedback[row][col] === 1) {
        noStroke();
        fill(0, 220, 0, 100);
        rect(col * cellSize, row * cellSize, cellSize, cellSize);
      } else if (feedback[row][col] === -1) {
        noStroke();
        fill(220, 0, 0, 100);
        rect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawSelection() {
  if (selectedCell.row !== -1 && selectedCell.col !== -1) {
    stroke(0, 0, 255);
    strokeWeight(3);
    noFill();
    rect(selectedCell.col * cellSize, selectedCell.row * cellSize, cellSize, cellSize);
  }
}

function mousePressed() {
  let offsetX = cellSize * 9 + 60;
  let offsetY = 20;
  if (
    mouseX > offsetX &&
    mouseX < offsetX + 9 * cellSize &&
    mouseY > offsetY &&
    mouseY < offsetY + 9 * cellSize
  ) {
    let col = floor((mouseX - offsetX) / cellSize);
    let row = floor((mouseY - offsetY) / cellSize);
    if (col >= 0 && col < 9 && row >= 0 && row < 9 && sudokuGrid[row][col] === 0) {
      selectedCell = { row, col };
      redraw();
    }
  }
}

function keyPressed() {
  if (selectedCell.row !== -1 && selectedCell.col !== -1) {
    let num = int(key);
    if (num > 0 && num < 10) {
      userGrid[selectedCell.row][selectedCell.col] = num;
      checkEntry(selectedCell.row, selectedCell.col, num);

      let alreadyMoved = userMoves.some(
        m => m.row === selectedCell.row && m.col === selectedCell.col
      );
      if (!alreadyMoved) {
        userMoves.push({ row: selectedCell.row, col: selectedCell.col });
      }
      redraw();
    }
    if (key === 'Backspace' || key === 'Delete' || key === '0') {
      userGrid[selectedCell.row][selectedCell.col] = 0;
      feedbackGrid[selectedCell.row][selectedCell.col] = 0;
      redraw();
    }
  }
}

function checkEntry(row, col, num) {
  if (isValidMove(userGrid, row, col, num)) {
    feedbackGrid[row][col] = 1;
  } else {
    feedbackGrid[row][col] = -1;
  }
}

// --- Sudoku Generation ---
function generateColors() {
  for (let i = 1; i <= 9; i++) {
    colors[i] = color(random(255), random(255), random(255));
  }
}

// --- Valid random Sudoku generator with uniqueness check ---
function generateNewSudoku() {
  sudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillGrid(sudokuGrid);

  let cellsToRemove = 40;
  let attempts = 100;
  while (cellsToRemove > 0 && attempts > 0) {
    let row = floor(random(9));
    let col = floor(random(9));
    if (sudokuGrid[row][col] !== 0) {
      let backup = sudokuGrid[row][col];
      sudokuGrid[row][col] = 0;
      if (countSolutions(copyGrid(sudokuGrid)) !== 1) {
        sudokuGrid[row][col] = backup;
        attempts--;
      } else {
        cellsToRemove--;
      }
    }
  }
}

function fillGrid(grid) {
  let empty = findEmptyCellGen(grid);
  if (!empty) return true;
  let [row, col] = empty;
  let numbers = [1,2,3,4,5,6,7,8,9];
  for (let i = numbers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  for (let num of numbers) {
    if (isSafeGen(grid, row, col, num)) {
      grid[row][col] = num;
      if (fillGrid(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function findEmptyCellGen(grid) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) return [i, j];
    }
  }
  return null;
}

function isSafeGen(grid, row, col, num) {
  for (let j = 0; j < 9; j++) if (grid[row][j] === num) return false;
  for (let i = 0; i < 9; i++) if (grid[i][col] === num) return false;
  let startRow = row - (row % 3), startCol = col - (col % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[startRow + i][startCol + j] === num) return false;
  return true;
}

function copyGrid(grid) {
  return grid.map(row => row.slice());
}

function countSolutions(grid) {
  let empty = findEmptyCellGen(grid);
  if (!empty) return 1;
  let [row, col] = empty;
  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (isSafeGen(grid, row, col, num)) {
      grid[row][col] = num;
      count += countSolutions(grid);
      if (count > 1) break;
      grid[row][col] = 0;
    }
  }
  return count;
}

// --- User Sudoku Validation ---
function isValidMove(gridData, row, col, num) {
  for (let j = 0; j < 9; j++) {
    if (gridData[row][j] === num && j !== col) return false;
  }
  for (let i = 0; i < 9; i++) {
    if (gridData[i][col] === num && i !== row) return false;
  }
  let startRow = row - (row % 3);
  let startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let r = startRow + i;
      let c = startCol + j;
      if (gridData[r][c] === num && (r !== row || c !== col)) return false;
    }
  }
  return true;
}
