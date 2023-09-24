import hashlib

known_hash = '69c459dd76c6198f72f0c20ddd3c9447'

with open('/usr/share/dict/words') as words:
    for line in words:
        word = line.lstrip()
        hash = hashlib.md5(word.encode('ascii')).hexdigest()
        print(hash)
        if hash == known_hash:
            print(word)

