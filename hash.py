class HashMap:
    def __init__(self, size=10_000):
        self.size = size
        self.values = [None] * self.size

    def _char_to_number(self, c):
        return ord(c) - 97
    
    def _hash(self, string):
        result = 0

        for index, c in enumerate(string):
            result += self._char_to_number(c) ** (index + 1)
        
        return result % self.size
    
    def set(self, key, value):
        key_index = self._hash(key) 
        if self.values[key_index] is None:
            self.values[key_index] = [[key, value]]
        else:
            pairs = self.values[key_index]

            for pair in pairs:
                if pair[0] == key:
                    pair[1] = value
                    return

            pairs.append([key, value])

    def get(self, key):
        key_index = self._hash(key)
        pairs = self.values[key_index]
        
        for [k, v] in pairs:
            if k == key: return v

hash_map = HashMap()

hash_map.set('love', 'OMG MY FEELIN FUR UUUU')
hash_map.set('fun', 'GOOD TIMES PEOPLE')

print(hash_map.get('fun'))
