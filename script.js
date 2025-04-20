const boardElement = document.getElementById('board');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const customSettings = document.getElementById('custom-settings');
const mineImageInput = document.getElementById('mineImage');

let rows, cols, mineCount, board = [];
let mineImageURL = null;
let flagsLeft = 0;
let timerInterval;
let seconds = 0;

const mineCounter = document.getElementById('mineCounter');
const timerDisplay = document.getElementById('timer');


difficultySelect.addEventListener('change', () => {
  customSettings.classList.toggle('hidden', difficultySelect.value !== 'custom');
});

mineImageInput.addEventListener('change', () => {
  const file = mineImageInput.files[0];
  if (file) {
    mineImageURL = URL.createObjectURL(file);
  }
});

startBtn.addEventListener('click', () => {
  const difficulty = difficultySelect.value;

  switch (difficulty) {
    case 'beginner':
      rows = 8; cols = 8; mineCount = 10;
      break;
    case 'intermediate':
      rows = 16; cols = 16; mineCount = 40;
      break;
    case 'expert':
      rows = 16; cols = 30; mineCount = 99;
      break;
    case 'custom':
      rows = parseInt(document.getElementById('custom-rows').value);
      cols = parseInt(document.getElementById('custom-cols').value);
      mineCount = parseInt(document.getElementById('custom-mines').value);
      break;
  }

  generateBoard();
  
});
flagsLeft = mineCount;
mineCounter.textContent = flagsLeft;
seconds = 0;
clearInterval(timerInterval);
startTimer();

document.getElementById('resetBtn').addEventListener('click', () => {
    generateBoard(); 
    startTimer();
  });
  
function generateBoard() {
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      revealed: false,
      adjacent: 0,
    }))
  );
  board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      revealed: false,
      adjacent: 0,
      flagged: false
    }))
  );
  

  placeMines();
  calculateAdjacents();
  renderBoard();
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }
}

function calculateAdjacents() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', onCellClick);
      boardElement.appendChild(cell);
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleRightClick(cell, r, c);
      });
      
    }
  }
}

function onCellClick(e) {
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  const cell = board[row][col];
  if (!cell.isMine) {
    checkWin(); 
  }
  

  if (cell.revealed) return;

  cell.revealed = true;
  const div = e.target;
  div.classList.add('revealed');

  if (cell.isMine) {
    div.classList.add('mine');
    if (mineImageURL) {
      const img = document.createElement('img');
      img.src = mineImageURL;
      div.appendChild(img);
    } else {
      div.textContent = '💣';
    }
    alert('¡BOOM! Perdiste, intentalo otra vez');
  } else {
    if (cell.adjacent > 0) {
      div.textContent = cell.adjacent;
    } else {
      revealAdjacent(row, col);
    }
  }
}

function revealAdjacent(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const cell = board[nr][nc];
        const cellDiv = document.querySelector(`[data-row="${nr}"][data-col="${nc}"]`);
        if (!cell.revealed && !cell.isMine) {
          cell.revealed = true;
          cellDiv.classList.add('revealed');
          if (cell.adjacent > 0) {
            cellDiv.textContent = cell.adjacent;
          } else {
            revealAdjacent(nr, nc);
          }
        }
      }
    }
  }
}
function startTimer() {
    clearInterval(timerInterval);
    timerDisplay.textContent = '0';
    seconds = 0;
    timerInterval = setInterval(() => {
      seconds++;
      timerDisplay.textContent = seconds;
    }, 1000);
  }
  function handleRightClick(cellDiv, row, col) {
    const cell = board[row][col];
    if (cell.revealed) return;
    checkWin(); 

  
    if (cell.flagged) {
      cell.flagged = false;
      cellDiv.textContent = '';
      flagsLeft++;
    } else {
      if (flagsLeft === 0) return; 
      cell.flagged = true;
      cellDiv.textContent = '🚩';
      flagsLeft--;
    }
  
    mineCounter.textContent = flagsLeft;
  }
  function checkWin() {
    let correctlyFlagged = 0;
    let revealedSafe = 0;
    let totalSafe = rows * cols - mineCount;
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell.revealed && !cell.isMine) revealedSafe++;
        if (cell.flagged && cell.isMine) correctlyFlagged++;
      }
    }
  
    if (revealedSafe === totalSafe && correctlyFlagged === mineCount) {
      clearInterval(timerInterval);
      alert(`Usted a ganado en ${seconds} Felicidades`);
    }
  }
  document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
  
  
