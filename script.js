
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreEl = document.getElementById('score');
const toggleThemeBtn = document.getElementById('toggleTheme');
const restartBtn = document.getElementById('restart');
const clearScoreBtn = document.getElementById('clearScore');
const easyBtn = document.getElementById('easy');
const mediumBtn = document.getElementById('medium');
const hardBtn = document.getElementById('hard');

let board = Array(9).fill('');
let scores = { player: 0, computer: 0, draw: 0 };
let currentPlayer = 'X';
let aiLevel = 'easy';
let gameOver = false;

// Load game state from backend
async function loadGame() {
  try {
    const res = await fetch('http://localhost:3000/api/game');
    const data = await res.json();
    board = data.board;
    scores = data.scores;
    updateBoard();
    updateScoreboard();
  } catch (err) {
    console.log('Backend not connected. Using default.');
  }
}

// Save game state to backend
async function saveGame() {
  try {
    await fetch('http://localhost:3000/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, scores })
    });
  } catch (err) {
    console.log('Backend not connected.');
  }
}

function updateBoard() {
  boardEl.querySelectorAll('.cell').forEach((cell, idx) => {
    cell.innerText = board[idx];
  });
}

function updateScoreboard() {
  scoreEl.innerText = `You: ${scores.player} | Computer: ${scores.computer} | Draws: ${scores.draw}`;
}

function checkWinner(bd = board) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let combo of winCombos) {
    const [a,b,c] = combo;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
  }
  return bd.includes('') ? null : 'Draw';
}

function aiMove() {
  let move;
  if (aiLevel === 'easy') {
    const empty = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
    move = empty[Math.floor(Math.random()*empty.length)];
  } else if (aiLevel === 'medium') {
    // simple block/win logic
    move = mediumAI();
  } else {
    move = minimax(board, 'O').index;
  }
  board[move] = 'O';
}

function mediumAI() {
  for (let i=0;i<9;i++){
    if (board[i]===''){
      board[i]='O';
      if (checkWinner() === 'O') return i;
      board[i]='';
    }
  }
  for (let i=0;i<9;i++){
    if (board[i]===''){
      board[i]='X';
      if (checkWinner() === 'X') return i;
      board[i]='';
    }
  }
  const empty = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
  return empty[Math.floor(Math.random()*empty.length)];
}

function minimax(newBoard, player) {
  const avail = newBoard.map((v,i)=>v===''?i:null).filter(v=>v!==null);
  const winner = checkWinner(newBoard);
  if (winner==='X') return {score:-10};
  if (winner==='O') return {score:10};
  if (winner==='Draw') return {score:0};

  const moves = [];
  for (let i of avail) {
    const move = {};
    move.index = i;
    newBoard[i] = player;
    const result = minimax(newBoard, player==='O'?'X':'O');
    move.score = result.score;
    newBoard[i]='';
    moves.push(move);
  }
  if (player==='O') {
    return moves.reduce((best,m)=>m.score>best.score?m:best);
  } else {
    return moves.reduce((best,m)=>m.score<best.score?m:best);
  }
}

// Event listeners
boardEl.addEventListener('click', e=>{
  if (!e.target.classList.contains('cell') || gameOver) return;
  const idx = e.target.dataset.index;
  if (board[idx] !== '') return;
  board[idx] = 'X';
  let winner = checkWinner();
  if (!winner) {
    aiMove();
    winner = checkWinner();
  }
  updateBoard();
  if (winner) handleWinner(winner);
});

function handleWinner(winner){
  gameOver = true;
  if (winner==='X') { scores.player++; statusEl.innerText='You Win!'; }
  else if (winner==='O'){ scores.computer++; statusEl.innerText='Computer Wins!'; }
  else { scores.draw++; statusEl.innerText='Draw!'; }
  updateScoreboard();
  saveGame();
}

toggleThemeBtn.addEventListener('click', ()=>document.body.classList.toggle('dark'));

restartBtn.addEventListener('click', ()=>{
  board = Array(9).fill('');
  gameOver = false;
  statusEl.innerText = 'Your Turn';
  updateBoard();
  saveGame();
});

clearScoreBtn.addEventListener('click', ()=>{
  scores = { player:0, computer:0, draw:0 };
  updateScoreboard();
  saveGame();
});

easyBtn.addEventListener('click', ()=>aiLevel='easy');
mediumBtn.addEventListener('click', ()=>aiLevel='medium');
hardBtn.addEventListener('click', ()=>aiLevel='hard');

window.onload = loadGame;
