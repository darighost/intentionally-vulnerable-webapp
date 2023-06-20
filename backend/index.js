const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const db = new sqlite3.Database(':memory');

db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT
)`);

app.use(bodyParser.json())
app.use(cors())

app.post('/messages', (req, res) => {
    const { message } = req.body;

    // The code below is vulnerable to SQL injection...
    // parameterization
    db.exec(`INSERT INTO chat_messages (message) VALUES ('${message}')`,  (err) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({error: err.message})
        }

        res.json({message});
    })
})

app.get('/messages', (_req, res) => {
    db.all('SELECT message FROM chat_messages', (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: err.message}) 
        }

        res.json(rows);
    })
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
