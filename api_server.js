// 引入依赖
var express = require('express')
var moment = require('moment')

var app = express()

app.get('/api/odds', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    let day = moment().format('YYYY-MM-DD')
    client.get("odds_" + day, function (err, reply) {
        res.send(reply)
    });
    client.quit()

}).get('/api/period', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    client.get("period", function (err, reply) {
        res.send(reply)
        client.quit()
    });

}).get('/api/fourteen', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    var period = ''
    client.get("period", function (err, reply) {
        period = reply
        client.get("fourteen_" + period, function (err, reply) {
            res.send(reply)
            client.quit()
        })
    })

}).get('/api/fourteen_prev', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });

    client.get("period", function (err, reply) {
        var period = reply - 1
        client.get("fourteen_" + period, function (err, data) {
            res.send(data)
            client.quit()
        })
    })

}).get('/api/bonus', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    var period = ''
    client.get("period", function (err, reply) {
        period = reply - 1
        client.mget(["bonus_" + period, "ren9_" + period], function (err, reply) {
            let data = {
                fourteen: JSON.parse(reply[0]),
                ren9: JSON.parse(reply[1])
            }
            res.send(data)
            client.quit()
        })
    })

}).get('/api/deadline', function (req, res, next) {
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    var period = ''
    client.get("period", function (err, reply) {
        period = reply
        client.get("deadline_" + period, function (err, reply) {
            res.send(reply)
            client.quit()
        })
    })
}).get('/api/matches', function (req, res, next) {
    let Redis = require('ioredis');
    let redis = new Redis(6001, '122.226.180.195')

    let today = moment().format('YYYY-MM-DD')
    redis.hget('matches_' + today,'data').then(function (result) {
        res.send(result)
    })
    redis.quit()
})

app.listen(1501, function (req, res) {
    console.log('app is running at port 1501');
})