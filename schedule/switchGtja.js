// 引入依赖
var schedule = require('node-schedule')

schedule.scheduleJob('0 0 7 * * *', function () {
    let Redis = require('ioredis');
    let redis = new Redis(6001, '122.226.180.195')
    redis.set("gtja_start", 1)
    redis.quit()
})

schedule.scheduleJob('0 0 21 * * *', function () {
    let Redis = require('ioredis');
    let redis = new Redis(6001, '122.226.180.195')
    redis.set("gtja_start", 0)
    redis.quit()
})