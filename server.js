
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './gameData.json';

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    board: Array(9).fill(''),
    scores: { player:0, computer:0, draw:0 }
  }));
}

app.get('/api/game', (req,res)=>{
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

app.post('/api/game', (req,res)=>{
  const { board, scores } = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify({ board, scores }, null, 2));
  res.json({status:'success'});
});

app.listen(PORT, ()=>console.log(`Server running at http://localhost:${PORT}`));
