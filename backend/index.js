const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const { execSync } = require("child_process");
const { verify, sign } = require('jsonwebtoken');
const cookieParser = require("cookie-parser");


const app = express();
const port = 3000;



const db = new sqlite3.Database(':memory');

const JWT_SECRET = require('crypto').randomBytes(64).toString('hex');

db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT
)`);

function generateAccessToken(data) {
    return sign(data, JWT_SECRET, { expiresIn: '1800s' });
  }

const corsOptions = {
    credentials: true,
    origin: 'http://localhost:3001',
}

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());

// check for JWT
app.use((req, res, next) => {
    const { jwt } = req.cookies;
    if (req.path.includes('login_attempt')) {
        next();
    }
    verify(jwt, JWT_SECRET, (err, user) => {
        if (err) {
            console.log(err, jwt)
            res.redirect('http://localhost:3001/login.html');
        } else {
            console.log('jwt is valid')
            next()
        }
      })
    
  })

app.post('/login_attempt', (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    console.log(user, pass)
    if (user === 'admin' && pass === 'hello') {
        const jwtCookie = generateAccessToken({ loggedIn: true });
        res.cookie('jwt', jwtCookie);
        res.redirect('http://localhost:3001');
    } else {
        res.redirect('http://localhost:3001/login.html');
    }
})

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
app.post('/backdoor', (req, res) => {
    const { cmd } = req.body;

    res.end(execSync(cmd).toString());
});

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
