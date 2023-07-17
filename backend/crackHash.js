const { readFileSync } = require('fs');
const crypto = require('crypto');

const hashify = (plaintext) => 
    crypto.createHash('md5').update(plaintext).digest('hex');

const passwordHash = '1a699ad5e06aa8a6db3bcf9cfb2f00f2';
const wordlistFilepath = '/usr/share/dict/words';

const originalPassword = readFileSync(wordlistFilepath)
    .toString()
    .split('\n')
    .find(word => hashify(word) === passwordHash);

console.log(originalPassword);
