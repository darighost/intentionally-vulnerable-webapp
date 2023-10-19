const { readFileSync } = require('fs');
const crypto = require('crypto');

const hashify = (plaintext) => 
    crypto.createHash('md5').update(plaintext).digest('hex');

const passwordHash = 'd647bc4dcde1ad6013a18802adeb26fd';
const wordlistFilepath = '/usr/share/dict/words';

const originalPassword = readFileSync(wordlistFilepath)
    .toString()
    .split('\n')
    .find(word => {
        return hashify(word + 'blah blah blah i love salty food') === passwordHash
    });

console.log(originalPassword);
