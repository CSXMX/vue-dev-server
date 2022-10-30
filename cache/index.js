const LRU = require('lru-cache');
const fs = require('fs');
const root = process.cwd();
const path = require('path');
const stat = require('util').promisify(fs.stat);
let cache = new LRU({
    max: 500,
    length: function (n, key) {
        return n * 2 + key.length
    }
})
let time = {};
exports.tryCache = async function tryCache(key, checkUpdateTime = true) {
    const data = cache.get(key)

    if (checkUpdateTime) {
        const cacheUpdateTime = time[key]
        const fileUpdateTime = (await stat(path.resolve(root, key.replace(/^\//, '')))).mtime.getTime()
        if (cacheUpdateTime < fileUpdateTime) return null
    }

    return data
}

exports.cacheData = function cacheData(key, data, updateTime) {
    const old = cache.peek(key)

    if (old != data) {
        cache.set(key, data)
        if (updateTime) time[key] = updateTime
        return true
    } else return false
}