const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const { sign } = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const funds = {}

const crypto = require('crypto');
const SALT = 'blah blah blah i love salty food';

const hashify = (plaintext) => 
    crypto.createHash('md5').update(plaintext).digest('hex');


const app = express();
const port = 3000;


const db = new sqlite3.Database(':memory');



const JWT_SECRET = require('crypto').randomBytes(64).toString('hex');

db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userid TEXT,
    amount INT
)`);

function generateAccessToken(data) {
    return sign(data, JWT_SECRET, { expiresIn: '1800s' });
  }

const corsOptions = {
    credentials: true,
    origin: 'http://localhost:3001'
}

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());



// check for JWT
app.use((req, res, next) => {
    next();
  })

app.post('/register', (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    const passHash = hashify(pass + SALT);

    db.run(`INSERT INTO users (username, password) VALUES ('${user}', '${passHash}')`);
    res.redirect('http://localhost:3001/login.html');
})

// this is vulnerable to CSRF. The logout button, should use a CSRF token
app.post('/logout', (req, res) => {
    res.clearCookie("jwt");
    res.redirect('/login.html');
})

app.post('/login_attempt', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    const passHash = hashify(pass + SALT);

    const dbUserPromise = new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users WHERE username='${user}' AND password='${passHash}'`, (err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
    })
    try {
        const dbUser = await dbUserPromise;
        if (!dbUser) {
            res.redirect('http://localhost:3001/login.html');
            return;
        }
        const jwtCookie = generateAccessToken({ user });
        res.cookie('jwt', jwtCookie);
        res.redirect('http://localhost:3001');
    } catch (e) {
        res.redirect('http://localhost:3001/login.html');
    }
})
    

app.post('/messages', async (req, res) => {
    const { message } = req.body;

    db.all('SELECT message FROM chat_messages', (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json(rows);
    })
    // check balance, only post the message if balance is good, otherwise return error status.

    // The code below is vulnerable to SQL injection...
    // parameterization
    db.exec(`INSERT INTO chat_messages (message) VALUES ('${message}')`,  (err) => {
    })
})

app.post('/deposit', (req, res) => {
    const { username, amount } = req.body;

    db.get(`SELECT id FROM users WHERE username='${username}'`, (err, row) => {
        db.exec(`UPDATE users SET amount=${amount} WHERE userid=${row.id}`);
    });
    res.end('ok')
});


app.get('/messages', (_req, res) => {
    db.all('SELECT message FROM chat_messages', (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json(rows);
    })
})

app.post('/spend', (req, res) => {
    const { user  } = req.body;
    funds[user] -= 10;
    console.log(funds)
    res.json({ funds: funds[user] });
})

app.post('/check_funds', (req, res) => {
    const { user  } = req.body;
    if (!funds.hasOwnProperty(user)) {
        funds[user] = 50;
    }

    res.json({funds: funds[user]});
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
