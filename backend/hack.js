const readline = require('readline')
const crypto = require('crypto');
const fs = require('fs');

const SALT = 'blah blah blah i love salty food';

const hashify = (plaintext) => 
    crypto.createHash('md5').update(plaintext).digest('hex');

const rl = readline.createInterface({
    input: fs.createReadStream('/usr/share/dict/words'),
    output: process.stdout,
    terminal: false
});

fs.open('rainbow.txt', 'w', function (err, f) {
    rl.on('line', word => {
        fs.writeFile(f, `${hashify(word + SALT)} ${word}\n`, err => {
            if (err) console.log(err);
        })
    })
});


// for (const line of readFileSync("/usr/share/dict/words").toString().split('\n')) {
//     const word = line.trim();
//     if (hashify(word) === known_hash) {
//         console.log(word);
//     }
// }

