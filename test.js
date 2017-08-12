// 引入依赖

var express = require('express')
var moment = require('moment')

var app = express()
var superagent = require('superagent')

/*let redis = require("redis")
let client = redis.createClient(6001, '122.226.180.195', {});

client.on("error", function (err) {
    console.log("Error " + err);
});
var period = ''
client.get("period", function (err, reply) {
    period = reply
    console.log(period)
    client.get("deadline_" + period, function (err, reply) {
        console.log(reply)
        client.quit()
    })
})*/

superagent.get('http://i.sporttery.cn/odds_calculator/get_odd')
    .end(function (err, sres) {

        if (err) {
            console.log(err.status)
            return
        }

        console.log('not')
    })


/*
redis.get('period').then(function (result) {
    console.log(result)
    return redis.get("deadline_" + result)
}).then(function (result) {
    console.log(result)
    return redis.get('period')
}).then(function (result) {
    console.log(result)
    redis.quit()
})
*/






